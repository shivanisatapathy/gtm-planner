# GTM Project Planner — Setup Guide

A real-time shared GTM project tracker. Changes sync live across all open browser tabs and devices via Supabase.

---

## Quick start (no Supabase — local only)

```bash
npm install
npm run dev
```

Open http://localhost:5173 — the app runs entirely in localStorage. Data is local to your browser and won't sync to other devices.

---

## Full setup with real-time sync (Supabase)

### 1. Create a free Supabase account

Go to **https://supabase.com** → Sign up → Create a new project.

Pick a name (e.g. `gtm-planner`), choose a region close to you, set a database password. Wait ~2 minutes for it to provision.

### 2. Run the database migration

In your Supabase project dashboard:

1. Click **SQL Editor** in the left sidebar
2. Click **New query**
3. Copy and paste the contents of `supabase/migrations/001_initial.sql`
4. Click **Run**

This creates the `projects` and `custom_tabs` tables, enables Row Level Security with open policies (suitable for an internal shared tool), and enables real-time for both tables.

### 3. Get your API credentials

In your Supabase project dashboard:

1. Click **Project Settings** (gear icon) → **API**
2. Copy the **Project URL** (looks like `https://xxxxxxxxxxxx.supabase.co`)
3. Copy the **anon / public key** (the long `eyJ...` string)

### 4. Create your local env file

In the repo root, create a file called `.env.local`:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Optionally add your Anthropic API key to enable the AI "lateral idea" card in the Ops Weekly Brief:

```bash
VITE_ANTHROPIC_API_KEY=sk-ant-your-key-here
```

> **Note:** The Anthropic key is used directly from the browser. This is fine for a private internal tool — don't deploy this publicly with a real key.

### 5. Run the app

```bash
npm install   # skip if you already ran this
npm run dev
```

Open http://localhost:5173 — you'll see a **"Live"** indicator in the top bar when Supabase is connected. Any change made in one browser window will sync to all other open windows within a second.

---

## Sharing with your team

To share the planner across devices:

**Option A — deploy to Vercel (recommended)**

```bash
npm run build
npx vercel --prod
```

Set the three environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and optionally `VITE_ANTHROPIC_API_KEY`) in the Vercel project settings.

**Option B — deploy anywhere static**

Run `npm run build`. The `dist/` folder is a plain static site — upload it to Netlify, Cloudflare Pages, S3, or any static host. Set the same environment variables in your hosting provider.

---

## Identity model

The app uses name-only identity (no passwords). Enter your name to sign in.

- **Shivani** — owner access: full edit rights on all projects
- Anyone else — viewer access: read-only, can add comments

---

## Project structure

```
src/
  App.jsx          — App shell, context, TopBar, TabsNav
  data.js          — constants, helpers (computeScore, fmtDate, etc.)
  main.jsx         — React entry point
  styles.css       — Tailwind + custom component styles
  components/
    Icon.jsx       — Lucide icon wrapper
  lib/
    supabase.js    — Supabase client (null if not configured)
    storage.js     — Storage abstraction (Supabase or localStorage)
  views/
    Dashboard.jsx  — Project grid / dashboard
    Kanban.jsx     — Kanban board view
    CustomTab.jsx  — Custom filtered tabs (kanban or table)
    Project.jsx    — Project detail view
    Brief.jsx      — Weekly Exec / Ops brief
    DecisionsLog.jsx — Cross-project decisions & comments feed
supabase/
  migrations/
    001_initial.sql — Database schema
```
