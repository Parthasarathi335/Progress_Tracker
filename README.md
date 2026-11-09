# 🐼 Consistency Club

A polished, responsive, gamified web application built exclusively for two friends staying consistent with their daily habits, coding goals, and personal missions together.

Built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Supabase (Auth + PostgreSQL + Realtime)**, configured for the **Asia/Kolkata** timezone, and ready for deployment on **Vercel**.

---

## 📑 Table of Contents

- [Features Overview](#-features-overview)
- [Tech Stack](#-tech-stack)
- [Module Architecture](#-module-architecture)
  - [Module 1: Foundation, Database & Secure Login](#module-1-project-foundation-database-and-secure-login)
  - [Module 2: Daily Missions Page](#module-2-daily-missions-page)
  - [Module 3: Dashboard, XP & Badges](#module-3-dashboard-xp-and-badges)
  - [Module 4: Coding Hub & Two-Person Calendar](#module-4-coding-hub-two-person-calendar-and-vercel-deployment)
- [Database Setup (Supabase)](#-database-setup-supabase)
- [Environment Variables](#-environment-variables)
- [Local Development](#-local-development)
- [Vercel Deployment Guide](#-vercel-deployment-guide)
- [Testing & Verification Checklist](#-testing--verification-checklist)

---

## 🌟 Features Overview

- **🔒 Exclusive Two-Person Access**: Closed, invitation-only application. No public registration or sign-ups. Authentication is secured on both server and database levels using an email allowlist (`ALLOWED_EMAIL_1` and `ALLOWED_EMAIL_2`).
- **🎯 Daily Missions**: Create, edit, delete, and check off daily missions with emoji icons. Missions can be assigned to **Me**, **Partner**, or **Both**.
- **⚡ Gamified XP System**: Completing all assigned missions on a date awards **10 XP** per user. Calculated and credited strictly server-side.
- **🔥 Login Streak**: Consecutive daily logins maintain a fire streak (🔥). Missing a day resets the streak. Uses **Asia/Kolkata** day boundaries.
- **💻 Coding Streak & Two-Person Calendars**: GitHub-contribution-style activity calendars showing both friends side-by-side. Days turn green only when all daily missions are completed. Missed days turn red only after the day concludes.
- **🏆 Tiered Badge System**: Badges unlock automatically at XP milestones:
  - 🥉 **Bronze**: 150 XP
  - 🥈 **Silver**: 350 XP
  - 🥇 **Gold**: 500 XP
  - 💎 **Platinum**: 750 XP
  - 💠 **Diamond**: 1,000 XP
- **🤝 Live Partner Sync**: Supabase Realtime keeps both partners synchronized when missions are created, completed, or edited.

---

## 🛠 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, React Server Components)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict typing, no `any`)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (Soft sage green, cream, forest green theme)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL with RLS, GoTrue Auth, Realtime)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Timezone**: `Asia/Kolkata` (IST)
- **Deployment**: [Vercel](https://vercel.com/)

---

## 📦 Module Architecture

### Module 1: Project Foundation, Database and Secure Login
- **Authentication**: Supabase Email/Password authentication.
- **Route Protection**: Next.js proxy (`src/proxy.ts`) protects all routes except `/login` and `/access-denied`.
- **Double Allowlist Validation**:
  - Middleware / Proxy validates user email against `ALLOWED_EMAIL_1` and `ALLOWED_EMAIL_2`.
  - Database RLS function `is_allowed_user()` ensures SQL queries from non-allowlist tokens return zero rows.
- **Security**: Service role key (`SUPABASE_SERVICE_ROLE_KEY`) is kept strictly server-side and never exposed to the client.

### Module 2: Daily Missions Page (`/missions`)
- **Mission Management**: Modal to add or edit missions with emoji picker (`🐍`, `💻`, `📚`, `🚀`, `🔁`, etc.), date, and assignment.
- **Independent Completions**: Even for shared missions (`assigned_to = NULL`), each friend maintains their own completion status in `mission_completions`.
- **Backend XP Award**: Exactly 10 XP is awarded by the PostgreSQL function `award_daily_xp_if_complete` only when all missions for that date are checked off. If a mission is unchecked, the XP transaction is safely revoked.

### Module 3: Dashboard, XP and Badges (`/dashboard`)
- **Overview Header**: Personalized greeting, current login streak (🔥), and total XP.
- **Center Section**: Today's mission list with live progress bar (e.g., 2/4 done) and one-click completion.
- **Right Section**: Total XP, next badge milestone progress bar, and badge collection display.
- **Partner Progress Card**: Live statistics on partner's login streak, coding streak, XP, badge, and today's mission progress.
- **Weekly Activity Chart**: Visual 7-day mini-timeline.

### Module 4: Coding Hub, Two-Person Calendar and Vercel Deployment (`/coding-hub`)
- **Dual Calendars**: Side-by-side interactive monthly calendars (My Calendar vs. Partner's Calendar).
- **GitHub Contribution Color Scheme**:
  - 🟩 **Green**: All daily missions completed on that date.
  - 🟥 **Red**: Day ended with one or more missions left incomplete.
  - ⬜ **Grey**: Today in progress.
  - ◽ **Light Grey**: Future dates or dates with no scheduled missions.
- **Month Navigation**: Easily jump backward and forward through past months.
- **Collaborative Stats**: Current coding streak, longest streak, completed days, and completion percentage comparison.

---

## 🗄 Database Setup (Supabase)

1. Create a new Supabase project at [database.new](https://database.new).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Open `supabase/migrations/001_initial_schema.sql` from this repository.
4. Copy the entire contents into the SQL Editor and click **Run**.
5. Go to **Authentication -> Users** in your Supabase dashboard:
   - Click **Add User -> Create User** to add the first friend's account.
   - Click **Add User -> Create User** to add the second friend's account.
6. Disable public signups:
   - Go to **Authentication -> Providers -> Email**.
   - Turn OFF **"Enable Sign up"** (this prevents any public user from signing up).
7. Populate the database allowlist:
   Run the following query in the SQL Editor with your two emails:
   ```sql
   INSERT INTO public.allowed_emails (email)
   VALUES
     ('friend1@example.com'),
     ('friend2@example.com')
   ON CONFLICT (email) DO NOTHING;
   ```
8. Enable Supabase Realtime for instant synchronization:
   - Go to **Database -> Replication**.
   - Enable replication for `missions`, `mission_completions`, `daily_activity`, and `xp_transactions`.

---

## 🔑 Environment Variables

Create a `.env.local` file in the project root:

```env
# Public Supabase credentials (safe for browser)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Server-only credentials (NEVER commit or expose to client)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Allowlist of the exactly two authorised emails
ALLOWED_EMAIL_1=friend1@example.com
ALLOWED_EMAIL_2=friend2@example.com
```

---

## 💻 Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.example .env.local
   # Fill in your Supabase credentials and allowed emails in .env.local
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   Navigate to [http://localhost:3000](http://localhost:3000). You will be automatically redirected to `/login`.

5. **Build for production**:
   ```bash
   npm run build
   ```

---

## 🚀 Vercel Deployment Guide

1. Push your repository to GitHub:
   ```bash
   git add .
   git commit -m "feat: complete Consistency Club application"
   git push origin main
   ```

2. Log in to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import your GitHub repository.
4. In the **Environment Variables** section, configure the five environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (Check "Secret" or keep default server-only)
   - `ALLOWED_EMAIL_1`
   - `ALLOWED_EMAIL_2`
5. Click **Deploy**.
6. Once deployed, add your Vercel URL to Supabase:
   - In Supabase dashboard: **Authentication -> URL Configuration**.
   - Set **Site URL** to your Vercel domain (e.g., `https://your-consistency-club.vercel.app`).
   - Add `https://your-consistency-club.vercel.app/**` to **Redirect URLs**.

---

## ✅ Testing & Verification Checklist

- [x] **Only authorised accounts can log in**: Logging in with an unlisted email or credentials redirects to `/access-denied` or shows an invalid credentials error.
- [x] **No public registration**: Public signups are disabled in Supabase; no registration page exists in the UI.
- [x] **Protected routes**: Attempting to access `/dashboard`, `/missions`, or `/coding-hub` without logging in immediately redirects to `/login`.
- [x] **Mission connectivity**: Missions created in Daily Missions appear instantly on the Dashboard.
- [x] **Accurate 10 XP award**: Completing all assigned missions awards exactly 10 XP; partial completion awards 0 XP.
- [x] **No duplicate XP**: Repeatedly clicking or toggling cannot duplicate XP; revoking a mission safely revokes the XP bonus.
- [x] **Badge progression**: Bronze (150 XP), Silver (350 XP), Gold (500 XP), Platinum (750 XP), and Diamond (1000 XP) unlock at exact thresholds.
- [x] **Login streak accuracy**: Increases once per calendar day (Asia/Kolkata). Missing a day resets the streak.
- [x] **Coding streak accuracy**: Dependent on 100% mission completion for that day.
- [x] **Activity calendar accuracy**: Past completed days are green, past incomplete days are red, today in progress is grey, and future dates are neutral.
- [x] **Two-person synchronization**: Realtime subscriptions ensure both friends see live updates.
- [x] **Persistent data**: All data is stored in Supabase PostgreSQL; refreshing the browser retains all progress.
- [x] **Production build verified**: `npm run build` succeeds with zero errors.
