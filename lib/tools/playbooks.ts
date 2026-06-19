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
    title: "Menu Design Psychology",
    intro:
      "Design a menu that quietly guides guests toward your best-margin, best-experience choices — while still feeling guest-first.",
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
    ],
    actions: [
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
      "Seasonality without chaos — increase perceived value, reduce waste, and create marketing moments while keeping execution simple.",
    supportsLeak: "menu-profitability",
    sections: [
      {
        heading: "Define what seasonal means for you",
        bullets: [
          "Ingredient seasonal: produce, seafood, game",
          "Weather seasonal: lighter in heat, richer in cold",
          "Occasion seasonal: holidays, events, local festivals",
          "Behavioural seasonal: school holidays, tourism peaks, footy season",
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
      "A system that builds perceived value, improves flow, and increases add-ons — a consistent guest journey across the team.",
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
