# Creamy White + Forest Green redesign

## Run it
    npm install
    npm run dev
Copy your own `.env.local` into this folder (it is intentionally not included in the zip).

## Why the page looked unstyled
`@tailwindcss/turbopack` is only a loader. `next.config.ts` never registered it, so Tailwind never
compiled and classes like `flex`, `grid`, `p-4` produced no CSS. `next.config.ts` now has a
`turbopack.rules` entry for `*.css`. If you still see an unstyled page, stop the dev server,
delete the `.next` folder and start again.

## What changed (visual only)
- `next.config.ts` – registers the Tailwind loader
- `src/app/globals.css` – new palette tokens, buttons, cards, progress bars
- `src/app/layout.tsx` – Nunito font
- `src/components/AppShell.tsx` (new) – sidebar + top bar (bell, profile) + mobile drawer
- `src/components/Navigation.tsx` – collapsible sidebar / mobile drawer
- `src/components/dashboard/*` (new) – StatCard, XpRing, BadgeList, WeeklyTracker, MissionRow, Card
- `src/components/ui/Illustrations.tsx` (new) – mountains, leaves, sidebar scene, empty-state art
- `src/components/PandaBadgeIcon.tsx` – panda mascot with green backpack, recoloured tiers
- Dashboard, Coding Hub, Missions, Login, Access Denied restyled

## Small data additions (read-only)
- `dashboard/page.tsx`: sums today's `xp_transactions` for the "Today's XP" card.
- `(app)/layout.tsx`: counts today's unfinished missions for the bell's notification dot.

No API routes, auth, schemas, XP/streak/badge logic or proxy were modified.
