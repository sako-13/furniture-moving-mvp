# Will It Fit? — Furniture Moving Simulator (MVP)

An MVP of the **Furniture Moving Simulator** web app. It helps college students, renters, and anyone moving into a smaller place figure out whether a piece of furniture can actually get *into* a room, not just fit inside it.

## The one core feature: an interactive 2D fit simulator

1. **Enter your furniture.** Pick a category (sofa, mattress, dresser, …) for typical dimensions, or type your own. Supports **inches, centimeters, and feet**.
2. **Enter the route.** Doorway width, hallway width and length, where the door sits, and room size.
3. **Move it.** An overhead layout of the hallway → doorway → room is generated. Drag the furniture and rotate it to try to get it through.
4. **See collisions.** Walls **turn red** the moment the furniture (plus an optional safety buffer) overlaps them. The status bar turns green once the item is fully in the room with no collisions.

There's also a quick check that warns you when even the narrow side of the item is wider than the doorway or hallway, which means it can't fit lying flat at any angle.

### Controls
| Action | Mouse / touch | Keyboard |
| --- | --- | --- |
| Move | Drag the item | Arrow keys (hold Shift for 6 in steps) |
| Rotate | Slider or ±15° buttons | `R` / `Shift+R` |
| Start over | **Reset** | |

## Accounts (Supabase)
Sign up, log in and log out with email + password, using Supabase Auth. Each account gets a row in `public.profiles` (name, email, preferred unit, created date), and Row Level Security means users can only read and edit their own row. The preferred unit becomes the simulator's default unit.

| Route | What it does |
| --- | --- |
| `/signup`, `/login` | Email + password forms (Server Actions) |
| `/account` | Edit name and default unit, log out. Signed-out visitors are redirected to `/login` |
| `/auth/confirm` | Landing page for the email confirmation link |

### Setup
1. Create a project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run `supabase/migrations/0001_profiles.sql`.
3. Copy `.env.example` to `.env.local` and fill in the values from **Project Settings → API**.
4. In **Authentication → URL Configuration**, set **Site URL** to your production URL and add `http://localhost:3000/**` and `https://<your-app>.vercel.app/**` to **Redirect URLs**.
5. On Vercel, add the same two env vars (Production, Preview, Development) and redeploy.

## Out of scope for this MVP
These come from the PRD and are planned for later:
- Video recording and AI scanning of the room and route
- Saved simulations
- Route optimization and move suggestions
- Multiple furniture items and 3D / tilting

## Tech stack
- [Next.js](https://nextjs.org/) (App Router) + React + TypeScript
- Tailwind CSS
- [React Konva](https://konvajs.org/docs/react/) for the 2D canvas
- Collision detection: Separating Axis Theorem on rotated rectangles (`src/lib/geometry.ts`)

## Getting started
```bash
npm install
npm run dev
```
Then open http://localhost:3000.

## Project structure
```
src/
  app/page.tsx                   # Landing page
  components/MoveSimulator.tsx   # Input forms, state, status, rotation controls
  components/SimulationCanvas.tsx# Konva overhead view (walls, door, draggable furniture)
  lib/geometry.ts                # Units, layout generation, collision detection
  lib/supabase/                  # Supabase clients + session-refresh middleware
  app/(auth)/                    # Login / sign-up pages and server actions
  app/account/                   # Account page
  middleware.ts                  # Refreshes the auth session on each request
supabase/migrations/             # SQL for the profiles table, RLS and signup trigger
```

## Deploy
Ready for [Vercel](https://vercel.com/new): import the repo, add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and use the defaults.
