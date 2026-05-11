# BHC — Brendon Hill Consultancy

Website V2. Hospitality consultancy site with an interactive 3D globe showcasing real client projects across Greater Sydney.

**Tagline:** Everything Elevated. No Exceptions.

## Stack

- Next.js 16 (App Router) · TypeScript · React 19
- Tailwind v4 · Manrope (Muller substitute)
- MapLibre GL JS · deck.gl · OpenFreeMap tiles
- Framer Motion
- pnpm · Node 20+

## Getting started

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000.

## Project structure

```
app/                  Next.js App Router routes
components/
  globe/              3D globe, project pins, side panel
  layout/             Header, footer, page chrome
content/projects/     MDX case studies (Phase 2)
lib/                  Shared utils + project data
public/               Static assets (fonts, brand, images)
PRD.md                Product requirements document
```

## Scripts

- `pnpm dev` — local dev server
- `pnpm build` — production build
- `pnpm start` — start production build
- `pnpm lint` — ESLint

## Brand

See `PRD.md` §4 for design tokens (colours, typography, motion).

## Status

V2 in active development. See `PRD.md` for full scope and rollout plan.
