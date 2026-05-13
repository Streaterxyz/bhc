/**
 * Project data — placeholder set for V2 globe build.
 * Will be migrated to MDX in content/projects/*.mdx once real content arrives.
 *
 * Coordinates are [lng, lat] in WGS84.
 * All coords are real Greater Sydney suburbs / venue districts.
 */

export type ServiceKey =
  | "strategy"
  | "operations"
  | "financial"
  | "team"
  | "brand"
  | "experience";

export type ProjectType =
  | "restaurant"
  | "bar"
  | "hotel"
  | "venue-group"
  | "cafe";

export type Project = {
  slug: string;
  name: string;
  client: string;
  type: ProjectType;
  coords: [number, number];
  suburb: string;
  year: number;
  duration: string;
  services: ServiceKey[];
  headline: string;
  summary: string;
  metrics: { label: string; value: string }[];
  featured?: boolean;

  // Optional long-form case-study fields — render only when present.
  // Will be migrated to MDX in content/projects/*.mdx in Phase 2.
  challenge?: string;
  approach?: string;
  outcome?: string;
  testimonial?: {
    quote: string;
    name: string;
    role: string;
  };
};

export const SERVICE_LABELS: Record<ServiceKey, string> = {
  strategy: "Strategy & Advisory",
  operations: "Operational Systems",
  financial: "Financial & Commercial",
  team: "Team & Talent",
  brand: "Brand & Growth",
  experience: "Experience Design",
};

export const TYPE_LABELS: Record<ProjectType, string> = {
  restaurant: "Restaurant",
  bar: "Bar",
  hotel: "Hotel",
  "venue-group": "Venue Group",
  cafe: "Cafe",
};

