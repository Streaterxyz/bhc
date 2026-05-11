# BHC V2 — Product Requirements Document

**Project:** Brendon Hill Consultancy website V2
**Owner:** Justin
**Date:** 2026-05-10
**Target launch:** 2026-05-24 (2 weeks)
**Repo:** https://github.com/Streaterxyz/bhc.git

---

## 1. Vision

A premium, restrained hospitality consultancy site that opens with an interactive 3D globe showcasing BHC's real client projects across Greater Sydney. The globe is the hero — a wow-factor centerpiece that proves impact through real, plotted work rather than generic claims.

The V2 site sets the stage for a future lead funnel (free training → digital product upsell), but **V2's scope is the marketing site + project showcase only**.

### Brand essence
> **Everything Elevated. No Exceptions.**

Premium. Editorial. Confidently monochrome. The globe is where colour and motion live; the rest is restrained black, white, and greyscale with hospitality photography providing warmth.

### Differentiation
Most consulting sites look the same: stock photos, bullet-point services, "Book a call" CTAs. BHC V2 leads with **proof** (real projects, real impact, real locations) delivered through a memorable interaction (3D globe) that lives only in the work, not on every page.

---

## 2. Goals & non-goals

### Goals
1. Showcase 20 real BHC client projects on an interactive 3D globe with case study detail pages.
2. Establish a premium, on-brand digital presence aligned with the BHC brand book.
3. Drive qualified discovery-call bookings (primary conversion).
4. Build a foundation that can later host the lead magnet funnel (training video + paid digital product) without rework.
5. Ship in 2 weeks against the brand guidelines.

### Non-goals (V2)
- Blog/insights content hub (deferred).
- Lead magnet funnel + paid product checkout (Phase 2).
- Community platform integration (deferred, evaluate after 50–100 customers).
- CMS/dashboard for non-dev project management (managed in code for now).
- Email nurture sequences (Phase 2).
- Multi-language / i18n.

---

## 3. Audience

Primary:
- **SME hospitality owners** scaling rapidly (single-venue → multi-venue groups).
- **Solo operators** needing stabilisation and direction.
- **Enterprise hospitality leaders** managing portfolios.

Geography: Greater Sydney primary, Australia secondary, international tertiary.

What they need from the site: proof of capability, confidence in the operator (Brendon), low-friction path to a conversation.

---

## 4. Brand system

### Identity
- **Primary mark:** "BHC"
- **Secondary marks:** Vertical and horizontal logos with "Brendon Hill Consultancy" wordmark
- **Tagline:** "Everything Elevated. No Exceptions."
- **Sub-tagline:** "Elevating Experience. Everywhere."
- **Values:** VIP Mindset · Details Are The Difference · Personal, Always

### Colour
**Primary (UI base):**
| Token | Hex | Use |
|---|---|---|
| `bg.base` | `#000000` | Page background |
| `bg.elevated` | `#0A0A0A` | Cards, surfaces |
| `bg.subtle` | `#1A1A1A` | Hover, inputs |
| `border.subtle` | `#2A2A2A` | Dividers, hairlines |
| `text.primary` | `#FFFFFF` | Headlines, primary text |
| `text.secondary` | `#CCCCCC` | Body |
| `text.tertiary` | `#999999` | Captions, meta |
| `text.muted` | `#666666` | Disabled, placeholders |

**Accent (used sparingly, primarily on globe + interactive moments):**
| Token | Hex | Use |
|---|---|---|
| `accent.gold` | `#F4C21C` | Globe pin glow, hover, primary CTA highlight |
| `accent.gold.dim` | `#7A6010` | Inactive states |

**Secondary palette (per brand book)** retained for occasional emphasis: purples (`#494891`, `#968FC5`), teals (`#22B9CD`, `#A0DBED`), pinks (`#F4909F`, `#F8AA92`), reds (`#D73F51`, `#E3673F`), greens (`#446F34`, `#92C840`). Used only as deliberate moments — never on primary chrome.

