/**
 * Interactive Playbooks — the Tool 3 strategy guides as structured,
 * implementable reference content. Each playbook has readable sections,
 * a set of checkable action items (saved → "implemented" state, the
 * stickiness layer), and optional copy-able scripts.
 *
 * Implementation state is persisted as a single non-versioned snapshot
 * (tool="playbooks", period="all") holding the implemented action ids.
 */

import type { LeakId } from "./diagnostic";

export type PlaybookSection = {
  heading: string;
  body?: string;
  bullets?: string[];
};

/**
 * A playbook action is either a simple checkbox ("mark as implemented") or,
 * when `fields` is present, an interactive worksheet: the customer writes
 * their venue's own answers into one input per field label. Each field
 * string is the guiding prompt/placeholder for that input.
 */
export type PlaybookAction = {
  id: string;
  label: string;
  /** Optional supporting line shown under the label (e.g. the expected impact). */
  detail?: string;
  fields?: string[];
};
export type PlaybookScript = { context: string; script: string };

export type Playbook = {
  slug: string;
  title: string;
  intro: string;
  supportsLeak: LeakId | null;
  sections: PlaybookSection[];
  actions: PlaybookAction[];
  scripts?: PlaybookScript[];
};

export const PLAYBOOKS: Playbook[] = [
  {
    slug: "menu-design-psychology",
    title: "Menu Engineering & Design Psychology",
    intro:
      "Your menu is your most important sales tool. A well-designed menu influences what guests order, increases average spend and highlights your most profitable items — without making guests feel sold to.",
    supportsLeak: "menu-profitability",
    sections: [
      {
        heading: "How guests actually read a menu",
        body: "Most guests don't read top-to-bottom. They scan for familiar words, look for 'safe' choices, use price as a quality signal, and decide quickly under social pressure. Your job: make the best choice feel like the easiest choice.",
      },
      {
        heading: "Build around decisions, not categories",
        body: "Instead of only kitchen categories (starters/mains), think in guest decisions: 'something light', 'I'm hungry', 'I want to share', 'a treat'.",
        bullets: [
          "Add short decision headers (For the table, Light & bright, Comfort classics)",
          "Keep each section tight — fewer items, clearer winners",
        ],
      },
      {
        heading: "Price perception & anchoring",
        bullets: [
          "Include 1–2 premium anchor items per section so target items feel like good value",
          "Place your target-margin items near the anchor to elevate them",
          "Don't line prices in a neat column — it encourages 'cheapest wins'",
          "Use consistent formatting (no cents) to reduce price fixation",
        ],
      },
      {
        heading: "Names that sell (without being cringe)",
        body: "Strong names are specific, sensory, and benefit-led. Algorithm: technique + hero ingredient + key flavour + optional provenance. e.g. 'Chargrilled prawns, chilli & lime'.",
      },
      {
        heading: "The 10-second navigation test",
        body: "A guest decides in seconds. If they can't spot your signature dish, your best-margin item, the hero of each section, or what makes items different — fast — you lose the sale to indecision. Run this check on your current menu and tick what already passes.",
      },
    ],
    actions: [
      { id: "menu-design-psychology:nav-signature", label: "A guest can identify your signature item in under 10 seconds" },
      { id: "menu-design-psychology:nav-margin", label: "A guest can identify your highest-margin item in under 10 seconds" },
      { id: "menu-design-psychology:nav-hero", label: "Every section has a clear hero item" },
      { id: "menu-design-psychology:nav-difference", label: "Guests can easily understand what makes each item different" },
      { id: "menu-design-psychology:decision-headers", label: "Add decision-based section headers" },
      { id: "menu-design-psychology:anchors", label: "Place 1–2 premium anchor items per section" },
      { id: "menu-design-psychology:prices", label: "Remove cents and un-align the price column" },
      { id: "menu-design-psychology:cut-metoo", label: "Cut 'me-too' low-margin dishes" },
      {
        id: "menu-design-psychology:rename-heroes",
        label: "Rename hero items using technique + ingredient + flavour",
        fields: [
          "Hero #1 — new name",
          "Hero #2 — new name",
          "Hero #3 — new name",
        ],
      },
    ],
  },
  {
    slug: "seasonal-menu-strategies",
    title: "Seasonal Menu Strategies",
    intro:
      "Seasonality should increase revenue, not complexity. The goal is to create fresh reasons to visit, leverage seasonal ingredients and generate marketing opportunities — without disrupting operations or inventory control.",
    supportsLeak: "menu-profitability",
    sections: [
      {
        heading: "Define what seasonal means for you",
        bullets: [
          "Ingredient seasonal: produce, seafood, game",
          "Weather seasonal: lighter in heat, richer in cold",
          "Occasion seasonal: holidays, events, local festivals",
          "Behavioural seasonal: school holidays, tourism peaks, footy season",
          "Commercial seasonal: supplier surplus & discounting, favourable pricing, marketing cross-activation",
        ],
        body: "Pick 1–2 drivers so the menu doesn't feel random.",
      },
      {
        heading: "Choose your change rhythm",
        body: "Quarterly (4×/year) suits most venues — enough change to entice, manageable training and costing load. The more often you change, the more you must simplify execution.",
      },
      {
        heading: "Core + seasonal layer",
        bullets: [
          "Core winners (60–80%): proven sellers, stable prep, consistent margin",
          "Seasonal layer (20–40%): rotating items, specials, limited-time dishes",
        ],
      },
      {
        heading: "Seasonal heroes",
        body: "Pick 2–3 per season: one shareable hero, one signature main, one high-margin add-on. Feature them, train one-sentence descriptions, and pair with a beverage recommendation.",
      },
    ],
    actions: [
      {
        id: "seasonal-menu-strategies:drivers",
        label: "Pick 1–2 seasonality drivers",
        fields: [
          "Driver 1 (e.g. produce season)",
          "Driver 2 (e.g. tourism peak)",
        ],
      },
      { id: "seasonal-menu-strategies:rhythm", label: "Set a menu change rhythm (quarterly)" },
      { id: "seasonal-menu-strategies:core-layer", label: "Define core winners vs seasonal layer" },
      {
        id: "seasonal-menu-strategies:heroes",
        label: "Choose 2–3 seasonal heroes",
        fields: ["Shareable hero", "Signature main", "High-margin add-on"],
      },
      { id: "seasonal-menu-strategies:margin-check", label: "Run the seasonal margin checklist before launching items" },
    ],
  },
  {
    slug: "staff-training",
    title: "Staff Training Scripts",
    intro:
      "Help teams confidently guide guests toward the best-experience, best-margin choices — without sounding pushy.",
    supportsLeak: "staff-pos",
    sections: [
      {
        heading: "Principles (teach these first)",
        bullets: [
          "Help, don't sell: reduce guest risk and make the choice easy",
          "Recommend with a reason: one clear benefit beats a long explanation",
          "Offer two options: it feels supportive, not salesy",
          "Use the menu as a map: point to sections and hero items",
        ],
      },
      {
        heading: "Guide to margin without sounding like it",
        body: "Upgrade language for add-ons converts. Instead of 'Do you want…?' use 'Would you like to add [add-on]? It really lifts the dish' or 'Most people pair that with [side] — great combo'.",
      },
    ],
    actions: [
      {
        id: "staff-training:huddle",
        label: "Run a 5-min pre-shift huddle with 2–3 hero items",
        fields: [
          "Tonight's hero item 1",
          "Hero item 2",
          "Hero item 3 (optional)",
        ],
      },
      { id: "staff-training:two-option", label: "Train the two-option recommendation" },
      { id: "staff-training:greeting", label: "Standardise the greeting + first touch" },
      { id: "staff-training:upgrade-language", label: "Use upgrade language for add-ons" },
    ],
    scripts: [
      {
        context: "Pre-shift huddle (open)",
        script:
          "Team, tonight we're focusing on two things: speed of decision and quality of recommendation. Our top picks are [Hero 1] and [Hero 2] — keep recommendations short, confident, and guest-first.",
      },
      {
        context: "The two-option recommendation",
        script:
          "Depends what you're in the mood for. If you want something [benefit 1], I'd go [Option A]. If you want something [benefit 2], [Option B] is the move.",
      },
      {
        context: "Add-on upgrade",
        script:
          "Would you like to add [high-margin add-on]? It really lifts the dish.",
      },
    ],
  },
  {
    slug: "table-presentation",
    title: "Table Presentation Techniques",
    intro:
      "Guests don't remember every detail of their meal, but they remember how the experience felt. Small improvements to table presentation, service flow and communication can increase guest satisfaction, encourage additional purchases and improve repeat visitation.",
    supportsLeak: "revenue-capping",
    sections: [
      {
        heading: "The guest journey lens (five moments)",
        bullets: [
          "Arrival: first impression + comfort",
          "Orientation: guests understand how to order / what's special",
          "Momentum: drinks + first plates land smoothly",
          "Peak: hero dishes land with impact",
          "Close: dessert/coffee + payment feels easy and warm",
        ],
        body: "Remove friction; add small theatre at the right moments.",
      },
      {
        heading: "Design for comfort & conversion",
        bullets: [
          "Space for phones, bags, shared plates",
          "Sightlines: avoid tall clutter that blocks conversation",
          "Offer water early, keep a clear ordering process",
          "Don't over-set — it increases labour, breakage, and resets",
        ],
      },
      {
        heading: "Plate landing technique",
        body: "Announce + place + confirm: 'Lamb shoulder for the table' → land cleanly, hero side to the guest → 'Anything else with that?'",
      },
    ],
    actions: [
      {
        id: "table-presentation:journey",
        label: "Map your five guest-journey moments",
        fields: [
          "Arrival — first impression & comfort",
          "Orientation — how to order / what's special",
          "Momentum — drinks & first plates land",
          "Peak — hero dishes land with impact",
          "Close — dessert/coffee & easy payment",
        ],
      },
      { id: "table-presentation:baseline", label: "Set consistent baseline table standards" },
      { id: "table-presentation:water", label: "Offer water within 2 minutes of arrival" },
      { id: "table-presentation:plate-landing", label: "Use announce + place + confirm for plates" },
      { id: "table-presentation:point-heroes", label: "Train staff to point to the hero section" },
    ],
  },
  {
    slug: "maximising-covers",
    title: "Maximising Covers",
    intro:
      "Stop leaving revenue on the floor. Know your true capacity, turn tables without rushing guests, and deliberately push the ceiling — so a full room actually means a full till.",
    supportsLeak: "revenue-capping",
    sections: [
      {
        heading: "Know your true capacity",
        body: "You can't fix what you don't measure. Most venues guess their ceiling and quietly run 15–25% below it. Start with the maths, then track it weekly.",
        bullets: [
          "Max covers per service = seats × expected table turns",
          "Track average spend per cover weekly — a cover without spend isn't revenue",
          "Track table turn times weekly — minutes from seat to reset",
          "Aim for ≥90% of max capacity in peak services before you blame demand",
        ],
      },
      {
        heading: "Turn tables without rushing guests",
        body: "Throughput comes from the gaps between guests, not from hurrying them. Tighten the reset, not the meal.",
        bullets: [
          "Reset and reseat within 10 minutes at peak — assign a clearing owner",
          "Pre-bus and stagger courses so tables free up predictably",
          "Run an active waitlist at peak so an open table is filled, not lost",
          "Use timed bookings (e.g. 90/120 min) to protect turns on big nights",
        ],
      },
      {
        heading: "Lift spend per cover",
        body: "More covers is half the equation; more per cover is the other. Make upselling measurable, not optional.",
        bullets: [
          "Measure upsell performance per server weekly (add-ons, sides, drinks)",
          "Set one focus add-on per shift and track the attachment rate",
          "Coach the lowest performer with the two-option recommendation",
        ],
      },
      {
        heading: "Push the ceiling deliberately",
        body: "Capacity grows when you test it. Once a quarter, prove what your team can actually handle — then raise the caps to match.",
        bullets: [
          "Stress-test true operational capacity every 90 days",
          "If the test holds, raise booking caps to match — review at least yearly",
          "Aim to absorb +10% covers today without breaking service",
        ],
      },
    ],
    actions: [
      {
        id: "maximising-covers:capacity",
        label: "Calculate your max cover capacity per service",
        fields: [
          "Seats available",
          "Expected table turns per service",
          "Max covers per service (seats × turns)",
        ],
      },
      {
        id: "maximising-covers:weekly-kpis",
        label: "Set weekly KPIs for spend per cover and turn time",
        fields: [
          "Avg spend per cover — current → target",
          "Avg table turn time — current → target",
          "Capacity achieved — current % of max",
        ],
      },
      { id: "maximising-covers:reseat", label: "Set a 10-minute reset-and-reseat standard for peak" },
      { id: "maximising-covers:waitlist", label: "Run an active waitlist during peak periods" },
      { id: "maximising-covers:upsell-tracking", label: "Measure upselling performance per server weekly" },
      {
        id: "maximising-covers:stress-test",
        label: "Run a 90-day operational capacity stress test",
        fields: [
          "Date of last capacity test",
          "Covers handled vs booking cap",
          "Bottleneck found",
        ],
      },
      { id: "maximising-covers:raise-caps", label: "Review and raise booking caps to match tested capacity" },
    ],
    scripts: [
      {
        context: "Peak waitlist — text when a table opens",
        script:
          "Hi [name], it's [venue] — your table's ready now. We'll hold it for 10 minutes. See you soon!",
      },
      {
        context: "Pre-shift capacity huddle",
        script:
          "We're at [X] covers booked tonight against a [Y] cap. Clearing owner is [name] — let's reset every table inside 10 minutes and keep the waitlist moving.",
      },
    ],
  },
  {
    slug: "quick-wins",
    title: "Small Fix. Big Impact.",
    intro:
      "Twenty-one small, high-leverage changes — each one lifts revenue, cuts cost, or saves labour. You don't need all of them at once. Pick one, implement it, tick it off, and let the gains compound.",
    supportsLeak: null,
    sections: [
      {
        heading: "How to use this",
        body: "These are proven, low-effort moves — not a project plan. Work top-down or choose the ones that fit your venue right now, implement one, and check it off. The last one, The 1% Rule, is the habit that ties them all together: one improvement a month, every month.",
      },
    ],
    actions: [
      {
        id: "quick-wins:menu-engineering",
        label: "Menu Engineering — remove one low-selling menu item this month",
        detail: "Impact: Simpler ordering, lower stockholding and reduced waste.",
      },
      {
        id: "quick-wins:hero-product",
        label: "Hero Product Focus — choose one hero item and promote it in every shift brief",
        detail: "Impact: Increased average spend and sales consistency.",
      },
      {
        id: "quick-wins:daily-sales-target",
        label: "Daily Sales Target — set a daily revenue target visible to the entire team",
        detail: "Impact: Creates accountability and focus.",
      },
      {
        id: "quick-wins:supplier-rationalisation",
        label: "Supplier Rationalisation — review suppliers and consolidate where possible",
        detail: "Impact: Reduced administration and stronger buying power.",
      },
      {
        id: "quick-wins:weekly-stock-checks",
        label: "Weekly Stock Checks — stocktake one key category every week instead of waiting for month end",
        detail: "Impact: Identify issues before they become expensive.",
      },
      {
        id: "quick-wins:first-drink-five-min",
        label: "First Drink in Under Five Minutes — measure and coach around beverage delivery times",
        detail: "Impact: Improved guest satisfaction and increased beverage sales.",
      },
      {
        id: "quick-wins:pre-shift-huddles",
        label: "Pre-Shift Huddles — run a five-minute team briefing before every service",
        detail: "Impact: Better communication and fewer service mistakes.",
      },
      {
        id: "quick-wins:daily-labour-review",
        label: "Daily Labour Review — compare actual labour costs against budget every day",
        detail: "Impact: Prevents wage blowouts before payroll.",
      },
      {
        id: "quick-wins:waitlist",
        label: "Introduce a Waitlist — capture guests who would otherwise be turned away",
        detail: "Impact: Increased cover count and recovered revenue.",
      },
      {
        id: "quick-wins:clear-dead-stock",
        label: "Clear Dead Stock — identify and move one dead-stock item each week",
        detail: "Impact: Frees up cash and storage space.",
      },
      {
        id: "quick-wins:avg-spend-per-cover",
        label: "Track Average Spend Per Cover — review weekly and share results with the team",
        detail: "Impact: Reveals hidden revenue opportunities.",
      },
      {
        id: "quick-wins:events-calendar",
        label: "Build a 90-Day Events Calendar — plan promotions and trading periods ahead of time",
        detail: "Impact: More proactive revenue generation.",
      },
      {
        id: "quick-wins:portion-control",
        label: "Portion Control Audits — check the top ten menu items quarterly",
        detail: "Impact: Improved consistency and stronger gross profit.",
      },
      {
        id: "quick-wins:floor-presence",
        label: "Manager Floor Presence — spend more time on the floor and less behind a desk",
        detail: "Impact: Better coaching, service and sales execution.",
      },
      {
        id: "quick-wins:top-customers",
        label: "Review Your Top Customers — identify your highest-spending and most frequent guests",
        detail: "Impact: Increased loyalty and repeat revenue.",
      },
      {
        id: "quick-wins:reduce-complexity",
        label: "Reduce Menu Complexity — limit unnecessary modifiers and customisation options",
        detail: "Impact: Faster service and reduced kitchen errors.",
      },
      {
        id: "quick-wins:ordering-cutoffs",
        label: "Set Ordering Cut-Offs — establish clear ordering days and minimum stock levels",
        detail: "Impact: Reduced panic purchasing and overspending.",
      },
      {
        id: "quick-wins:trading-hours",
        label: "Review Trading Hours Quarterly — assess whether all opening hours are profitable",
        detail: "Impact: Eliminates unprofitable trading periods.",
      },
      {
        id: "quick-wins:kpi-dashboard",
        label: "Create a Manager KPI Dashboard — track revenue, labour, GP and average spend in one place",
        detail: "Impact: Faster and more informed decision making.",
      },
      {
        id: "quick-wins:par-level-review",
        label: "Monthly Par Level Review — update stock holding levels based on actual sales trends",
        detail: "Impact: Reduced wastage, expiry and excess inventory.",
      },
      {
        id: "quick-wins:one-percent-rule",
        label: "The 1% Rule — identify one change each month that increases revenue, reduces costs or saves labour",
        detail: "Impact: Small improvements compound into significant annual profit growth.",
      },
    ],
  },
];

export const PLAYBOOK_BY_SLUG: Record<string, Playbook> = Object.fromEntries(
  PLAYBOOKS.map((p) => [p.slug, p]),
);

export const ALL_ACTION_IDS = PLAYBOOKS.flatMap((p) =>
  p.actions.map((a) => a.id),
);

export const TOTAL_PLAYBOOK_ACTIONS = ALL_ACTION_IDS.length;

/**
 * Map of worksheet action id → number of fillable fields. Used server-side to
 * validate written entries (only known worksheet actions, capped field count).
 */
export const ACTION_FIELD_COUNTS: Record<string, number> = Object.fromEntries(
  PLAYBOOKS.flatMap((p) => p.actions)
    .filter((a) => a.fields && a.fields.length > 0)
    .map((a) => [a.id, a.fields!.length]),
);
