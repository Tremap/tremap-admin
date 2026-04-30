# tremap-admin

Next.js 16 admin panel for Tremap. Manages trees, sponsors, and users via the backend API.

## Stack
- **Framework:** Next.js 16.1.6 (App Router)
- **React:** 19.2.3
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS v4 + tailwind-merge + clsx
- **Icons:** lucide-react
- **HTTP:** axios
- **Deploy:** Vercel (auto-deploy on `master` push)

## ⚠️ Pushing to master IS the production deployment
- Always run `npm run build` locally before pushing to master
- Vercel auto-builds and deploys on every master push — no separate deploy step

## Key Commands
```bash
npm run dev      # Local dev server (http://localhost:3000)
npm run build    # Build — run this before every master push
npm start        # Production server (used by Vercel)
npm run lint     # ESLint
```

## Directory Structure
```
src/
├── app/                       # Next.js App Router
│   ├── layout.tsx             # Root layout (26L)
│   ├── page.tsx               # Dashboard/home (278L)
│   ├── trees/
│   │   └── page.tsx           # Tree management (237L)
│   ├── sponsors/
│   │   └── page.tsx           # Sponsor management (411L — largest)
│   └── users/
│       ├── page.tsx           # User list (228L)
│       └── [id]/
│           └── page.tsx       # User detail (192L)
│   └── app/
│       └── page.tsx           # App store redirect page (378L)
└── components/
    ├── Sidebar.tsx            # Navigation sidebar (149L)
    └── Combobox.tsx           # Reusable combobox (145L)
public/                        # Static assets
```

## Admin Pages
- **Dashboard** (`/`) — overview stats
- **Trees** (`/trees`) — tree management
- **Sponsors** (`/sponsors`) — sponsor species management (connects to backend `SponsorSpecies` model)
- **Users** (`/users`) — user list
- **User detail** (`/users/[id]`) — individual user management

## API Calls
- All calls go to tremap-backend via axios
- Backend URL configured via environment variables (`.env.local`)
- Uses backend's `/api/admin/*` and `/api/organization/*` routes

## Deployment Workflow
1. Make changes locally
2. `npm run build` — verify no build errors
3. `npm run dev` — test the feature locally
4. `git add . && git commit -m "..."` — commit on feature branch
5. `git merge feature-branch` into `master` — OR push directly to master
6. `git push origin master` — **this triggers Vercel deploy automatically**
7. Monitor Vercel dashboard for build success

**⚠️ Never push broken builds to master — always run `npm run build` first**

## Patterns to Follow
- App Router: server components by default, `"use client"` only for interactive UI
- Server components for data fetching (no useEffect for initial data)
- `tailwind-merge` + `clsx` for conditional class names
- Axios for API calls in server or client components as needed

## Never Do
- Never push to master without verifying `npm run build` passes
- Never add `"use client"` to components that don't need it
- Never import server-only code in client components
- Never hardcode API base URLs — use environment variables