### Typography
- **Web font:** Manrope (free, near-identical to brand Muller). Swap to licensed Muller later.
- **Hierarchy:**
  - Display (hero headlines): Manrope Bold, 64–96px desktop, tight letter-spacing
  - H1: Manrope Bold, 48px
  - H2: Manrope Bold, 32px
  - H3: Manrope Bold, 24px
  - Body: Manrope Regular, 16–18px, line-height 1.6
  - Caption / meta: Manrope Regular, 12–14px, uppercase tracking 0.08em where applied
  - Vertical labels (per brand): Manrope Bold rotated 90°, used as section markers
- **Rules:**
  - Headlines left-aligned (per brand layout system)
  - Generous negative space; minimum margin = cap height of headline
  - Avoid Thin weight below 32px (legibility)

### Photography
- Cinematic, moody, low-light hospitality imagery
- Warm tones, intimate framing
- Per-project hero photos sourced during build
- Optimised: AVIF + WebP fallback, lazy-load, responsive sizes

### Motion principles
- Restrained, intentional, never gratuitous
- Easing: `cubic-bezier(0.16, 1, 0.3, 1)` (sharp out)
- Durations: 200ms (micro), 400ms (transitions), 1200–2500ms (cinematic globe moves)
- Respect `prefers-reduced-motion` everywhere

---

## 5. Sitemap

```
/                        Home (globe hero, services, why BHC, testimonials, CTA)
/projects                All projects grid + filter (alt entry to globe)
/projects/[slug]         Individual case study (×20)
/services                Detailed services + how we work
/about                   Brendon's story, team, values
/contact                 Book call (embed) + form
/legal/privacy
/legal/terms
```

Future (Phase 2):
```
/training                Free 30-min training (email-gated)
/training/watch          Video player + upsell
/checkout/success
/downloads               Customer dashboard for templates
```

---

## 6. Page-level requirements

### 6.1 Home (`/`)

**Above the fold — Globe hero (100vh)**
- Auto-rotating 3D globe entrance (Stripe-style cinematic intro), zooming from space → Greater Sydney
- Tilted 3D angle on land, dark stylised earth (monochrome base)
- 20 projects plotted as pulsing gold pins (`#F4C21C`)
- Hero headline overlaid: **"Everything Elevated. No Exceptions."**
- Subhead: brief positioning line
- Sticky bottom-left: small text "Click any pin to explore a project"
- Sticky top-right: minimal nav (Projects · Services · About · Contact · Book a call)
- Brand mark top-left

**Interaction**
- Idle: globe rotates slowly, pins pulse gently
- Hover pin: pin scales up, glow intensifies, tooltip with project name + suburb
- Click pin: globe smoothly recentres on pin → side panel slides in from right with project highlight
- Side panel: hero image, headline metric, summary, key services tags, CTA "View full case study →" linking to `/projects/[slug]`
- Top-right "View all projects" → `/projects` grid view

**Below fold**
1. **Section: What We Do** — 6 services as compact cards (anchored to `/services` page)
2. **Section: Why BHC** — 3 pillars (VIP Mindset, Details Are The Difference, Personal Always) with editorial layout, vertical labels
3. **Section: Selected Work** — horizontal scroller of 4–6 featured project cards (subset of globe)
4. **Section: In Their Words** — 4 testimonials in a masonry/staggered grid (carry forward from current site)
5. **Section: CTA Block** — large headline + "Book your free 15-minute call" + secondary form (email capture for future funnel)
6. **Footer** — minimal: BHC mark, contact, socials, legal links

### 6.2 Projects index (`/projects`)
- Headline: "Selected Work" or "Where We've Been"
- Filter chips: All · Restaurant · Bar · Hotel · Venue Group · By Service
- Grid of 20 project cards (image, name, suburb, headline metric, service tags)
- Hover: card lifts subtly, image scales 1.02, accent gold underline on title
- Click → `/projects/[slug]`
- Alt view toggle: "View on globe" → returns to home with globe focused

