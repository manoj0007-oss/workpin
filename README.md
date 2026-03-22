# Workpin

A location-based platform connecting **Workers** (job seekers) and **Clients** (job posters).

## Tech Stack

- **Frontend:** Next.js 16 (App Router) + TypeScript
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Backend:** Supabase (Auth, Database, Realtime)
- **Map:** Mapbox GL JS
- **Localization:** English, Telugu, Hindi, Tamil

## Features

- 🗺️ Map-based job discovery with distance labels
- 👷 Worker flow: browse, filter, and apply for nearby jobs
- 💼 Client flow: post jobs, review and accept/reject workers
- 💬 Real-time chat (Supabase Realtime) after request acceptance
- ⭐ Rating system (1–5 stars)
- 🌙 Dark/Light mode
- 🌐 4-language support with instant switching
- 📱 Mobile-first design with bottom navigation

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/manoj0007-oss/workpin.git
cd workpin
npm install
```

### 2. Set up environment

Create a `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-public-token
```

### 3. Run the database schema

Paste the contents of `supabase/schema.sql` into your Supabase SQL Editor and run it.

### 4. Disable email verification

In Supabase Dashboard → Authentication → Settings → Email Auth → uncheck "Confirm email".

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

1. Push to GitHub
2. Import the repo on [vercel.com](https://vercel.com)
3. Add the three environment variables in Vercel project settings
4. Deploy

## License

MIT
