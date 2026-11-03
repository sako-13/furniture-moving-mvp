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

## Out of scope for this MVP
These come from the PRD and are planned for later:
- Video recording and AI scanning of the room and route
- Authentication (Supabase) and saved simulations
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
```

## Deploy
Ready for [Vercel](https://vercel.com/new): import the repo and use the defaults.