### 6.3 Project detail (`/projects/[slug]`)
- Hero: full-bleed photo with project name, location, year overlaid
- Sticky meta bar: client · location · services · duration
- Sections:
  1. **The challenge** — short paragraph
  2. **What we did** — bulleted approach + relevant services
  3. **The result** — 3–4 metric tiles (large numbers, gold accent)
  4. **Gallery** — 4–6 photos
  5. **Testimonial** — pull quote with attribution
  6. **Related projects** — 3 cards (geographic or service-type related)
  7. **CTA block** — "Have a venue facing similar challenges? Book a call →"

### 6.4 Services (`/services`)
- Headline + intro
- 6 service blocks (Strategy & Advisory, Operational Systems, Financial & Commercial, Team & Talent, Brand & Growth, Experience Design)
- Each block: icon/number, name, description, "Typical outcomes" bullets, related project mini-cards
- "How we work" section: phased engagement explainer
- CTA block

### 6.5 About (`/about`)
- Brendon's story — editorial long-form
- Photo of Brendon (sourced)
- Team roster (carry forward from current site)
- Values section (deeper than home)
- CTA block

### 6.6 Contact (`/contact`)
- Headline + intro
- Two paths: "Book a call" (Calendly/Cal.com embed) and "Send a message" (form → email via Resend)
- Email: brendon@brendonhill.co
- Response time note (one business day)

---

## 7. The Globe — technical architecture

### Stack
- **MapLibre GL JS v4+** — open-source map library with globe projection
- **deck.gl** — WebGL overlay for pins, glow effects, transitions
- **OpenFreeMap** — free, OSS vector tile host (fallback: self-hosted Protomaps)
- **Three.js** — only if we need additional non-map 3D elements (probably not for V2)

### Why this stack
- Fully open source, no API key costs
- Globe projection built in (MapLibre v4)
- deck.gl gives us custom shader-based pin rendering for the pulse/glow look
- Future-proof for clustering, arcs, heatmaps if needed

### Globe behaviour
| State | Behaviour |
|---|---|
| Initial load | Globe in space, slight tilt, slow auto-rotation (15s/rev). After 800ms delay, cinematic camera move (2.4s) zooms to Greater Sydney with 60° pitch |
| Idle (zoomed in) | Subtle camera drift, pin pulses (1.6s loop, easing in/out) |
| Hover pin | Pin scales 1.5×, glow intensifies, neighbouring pins dim 30%, tooltip appears |
| Click pin | Camera recentres on pin in 800ms, side panel slides in 400ms, pin enters "active" state (locked glow, brighter ring) |
| Close panel | Camera zooms out slightly, pin returns to default |
| Mobile | Same globe, simplified controls — pinch-zoom and drag enabled, double-tap pin opens panel |

### Pin design
- Core: small white dot (4px), full opacity
- Halo: gold `#F4C21C` radial glow with shader-based pulse (vertex displacement + alpha modulation)
- Active state: extra outer ring, locked glow
- Cluster state (Sydney CBD will have density): when zoomed out, pins within ~30px screen distance group into a numbered cluster pill; clicking expands

### Performance budget
- Initial JS: <250KB gzipped (excluding map tiles)
- Map tiles: lazy-loaded as user pans
- Globe + pins: 60fps on M1+ / mid-tier mobile
- Acceptable wow-factor overhead: up to 1.8s LCP for hero (per user direction)
- Reduced-motion: skip cinematic intro, jump to Sydney view, disable pulse

### Accessibility
- All globe interactions have keyboard equivalents (tab through pins, Enter to open, Esc to close)
- Side panel is a proper modal with focus trap
- Screen reader fallback: `<ul>` of projects rendered alongside globe, hidden visually
- `prefers-reduced-motion` → static globe with no rotation/pulse
- WCAG AA contrast minimum throughout

---

## 8. Data model

### Project schema (TypeScript, MDX-driven for V2)

