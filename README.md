<div align="center">

# 📍 Workpin

### **Find work. Hire help. Nearby.**

A modern, mobile-first platform that connects **Workers** with **Clients** through real-time, location-based job matching.

[![Next.js](https://img.shields.io/badge/Next.js_16-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Mapbox](https://img.shields.io/badge/Mapbox-000000?style=for-the-badge&logo=mapbox&logoColor=white)](https://mapbox.com/)

</div>

---

## ✨ What is Workpin?

Workpin bridges the gap between people who need help and skilled workers nearby — all on a single, intuitive map interface. Whether you need an electrician, a plumber, or general help, Workpin makes finding and hiring effortless.

<div align="center">

| 👷 For Workers | 💼 For Clients |
|:---|:---|
| Browse jobs near you on a map | Post jobs in seconds |
| Apply with one tap | Review worker profiles & ratings |
| Chat directly with clients | Accept the best candidate |
| Get rated & build reputation | Rate workers after completion |

</div>

---

## 🚀 Features

<table>
<tr>
<td width="50%">

### 🗺️ Map-First Discovery
Interactive Mapbox map showing jobs/workers with distance labels, radius control (1–50 km), and seamless map ↔ list toggle.

### 🌐 Multi-Language (4 Languages)
Instant switching between **English**, **తెలుగు**, **हिन्दी**, and **தமிழ்** — with a prominent language switcher, not hidden in settings.

### 💬 Real-Time Chat
Supabase Realtime-powered messaging between worker & client, activated only after a request is accepted.

</td>
<td width="50%">

### 🔐 Role-Based Auth
Clean sign-up with Worker/Client role selection. Session persistence via Supabase Auth — no email verification needed.

### ⭐ Ratings & Reviews
1–5 star rating system with optional comments. Worker ratings are auto-averaged via database triggers.

### 🌙 Dark Mode
System-aware dark/light theme toggle with smooth transitions across all components.

</td>
</tr>
</table>

### And More...

- 📱 **Mobile-first** bottom navigation + desktop sidebar
- 🔄 **Auto-reject** — accepting one worker automatically rejects all others
- 📞 **Click-to-call** on job detail pages
- � **Mock payments** (UPI / Cash simulation)
- 🔔 **Toast notifications** for all key actions
- 🏷️ **Job categories:** Electrical, Plumbing, Cleaning, Delivery, Carpenter, General Help
- 🟢 **Availability toggle** for workers (Available / Busy)

---

## 🛠️ Tech Stack

| Layer | Technology |
|:------|:-----------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4 + shadcn/ui |
| **Backend** | Supabase (Auth, PostgreSQL, Realtime) |
| **Maps** | Mapbox GL JS |
| **Icons** | Lucide React |
| **Toasts** | Sonner |
| **Themes** | next-themes |

---

## 📂 Project Structure

```
src/
├── app/
│   ├── (app)/              # Authenticated routes
│   │   ├── page.tsx        # 🗺️  Map home screen
│   │   ├── activity/       # 📋  Pending / Accepted / Rejected
│   │   ├── chat/           # 💬  Chat list + rooms
│   │   ├── jobs/[id]/      # 📄  Job detail
│   │   ├── post-job/       # ✏️  Create a job (clients)
│   │   └── profile/        # 👤  User profile
│   ├── (auth)/             # Public auth routes
│   │   ├── login/          # 🔑  Sign in
│   │   └── signup/         # 📝  Sign up + role selection
│   └── layout.tsx          # Root layout + providers
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── nav/                # Header, Sidebar, Bottom Nav
│   ├── map/                # MapView, ListView, LocationPrompt
│   ├── jobs/               # JobCard, ApplyDialog
│   ├── ratings/            # RateDialog (1-5 stars)
│   └── payment/            # PaymentDialog (mock)
├── lib/
│   ├── supabase/           # Client, Server, Middleware
│   ├── i18n/               # Translation context
│   ├── types.ts            # TypeScript interfaces
│   └── geo.ts              # Haversine distance
├── locales/                # en.json, te.json, hi.json, ta.json
└── middleware.ts           # Auth protection
```

---

## ⚡ Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Mapbox](https://mapbox.com) account (free tier works)

### 1️⃣ Clone & Install

```bash
git clone https://github.com/manoj0007-oss/workpin.git
cd workpin
npm install
```

### 2️⃣ Configure Environment

Create `.env.local` in the root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your-mapbox-token
```

### 3️⃣ Set Up Database

Open **Supabase Dashboard → SQL Editor** → paste contents of [`supabase/schema.sql`](supabase/schema.sql) → **Run**

### 4️⃣ Disable Email Verification

**Supabase Dashboard → Authentication → Settings → Email Auth** → Uncheck *"Confirm email"*

### 5️⃣ Run

```bash
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** 🎉

---

## 🌍 Deploy to Vercel

1. Push your repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) → Import `workpin`
3. Add the 3 environment variables
4. Click **Deploy** — done!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/manoj0007-oss/workpin)

---

## 🗄️ Database Schema

```
profiles ──┐
           ├── jobs ──── requests ──── messages
           │                │
           └── ratings ─────┘
```

| Table | Purpose |
|:------|:--------|
| `profiles` | User data, role, location, availability, rating |
| `jobs` | Posted jobs with location, pay, category, status |
| `requests` | Worker applications (pending → accepted/rejected) |
| `messages` | Real-time chat messages per accepted request |
| `ratings` | 1–5 star ratings with optional comments |

**Triggers:** Auto-reject other requests on acceptance · Auto-update worker rating average · Auto-create profile on signup

---

## 📄 License

MIT — free to use, modify, and distribute.

---

<div align="center">

**Built with ❤️ for connecting communities**

</div>