// 20 placeholder projects across Greater Sydney
// Real client names + content will replace these as Brendon supplies them.
export const projects: Project[] = [
  {
    slug: "harbourside-collective",
    name: "Harbourside Collective",
    client: "Harbourside Collective",
    type: "venue-group",
    coords: [151.2153, -33.8568],
    suburb: "Circular Quay",
    year: 2024,
    duration: "9 months",
    services: ["strategy", "operations", "financial"],
    headline: "Multi-venue group restructured for sustainable scale",
    summary:
      "Stabilised operations across four harbourside venues, unifying systems and lifting group margin.",
    metrics: [
      { label: "Net margin lift", value: "+18%" },
      { label: "Venues optimised", value: "4" },
      { label: "Labour cost reduction", value: "−6.2%" },
    ],
    featured: true,
  },
  {
    slug: "surry-hills-supper",
    name: "Surry Hills Supper Club",
    client: "Supper Club Co.",
    type: "restaurant",
    coords: [151.2118, -33.8847],
    suburb: "Surry Hills",
    year: 2024,
    duration: "6 months",
    services: ["experience", "brand", "team"],
    headline: "Cocktail-led dining concept that re-launched a tired venue",
    summary:
      "Repositioned a fading 90-cover venue into Surry Hills' most-booked supper club.",
    metrics: [
      { label: "Revenue uplift", value: "+34%" },
      { label: "Bookings per week", value: "+260%" },
      { label: "Avg spend per head", value: "+$28" },
    ],
    featured: true,
  },
  {
    slug: "bondi-beach-club",
    name: "Bondi Beach Club",
    client: "Beach Club Hospitality",
    type: "bar",
    coords: [151.2766, -33.8915],
    suburb: "Bondi Beach",
    year: 2023,
    duration: "4 months",
    services: ["experience", "operations"],
    headline: "Daytime cocktail program built for coastal volume",
    summary:
      "Designed a beach-volume beverage program and service flow that doubled bar revenue in summer trade.",
    metrics: [
      { label: "Bar revenue", value: "+102%" },
      { label: "GP%", value: "+11pts" },
      { label: "Avg ticket time", value: "−42s" },
    ],
    featured: true,
  },
  {
    slug: "north-sydney-grand",
    name: "The North Sydney Grand",
    client: "Grand Hotels",
    type: "hotel",
    coords: [151.2074, -33.8389],
    suburb: "North Sydney",
    year: 2024,
    duration: "12 months",
    services: ["strategy", "experience", "team"],
    headline: "Repositioned F&B across a 180-room hotel",
    summary:
      "Built and rolled out three new venues inside an established CBD hotel — bar, restaurant, and rooftop.",
    metrics: [
      { label: "F&B revenue", value: "+47%" },
      { label: "New venues launched", value: "3" },
      { label: "Guest score (F&B)", value: "9.2/10" },
    ],
  },
  {
    slug: "parramatta-bistro",
    name: "Parramatta Bistro",
    client: "Riverside Hospitality",
    type: "restaurant",
    coords: [151.0017, -33.8136],
    suburb: "Parramatta",
    year: 2024,
    duration: "5 months",
    services: ["operations", "financial", "team"],
    headline: "Margin turnaround for a 200-seat suburban bistro",
    summary:
      "Rebuilt costing, menu, and roster systems to take a struggling neighbourhood bistro back to profit.",
    metrics: [
      { label: "EBITDA shift", value: "Negative → 14%" },
      { label: "COGS reduction", value: "−4.8pts" },
      { label: "Staff retention", value: "+38%" },
    ],
  },
  {
    slug: "manly-wine-bar",
    name: "Manly Wine Bar",
    client: "Coast & Vine",
    type: "bar",
    coords: [151.2853, -33.7969],
    suburb: "Manly",
    year: 2023,
    duration: "3 months",
    services: ["brand", "experience"],
    headline: "Wine bar identity that won a loyal local following",
    summary:
      "Defined positioning, beverage program, and service identity for a new northern beaches wine bar.",
    metrics: [
      { label: "Repeat patron rate", value: "62%" },
      { label: "Wine GP%", value: "71%" },
      { label: "Time to breakeven", value: "4.5 months" },
    ],
  },
  {
    slug: "newtown-trattoria",
    name: "Newtown Trattoria",
    client: "Famiglia Group",
    type: "restaurant",
    coords: [151.1797, -33.8959],
    suburb: "Newtown",
    year: 2023,
    duration: "7 months",
    services: ["strategy", "brand", "experience"],
    headline: "Family trattoria reborn for a new generation of locals",
    summary:
      "Modernised a 22-year-old family restaurant without losing the soul that built its loyal customer base.",
    metrics: [
      { label: "Covers per week", value: "+71%" },
      { label: "Avg spend", value: "+$22" },
      { label: "Press features", value: "9" },
    ],
  },
  {
    slug: "darlinghurst-late",
    name: "Darlinghurst Late",
    client: "Late Nights Hospitality",
    type: "bar",
    coords: [151.2169, -33.8786],
    suburb: "Darlinghurst",
    year: 2024,
    duration: "4 months",
    services: ["experience", "operations"],
    headline: "Late-night cocktail bar built for Sydney's lockout era",
    summary:
      "Designed a high-margin, low-headcount late-trade venue that thrives in Sydney's tighter night economy.",
    metrics: [
      { label: "Weekly revenue", value: "$78k avg" },
      { label: "Labour cost", value: "21%" },
      { label: "GP%", value: "78%" },
    ],
  },
  {
    slug: "potts-point-hotel",
    name: "Potts Point Hotel",
    client: "PPH Group",
    type: "hotel",
    coords: [151.2247, -33.8678],
    suburb: "Potts Point",
    year: 2024,
    duration: "8 months",
    services: ["strategy", "operations", "team"],
    headline: "Boutique hotel F&B systemised end-to-end",
    summary:
      "Built standard operating systems across rooms, bar, and restaurant for a growing boutique hotel.",
    metrics: [
      { label: "Operational efficiency", value: "+29%" },
      { label: "Complaint rate", value: "−61%" },
      { label: "RevPAR uplift", value: "+12%" },
    ],
  },
  {
    slug: "chippendale-roastery",
    name: "Chippendale Roastery",
    client: "Roastery Co.",
    type: "cafe",
    coords: [151.1985, -33.8851],
    suburb: "Chippendale",
    year: 2023,
    duration: "3 months",
    services: ["brand", "experience"],
    headline: "Specialty roaster scales without losing the craft",
    summary:
      "Built brand and customer experience systems to support a third site without diluting the original venue's reputation.",
    metrics: [
      { label: "Sites launched", value: "2" },
      { label: "Repeat customers", value: "+44%" },
      { label: "Brand recall", value: "Top 5 in suburb" },
    ],
  },
  {
    slug: "barangaroo-rooftop",
    name: "Barangaroo Rooftop",
    client: "Skyline Group",
    type: "bar",
    coords: [151.2009, -33.8615],
    suburb: "Barangaroo",
    year: 2024,
    duration: "5 months",
    services: ["experience", "brand", "operations"],
    headline: "Rooftop bar program for Sydney's premier waterfront precinct",
    summary:
      "Created the beverage and service program for a 280-capacity harbour-facing rooftop.",
    metrics: [
      { label: "Avg spend", value: "$72" },
      { label: "Sell-out weekends", value: "100%" },
      { label: "Cost of sales", value: "24%" },
    ],
  },
  {
    slug: "double-bay-grill",
    name: "Double Bay Grill",
    client: "Bay Hospitality",
    type: "restaurant",
    coords: [151.2429, -33.8784],
    suburb: "Double Bay",
    year: 2023,
    duration: "6 months",
    services: ["financial", "operations", "experience"],
    headline: "Upmarket grill optimised for a discerning local",
    summary:
      "Lifted profitability and consistency at an established eastern suburbs grill restaurant.",
    metrics: [
      { label: "Net profit", value: "+22%" },
      { label: "Wine sales", value: "+38%" },
      { label: "Avg covers", value: "+18%" },
    ],
  },
  {
    slug: "marrickville-pub",
    name: "Marrickville Public",
    client: "Public House Co.",
    type: "venue-group",
    coords: [151.1564, -33.9111],
    suburb: "Marrickville",
    year: 2024,
    duration: "10 months",
    services: ["strategy", "brand", "team"],
    headline: "Heritage pub reimagined for an inner-west community",
    summary:
      "Repositioned a 100-year-old pub into a multi-use community hospitality space.",
    metrics: [
      { label: "Weekly trade", value: "+58%" },
      { label: "Function bookings", value: "+210%" },
      { label: "Team retention", value: "91%" },
    ],
  },
  {
    slug: "alexandria-warehouse",
    name: "Alexandria Warehouse",
    client: "Warehouse Hospitality",
    type: "restaurant",
    coords: [151.1947, -33.9106],
    suburb: "Alexandria",
    year: 2023,
    duration: "4 months",
    services: ["operations", "experience"],
    headline: "300-cover warehouse venue launched on time and on budget",
    summary:
      "Operational design, training, and launch for one of Sydney's largest new venues of the year.",
    metrics: [
      { label: "Launch capacity", value: "300 covers" },
      { label: "Week 1 sell-out", value: "Yes" },
      { label: "On-budget", value: "100%" },
    ],
  },
  {
    slug: "mosman-cafe",
    name: "Mosman Cafe",
    client: "Mosman F&B",
    type: "cafe",
    coords: [151.2493, -33.8278],
    suburb: "Mosman",
    year: 2024,
    duration: "3 months",
    services: ["brand", "operations"],
    headline: "Café concept that doubled weekday trade",
    summary:
      "Refined menu, service flow, and brand positioning for a struggling lower north shore café.",
    metrics: [
      { label: "Weekday revenue", value: "+98%" },
      { label: "Avg ticket", value: "+$8" },
      { label: "Reviews", value: "4.8★" },
    ],
  },
  {
    slug: "kings-cross-cocktail",
    name: "Kings Cross Cocktail Bar",
    client: "Cross Hospitality",
    type: "bar",
    coords: [151.2225, -33.8736],
    suburb: "Kings Cross",
    year: 2024,
    duration: "5 months",
    services: ["experience", "brand"],
    headline: "A cocktail bar that put a forgotten strip back on the map",
    summary:
      "Concept, beverage program, and service identity for a high-profile Kings Cross relaunch.",
    metrics: [
      { label: "Bar revenue", value: "$95k/wk" },
      { label: "Media features", value: "14" },
      { label: "Industry awards", value: "2" },
    ],
  },
  {
    slug: "rosebery-eatery",
    name: "Rosebery Eatery",
    client: "Eastside Eats",
    type: "restaurant",
    coords: [151.2026, -33.9197],
    suburb: "Rosebery",
    year: 2023,
    duration: "6 months",
    services: ["strategy", "financial"],
    headline: "Neighbourhood eatery returned to consistent profitability",
    summary:
      "Systems, costing, and weekly operating rhythm rebuilt for a young owner-operator.",
    metrics: [
      { label: "Net profit", value: "+19%" },
      { label: "Owner hours", value: "−18/wk" },
      { label: "Staff turnover", value: "−42%" },
    ],
  },
  {
    slug: "chatswood-yum-cha",
    name: "Chatswood Yum Cha",
    client: "Lotus Hospitality",
    type: "restaurant",
    coords: [151.1828, -33.7969],
    suburb: "Chatswood",
    year: 2024,
    duration: "4 months",
    services: ["operations", "team"],
    headline: "High-volume restaurant systemised for consistency",
    summary:
      "Standardised a chaotic 280-seat yum cha operation, lifting both team and guest experience.",
    metrics: [
      { label: "Service errors", value: "−71%" },
      { label: "Avg wait time", value: "−9 min" },
      { label: "Team retention", value: "+33%" },
    ],
  },
  {
    slug: "cronulla-beachhouse",
    name: "Cronulla Beachhouse",
    client: "Beachhouse Group",
    type: "restaurant",
    coords: [151.1547, -34.0581],
    suburb: "Cronulla",
    year: 2023,
    duration: "5 months",
    services: ["brand", "experience", "operations"],
    headline: "Beachside restaurant repositioned for year-round trade",
    summary:
      "Built a winter program and brand strategy that turned a seasonal venue into a year-round destination.",
    metrics: [
      { label: "Winter trade", value: "+118%" },
      { label: "Avg cover", value: "+$26" },
      { label: "Local repeat rate", value: "58%" },
    ],
  },
  {
    slug: "the-rocks-tavern",
    name: "The Rocks Tavern",
    client: "Harbour Taverns",
    type: "venue-group",
    coords: [151.2089, -33.8597],
    suburb: "The Rocks",
    year: 2024,
    duration: "8 months",
    services: ["strategy", "operations", "team"],
    headline: "Heritage tavern group modernised without losing soul",
    summary:
      "Operational uplift across three heritage-listed Rocks venues, preserving character while improving margin.",
    metrics: [
      { label: "Group margin", value: "+11pts" },
      { label: "Tourist spend", value: "+24%" },
      { label: "Service NPS", value: "82" },
    ],
  },
];

export function getFeaturedProjects() {
  return projects.filter((p) => p.featured);
}

export function getProjectBySlug(slug: string) {
  return projects.find((p) => p.slug === slug);
}

/**
 * Find projects related to the given slug. Scored by overlap on suburb,
 * type, and services. Returns up to `limit` results.
 */
export function getRelatedProjects(slug: string, limit = 3): Project[] {
  const base = getProjectBySlug(slug);
  if (!base) return [];

  const scored = projects
    .filter((p) => p.slug !== slug)
    .map((p) => {
      let score = 0;
      if (p.suburb === base.suburb) score += 4;
      if (p.type === base.type) score += 3;
      score += p.services.filter((s) => base.services.includes(s)).length;
      return { project: p, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map((s) => s.project);
}