```ts
// content/projects/[slug].mdx frontmatter
{
  slug: string;                    // URL slug
  name: string;                    // Display name (venue/project)
  client: string;                  // Client/operator name
  type: "restaurant" | "bar" | "hotel" | "venue-group" | "other";
  coords: [number, number];        // [lng, lat]
  suburb: string;                  // "Surry Hills", "Bondi", etc.
  year: number;
  duration: string;                // "6 months", "ongoing"
  services: ServiceKey[];          // ["strategy", "operations", "experience"]
  status: "live" | "completed" | "ongoing";

  // Display content
  headline: string;                // "Lifted net margin 22% in 6 months"
  summary: string;                 // Side-panel blurb (1–2 sentences)

  // Case study
  challenge: string;               // MDX body
  approach: string;                // MDX body (bulleted)
  outcome: string;                 // MDX body

  metrics: Array<{
    label: string;                 // "Revenue uplift"
    value: string;                 // "+34%"
    context?: string;              // Optional one-liner
  }>;

  testimonial?: {
    quote: string;
    name: string;
    role: string;
  };

  hero_image: string;              // /images/projects/[slug]/hero.jpg
  gallery: string[];               // 4–6 image paths
  featured?: boolean;              // Show in home "Selected Work"
}
```

Files live at `content/projects/*.mdx`. Build-time we generate a `projects.json` for the globe (slim version: coords + slug + headline + summary).

---

## 9. Tech stack (locked)

| Layer | Tool | Notes |
|---|---|---|
| Framework | Next.js 15 (App Router) | RSC for static pages, client islands for globe |
| Language | TypeScript (strict) | |
| Styling | Tailwind CSS v4 | Design tokens via CSS variables |
| UI primitives | shadcn/ui | Used selectively; we override for brand |
| Animation | Framer Motion + GSAP | Framer for UI, GSAP for globe choreography |
| Map / 3D | MapLibre GL + deck.gl | Globe projection + custom pin layer |
| Tiles | OpenFreeMap | Free OSS, no API key |
| Content | MDX | Project case studies in `content/projects/*.mdx` |
| Forms | react-hook-form + zod | Contact form |
| Email (transactional) | Resend | Contact form submissions |
| Analytics | PostHog (cloud, free tier) | Page views + globe interactions |
| Booking | Cal.com or Calendly embed | TBD which Brendon prefers |
| Hosting (initial) | Local + Vercel preview | Final: Vercel or Cloudflare Pages |
| Domain | brendonhill.co (existing) | DNS swap on launch |
| Package manager | pnpm | |
| Node version | 20 LTS | |

### Future (Phase 2 — not in V2)
Neon Postgres, Drizzle ORM, Stripe, Cloudflare Stream, Cloudflare R2, Loops.so.

---

## 10. Repo & project structure

```
bhc/
├── PRD.md
├── README.md
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── .env.example
├── .env.local                    (gitignored)
├── app/
│   ├── layout.tsx
│   ├── page.tsx                  (home with globe)
│   ├── projects/
│   │   ├── page.tsx              (index/grid)
│   │   └── [slug]/page.tsx       (detail)
│   ├── services/page.tsx
│   ├── about/page.tsx
│   ├── contact/page.tsx
│   ├── legal/
│   │   ├── privacy/page.tsx
│   │   └── terms/page.tsx
│   ├── api/
│   │   └── contact/route.ts
│   └── globals.css
├── components/
│   ├── globe/
│   │   ├── Globe.tsx             (MapLibre + deck.gl wrapper)
│   │   ├── ProjectPin.tsx
│   │   ├── GlobeIntroAnim.tsx
│   │   ├── ProjectPanel.tsx      (slide-in side panel)
│   │   └── useGlobeState.ts
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Nav.tsx
│   ├── projects/
│   │   ├── ProjectCard.tsx
│   │   ├── ProjectGrid.tsx
│   │   ├── ProjectMeta.tsx
│   │   ├── MetricTile.tsx
│   │   └── RelatedProjects.tsx
│   ├── ui/                       (shadcn primitives, customised)
│   └── marketing/
│       ├── Hero.tsx
│       ├── ServiceList.tsx
│       ├── Testimonials.tsx
│       └── CTABlock.tsx
├── content/
│   └── projects/
│       └── *.mdx                 (20 case studies)
├── lib/
│   ├── projects.ts               (load + parse MDX)
│   ├── design-tokens.ts
│   └── utils.ts
├── public/
│   ├── brand/                    (logos, favicon)
│   ├── images/
│   │   └── projects/[slug]/      (hero + gallery)
│   └── fonts/                    (Manrope, self-hosted)
└── scripts/
    └── build-projects-json.ts    (slim manifest for globe)
```

