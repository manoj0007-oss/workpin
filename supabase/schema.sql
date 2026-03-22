-- ============================================================
-- Workpin Database Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES
-- ============================================================
create table public.profiles (
    id uuid references auth.users on delete cascade primary key,
    role text not null check (role in ('worker', 'client')),
    full_name text not null default '',
    phone text not null default '',
    avatar_url text,
    lat double precision,
    lng double precision,
    is_available boolean not null default false,
    rating_avg double precision not null default 0,
    rating_count integer not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone" on public.profiles for
select using (true);

create policy "Users can insert their own profile" on public.profiles for
insert
with
    check (auth.uid () = id);

create policy "Users can update their own profile" on public.profiles for
update using (auth.uid () = id);

-- ============================================================
-- JOBS
-- ============================================================
create table public.jobs (
    id uuid default uuid_generate_v4 () primary key,
    client_id uuid references public.profiles (id) on delete cascade not null,
    title text not null,
    description text not null default '',
    pay text not null default '',
    category text not null check (
        category in (
            'electrical',
            'plumbing',
            'cleaning',
            'delivery',
            'carpenter',
            'general'
        )
    ),
    lat double precision not null,
    lng double precision not null,
    status text not null default 'open' check (
        status in (
            'open',
            'in_progress',
            'completed',
            'cancelled'
        )
    ),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.jobs enable row level security;

create policy "Jobs are viewable by everyone" on public.jobs for
select using (true);

create policy "Clients can create jobs" on public.jobs for
insert
with
    check (auth.uid () = client_id);

create policy "Clients can update their own jobs" on public.jobs for
update using (auth.uid () = client_id);

create policy "Clients can delete their own jobs" on public.jobs for delete using (auth.uid () = client_id);

-- ============================================================
-- REQUESTS
-- ============================================================
create table public.requests (
    id uuid default uuid_generate_v4 () primary key,
    job_id uuid references public.jobs (id) on delete cascade not null,
    worker_id uuid references public.profiles (id) on delete cascade not null,
    message text default '',
    status text not null default 'pending' check (
        status in (
            'pending',
            'accepted',
            'rejected'
        )
    ),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.requests enable row level security;

create policy "Requests viewable by involved parties" on public.requests for
select using (
        auth.uid () = worker_id
        or auth.uid () in (
            select client_id
            from public.jobs
            where
                id = job_id
        )
    );

create policy "Workers can create requests" on public.requests for
insert
with
    check (auth.uid () = worker_id);

create policy "Job owner can update requests" on public.requests for
update using (
    auth.uid () in (
        select client_id
        from public.jobs
        where
            id = job_id
    )
);

-- ============================================================
-- MESSAGES (Chat)
-- ============================================================
create table public.messages (
    id uuid default uuid_generate_v4 () primary key,
    request_id uuid references public.requests (id) on delete cascade not null,
    sender_id uuid references public.profiles (id) on delete cascade not null,
    content text not null,
    created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

create policy "Messages viewable by chat participants" on public.messages for
select using (
        auth.uid () in (
            select worker_id
            from public.requests
            where
                id = request_id
            union
            select j.client_id
            from public.jobs j
                join public.requests r on r.job_id = j.id
            where
                r.id = request_id
        )
    );

create policy "Chat participants can send messages" on public.messages for
insert
with
    check (
        auth.uid () = sender_id
        and auth.uid () in (
            select worker_id
            from public.requests
            where
                id = request_id
            union
            select j.client_id
            from public.jobs j
                join public.requests r on r.job_id = j.id
            where
                r.id = request_id
        )
    );

-- ============================================================
-- RATINGS
-- ============================================================
create table public.ratings (
    id uuid default uuid_generate_v4 () primary key,
    job_id uuid references public.jobs (id) on delete cascade not null,
    rater_id uuid references public.profiles (id) on delete cascade not null,
    rated_id uuid references public.profiles (id) on delete cascade not null,
    score integer not null check (
        score >= 1
        and score <= 5
    ),
    comment text default '',
    created_at timestamptz not null default now()
);

alter table public.ratings enable row level security;

create policy "Ratings viewable by everyone" on public.ratings for
select using (true);

create policy "Users can create ratings" on public.ratings for
insert
with
    check (auth.uid () = rater_id);

-- ============================================================
-- Function: Auto-reject other requests when one is accepted
-- ============================================================
create or replace function public.handle_request_accepted()
returns trigger as $$
begin
  if NEW.status = 'accepted' and OLD.status = 'pending' then
    -- Reject all other pending requests for the same job
    update public.requests
    set status = 'rejected', updated_at = now()
    where job_id = NEW.job_id
      and id != NEW.id
      and status = 'pending';

    -- Update job status to in_progress
    update public.jobs
    set status = 'in_progress', updated_at = now()
    where id = NEW.job_id;
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

create trigger on_request_accepted
  after update on public.requests
  for each row execute function public.handle_request_accepted();

-- ============================================================
-- Function: Update worker rating average
-- ============================================================
create or replace function public.handle_new_rating()
returns trigger as $$
begin
  update public.profiles
  set
    rating_avg = (
      select coalesce(avg(score), 0) from public.ratings where rated_id = NEW.rated_id
    ),
    rating_count = (
      select count(*) from public.ratings where rated_id = NEW.rated_id
    ),
    updated_at = now()
  where id = NEW.rated_id;
  return NEW;
end;
$$ language plpgsql security definer;

create trigger on_new_rating
  after insert on public.ratings
  for each row execute function public.handle_new_rating();

-- ============================================================
-- Function: Auto-create profile on user signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role, full_name, phone)
  values (
    NEW.id,
    coalesce(NEW.raw_user_meta_data->>'role', 'worker'),
    coalesce(NEW.raw_user_meta_data->>'full_name', ''),
    coalesce(NEW.raw_user_meta_data->>'phone', '')
  );
  return NEW;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Realtime: Enable for messages table
-- ============================================================
alter publication supabase_realtime add table public.messages;

alter publication supabase_realtime add table public.requests;