# Profit Patch Kit — Interactive Tools · Scope & Build Spec

_Living build blueprint. Finalised through discovery, Jun 2026._

## North star — the loop
**Diagnose → Quantify → Plug → Watch profit recovered climb.**
A forced diagnostic front door personalises the experience; calculators turn
leaks into dollars; monthly re-runs make "recovered" a **measured delta**, not
a vanity claim. Versioning is the receipt.

## Locked decisions

| Decision | v1 |
|---|---|
| Front door | Forced diagnostic (Tool 1) → personalises |
| Hero metric | **$ Recovered** (+ secondary **Venue Health Score /100**) |
| $ Recovered model | **Measured delta between versions** (honest) |
| Tools at launch | Ship the **3.5 that exist**; Par-Level + Silent Upsell later |
| Venue scope | **Single venue** |
| Access | **Post-purchase only**, via existing magic-link identity |
| $ derivation | **Hybrid** — Roster (+ Menu w/ volume) feed $; checklists feed Health Score |
| Platform | **Desktop-first**, mobile-responsive, **BHC brand**, **light/dark toggle** |
| Versioning | **Monthly snapshots**, current month editable until locked |
| Diagnostic | **Re-runnable & versioned** (health trend) |
| Export PDF | **Model supports it**, ship later |
| Re-engagement | Monthly "update your numbers" nudges (Resend) |

## The three tool archetypes
1. **Scored Diagnostic** — Tool 1 (Top 5 Leaks), Tool 4 Invoice Audit. Yes/no →
   severity per leak → routes to the matching calculator/playbook.
2. **Live Calculator** — Roster Waste, Menu Margin (+ Recipe), Venue Margin,
   Par-Level (later). Inputs → instant results + benchmark → "$ you're leaking."
3. **Interactive Playbook** — Menu Psychology, Seasonal, Staff Scripts, Table
   Presentation, Negotiation Scripts. Content + checkable actions + copy scripts.

## Leak → tool routing (the personalised front door)

| Leak (Tool 1) | Routes to | Status |
|---|---|---|
| #2 Labour Modelling | Roster Waste calculator | exists |
| #5 Menu Profitability | Menu Margin + Recipe calculators | exists |
| #4 Stock Accountability | Supplier Cost Detector (Invoice Audit; Par-Level later) | 3.5 |
| #1 Revenue Capping | Playbook + Venue Margin calc | playbook |
| #3 Staff Training & POS | Playbook (Staff Scripts / Upsell later) | playbook |

## The dollar model (hybrid)

| Tool | Feeds | How |
|---|---|---|
| Roster Waste | **$** | $ labour waste/wk × 52 — direct |
| Menu Margin | **$** (optional) | adds "monthly units sold" → (margin gap × volume). No volume → Health only |
| Supplier / Invoice Audit | **Health** | checklist severity → Health Score |
| Diagnostic (Tool 1) | **Health** | % "no" per leak → severity → /100 |

Dashboard figures (computed from snapshots):
- **$ Identified (current)** = Σ latest `dollarsIdentified` across $-tools
- **$ Recovered** = Σ max(0, baseline − current) per tool (baseline = first locked snapshot)
- **Health Score** = latest diagnostic `healthScore`

## Data model (Drizzle / Neon)
Keyed to the existing `leads` identity (customer = account; entitlement =
active paid `purchases` row).

```
venue_profiles
  id, leadId (unique FK), name, type,
  seatsCapacity, avgSpendPerHead, targetLabourPct (default 28),
  tradingDays, createdAt, updatedAt

tool_snapshots                     -- one generic, extensible table
  id, leadId,
  tool          enum(diagnostic | roster | menu | supplier),
  periodMonth   'YYYY-MM',
  payload       jsonb,             -- tool-specific inputs + computed
  dollarsIdentified  int  null,    -- annualised $ leak (null = health-only)
  healthScore        int  null,    -- /100 contribution (diagnostic)
  lockedAt      timestamptz null,  -- null = editable current month
  createdAt, updatedAt
  unique(leadId, tool, periodMonth)
```

## Front-door flow
`/app` (gated) → first visit: **Onboarding** (venue profile) → **Diagnostic**
(5 leaks) → **Personalised Dashboard** (worst leaks first, each linking its
calculator/playbook).

## Dashboard anatomy
- Hero: animated **$ Recovered** + **$ Identified** still on the table
- **Venue Health Score /100** + trend sparkline (versioned diagnostics)
- **5 leak cards**: severity + status (Not started → Quantified → Actioned → Recovering)
- "Re-run due" nudges · "Continue where you left off" · monthly trend chart

## Defaults (not separately confirmed)
- Diagnostic input: binary yes/no → % "no" per leak = severity
- Account identity: reuse lead/purchase (magic-link spine) — no new login
- Refund handling: access locked, **saved data retained** (re-purchase restores)
- Health Score /100: weighted aggregate across the 5 leaks

## Phased build plan (each independently shippable)
1. **Account spine + venue onboarding** — `/app` gated, `venue_profiles`,
   onboarding form, theme system (light/dark + BHC tokens)  ← _this phase_
2. **Diagnostic front door** (Tool 1) — versioned, leak scoring + Health Score
3. **Dashboard shell** — counters (start $0), health score, leak cards, versioning
4. **Roster Waste calculator** — first $-tool; proves baseline/recovered logic
5. **Menu Margin Trap Fixer** (+ recipe calc) — optional volume → $
6. **Supplier Cost Detector** — checklist (health-only)
7. **Playbooks** (mark-as-implemented) **+ monthly re-engagement nudges**

**Deferred:** Par-Level Calculator · Silent Upsell System · PDF export · multi-venue.