---

## 11. Phasing (2-week plan)

### Week 1 — Foundation + Globe

**Day 1–2: Project setup & design system**
- Init Next.js 15 + TypeScript + Tailwind + pnpm
- Configure design tokens (CSS vars), Tailwind theme, Manrope font
- Build base layout primitives: `Header`, `Footer`, `Container`, `Section`, typography components
- Set up MDX pipeline for projects
- Add ESLint, Prettier, Husky pre-commit
- Push initial commit to repo
- **Deliverable:** runnable site with placeholder pages, brand-correct typography & colours

**Day 3–4: Globe — core**
- Install MapLibre GL + deck.gl, set up globe projection
- Stylised dark monochrome map style (custom MapLibre style JSON)
- OpenFreeMap tiles configured
- Render 20 placeholder pins at correct coords
- Basic camera controls + Sydney recentre
- **Deliverable:** working globe with static pins

**Day 5–6: Globe — interaction + polish**
- Pulse/glow shader for pins (deck.gl custom layer)
- Hover state + tooltip
- Click → side panel slides in (Framer Motion)
- Cinematic intro animation (GSAP timeline)
- Camera transitions between pins
- Mobile pinch/drag controls
- Reduced-motion fallback
- **Deliverable:** fully interactive globe with side panel

**Day 7: Buffer + first content pass**
- 5 real projects in MDX (Brendon's top picks)
- First photos in
- QA globe on Chrome/Safari/Firefox + mobile

### Week 2 — Pages, content, launch prep

**Day 8–9: Project pages**
- `/projects` index with filters
- `/projects/[slug]` detail layout (all sections per spec)
- `MetricTile`, `RelatedProjects`, gallery component
- Wire all 20 projects (content from Brendon, photos sourced)

**Day 10: Marketing pages**
- Home below-fold sections (services preview, why BHC, testimonials, CTA)
- `/services` full page
- `/about` page
- `/contact` page with form + Cal.com/Calendly embed
- `/legal/privacy` and `/legal/terms` (lightweight templates)

**Day 11: Polish + analytics**
- PostHog integration + event tracking (globe interactions, panel opens, project views, CTA clicks)
- SEO meta, Open Graph, structured data per page
- Sitemap + robots.txt
- Performance pass: image optimisation, font subsetting, code splitting
- Lighthouse 90+ on all pages (mobile + desktop)

**Day 12: Accessibility + cross-browser**
- Keyboard nav for globe
- Screen-reader project list
- Reduced-motion verification
- Cross-browser QA (Chrome, Safari, Firefox, Edge, iOS Safari, Android Chrome)

**Day 13: Launch prep**
- Final content pass with Brendon
- Vercel project + preview deployment
- DNS plan documented for `brendonhill.co`
- Backup of current site
- Soft launch (preview URL shared with Brendon for sign-off)

**Day 14: Launch**
- DNS cutover
- Smoke test in production
- PostHog dashboards set up
- Handover doc

---

## 12. Content responsibilities

| Item | Owner | Status |
|---|---|---|
| 20 project coordinates + suburbs | Brendon | Needed by Day 5 |
| 20 project metrics + headlines | Brendon | Needed by Day 8 |
| 20 project case study copy (challenge/approach/outcome) | Brendon | Needed by Day 9 |
| Project hero + gallery photos (20 × 5–7 photos) | Brendon / sourcing | Needed by Day 10 |
| Updated services copy | Brendon | Day 10 |
| About / Brendon's story | Brendon | Day 10 |
| Testimonials (existing + any new) | Brendon | Day 10 |
| Calendly/Cal.com link | Brendon | Day 12 |
| Legal copy (privacy, terms) | Brendon / lawyer | Day 13 |

If content is delayed: launch with 5 fully-built hero projects + 15 placeholder cards that resolve to "Case study coming soon" + email capture.

---

## 13. Success metrics

**Launch metrics (first 30 days)**
- Lighthouse: 90+ Performance, 95+ Accessibility, 100 Best Practices
- Mobile + desktop both passing
- Globe interaction rate: ≥40% of homepage visitors click at least one pin
- Project detail views: ≥1.5 per session for users who interact with globe
- Bounce rate on home: <40%
- Discovery-call bookings: track baseline vs. V1

**Qualitative**
- Brendon shows site to peers → "wow" response
- Inbound enquiries reference the projects shown

---

## 14. Risks & mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Globe performance issues on low-end mobile | M | M | Performance budget enforced; reduced-motion fallback to static map view |
| Photography not sourced in time | M | H | Launch with placeholder hero images styled in brand monochrome; rotate in real photos post-launch |
| MapLibre globe edge-case bugs (still v4-recent) | L | M | Pin MapLibre version; have Three.js custom-globe fallback documented |
| Brendon's case study copy slips | M | M | Phased launch: 5 hero projects live, others "coming soon" cards |
| OpenFreeMap downtime | L | M | Document Protomaps self-host fallback ($0–5/mo on R2) |
| 2-week scope slip | M | M | Daily check-ins; descope `/services` deep-dive and ship as one-pager if needed |

---

## 15. Phase 2 (post V2)

Documented but not in scope:
1. Lead funnel: `/training` landing + email gate + Cloudflare Stream video player
2. Stripe Checkout for digital product
3. Cloudflare R2 + signed download URLs + downloads dashboard
4. Magic-link auth via signed JWT
5. Neon + Drizzle for leads, video_events, purchases, downloads tables
6. Resend transactional + Loops nurture sequence
7. Admin analytics dashboard at `/admin` (revenue, video drop-off, funnel conversion)
8. Refund policy + Stripe webhook handling
9. Community evaluation (Skool/Circle/Discord)

---

## 16. Open questions for Brendon

1. Calendly vs. Cal.com preference for booking embed?
2. Any projects under NDA that should be excluded or anonymised? (We assumed all public.)
3. Existing social profiles to link in footer? (LinkedIn, Instagram likely.)
4. Preferred form submission destination — email only, or also into a Notion/Airtable for CRM?
5. Project taxonomy: confirm 4 types (restaurant, bar, hotel, venue group) or are there more (cafe, club, function space, etc.)?
6. Year of operation for each project? Needed for sort/filter.

---

## Appendix A — Brand tokens (Tailwind config sketch)

```ts
// tailwind.config.ts (snippet)
colors: {
  bg: {
    base: "#000000",
    elevated: "#0A0A0A",
    subtle: "#1A1A1A",
  },
  border: {
    subtle: "#2A2A2A",
    DEFAULT: "#333333",
  },
  fg: {
    primary: "#FFFFFF",
    secondary: "#CCCCCC",
    tertiary: "#999999",
    muted: "#666666",
  },
  accent: {
    DEFAULT: "#F4C21C",  // gold
    dim: "#7A6010",
  },
  // Secondary (used sparingly)
  brand: {
    purple: "#494891",
    teal: "#22B9CD",
    pink: "#F4909F",
    red: "#D73F51",
    green: "#446F34",
    orange: "#E3673F",
  },
},
fontFamily: {
  sans: ["Manrope", "system-ui", "sans-serif"],
},
```

## Appendix B — Globe technical references

- MapLibre GL globe projection: `projection: { type: 'globe' }`
- deck.gl `ScatterplotLayer` + custom shader for pulse glow
- Pulse shader: `alpha *= 0.5 + 0.5 * sin(time * 2.0 + offset)`
- Camera fly-to: `map.flyTo({ center: [lng, lat], zoom: 12, pitch: 60, bearing: -20, duration: 2400, essential: true })`
- OpenFreeMap style: `https://tiles.openfreemap.org/styles/positron` (we customise to dark monochrome)

---

**End of PRD.**
