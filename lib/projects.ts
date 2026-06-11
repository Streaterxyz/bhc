/**
 * Project data — 8 real case studies supplied by Brendon (Nov 2024 handoff).
 *
 * The schema supports two complementary "outcome" formats:
 *   - metrics: numeric stat tiles (big +22%, small caption) — the original
 *     PRD format, still used for projects where a hero stat exists.
 *   - pillars: narrative outcome blocks (title + paragraph) — used where
 *     Brendon's content describes outcome areas without a clean single
 *     number to lead with. Both can co-exist on the same project.
 *
 * Coordinates are [lng, lat] in WGS84, sourced from the venue addresses
 * Brendon supplied (rounded to ~10m precision via memory geocoding —
 * exact decimal places can be tightened post-launch).
 */

export type ServiceKey =
  | "strategy"
  | "operations"
  | "financial"
  | "team"
  | "brand"
  | "experience"
  // Expanded for Brendon's real engagements:
  | "beverage" // Beverage Strategy / Programs
  | "pre-opening" // Venue opening support, launch operations
  | "concept" // Concept Development, Greenfield projects
  | "product-dev" // Product Development (e.g. RTD beverage brands)
  | "mentorship"; // Owner / leadership mentorship

export type ProjectType =
  | "restaurant"
  | "bar"
  | "hotel"
  | "venue-group"
  | "cafe"
  | "beverage-brand"; // RTD / product brands (e.g. Miss Swig)

export type Metric = { label: string; value: string };
export type Pillar = { title: string; body: string };

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

  /** Numeric stat tiles. Optional — projects may use pillars instead. */
  metrics?: Metric[];
  /** Narrative outcome blocks (title + paragraph). Optional. */
  pillars?: Pillar[];

  featured?: boolean;

  /** Optional external link to the venue/brand site. */
  website?: string;

  // Optional long-form case-study fields — render only when present.
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
  beverage: "Beverage Strategy",
  "pre-opening": "Pre-Opening Support",
  concept: "Concept Development",
  "product-dev": "Product Development",
  mentorship: "Business Mentorship",
};

export const TYPE_LABELS: Record<ProjectType, string> = {
  restaurant: "Restaurant",
  bar: "Bar",
  hotel: "Hotel",
  "venue-group": "Venue Group",
  cafe: "Cafe",
  "beverage-brand": "Beverage Brand",
};

export const projects: Project[] = [
  // ─────────────────────────────────────────────────────────────────
  // 1 — Cabravale Club Resort (Canley Vale)
  // ─────────────────────────────────────────────────────────────────
  {
    slug: "cabravale-club-resort",
    name: "Cabravale Club Resort",
    client: "Cabravale Club Resort",
    type: "hotel",
    coords: [150.945, -33.892],
    suburb: "Canley Vale",
    year: 2025,
    duration: "12 months (ongoing)",
    services: [
      "strategy",
      "operations",
      "financial",
      "team",
      "brand",
      "experience",
      "beverage",
    ],
    website: "https://cabravale.com.au/",
    featured: true,
    headline:
      "Transforming a newly renovated resort through operational excellence, commercial beverage strategy, team development and guest experience activation.",
    summary:
      "Partnered with Cabravale Club Resort to elevate beverage operations, develop future hospitality leaders, increase profitability and activate newly renovated hospitality spaces through strategic training, systems and commercial direction.",
    pillars: [
      {
        title: "People & Culture",
        body: "Established clear development pathways, mentorship programs and internal training systems, improving team capability, staff retention and overall employee engagement across the Bar Curator team.",
      },
      {
        title: "Commercial Performance",
        body: "Delivered a sustained minimum 15% month-on-month uplift in beverage net margin through menu engineering, operational improvements and stronger commercial controls.",
      },
      {
        title: "Operational Excellence",
        body: "Redesigned bar workflows, service procedures and roster management systems to improve guest experience, service consistency and floor presence across multiple venues.",
      },
    ],
    challenge:
      "Following a significant redevelopment, Cabravale Club Resort had effectively become a new hospitality destination. The venue footprint had doubled in size, introducing multiple new hospitality offerings, increased staffing requirements and elevated guest expectations.\n\nWhile the physical transformation had created an exceptional hospitality environment, the operational infrastructure, beverage strategy and team capability needed to evolve to match the quality of the new brand experience.\n\nThe resort required a clear commercial beverage direction, stronger operational systems, enhanced team capability and a structured pathway to develop future leaders capable of executing at the standard the new venue demanded.",
    approach:
      "BHC implemented a phased development strategy focused on building strong foundations before driving commercial growth.\n\nThe initial phase involved a comprehensive operational audit, working directly within the venue alongside management and frontline teams to identify opportunities across service, training, workflows and commercial performance.\n\nOnce key opportunities were identified, attention shifted toward people and culture. Emerging leaders were identified, development pathways were established and foundational training programs were introduced covering beverage knowledge, service standards, operational excellence and guest engagement.\n\nWith the team operating at a stronger baseline level, the next phase focused on growth and activation — advanced beverage and bartending training, upselling and revenue-driving service techniques, FOH service and guest experience development, beverage menu optimisation, venue activations, marketing collaboration and leadership development for supervisors.\n\nIn parallel, BHC assisted in developing the Cabravale Boutique retail offering, introducing visual merchandising principles and operational systems designed to enhance the customer experience and retail performance.",
    outcome:
      "The partnership has delivered significant improvements across commercial performance, team capability and guest experience: sustained beverage net margin growth of 15%+ month-on-month, improved staff retention and engagement, the creation of internal development pathways and mentorship programs, stronger leadership capability within the supervisory team, improved service standards and guest satisfaction scores, increased repeat visitation, enhanced operational efficiency through improved workflows and rostering, and the successful activation of newly renovated hospitality spaces.\n\nToday, Cabravale Club Resort operates with a significantly more capable team, stronger commercial foundations and a clear roadmap for continued growth as one of Western Sydney's premier hospitality destinations.",
  },

  // ─────────────────────────────────────────────────────────────────
  // 2 — Crossroads Hotel (Casula)
  // ─────────────────────────────────────────────────────────────────
  {
    slug: "crossroads-hotel",
    name: "Crossroads Hotel",
    client: "Sonnel Hospitality",
    type: "hotel",
    coords: [150.91, -33.952],
    suburb: "Casula",
    year: 2024,
    duration: "18 months (ongoing)",
    services: [
      "strategy",
      "operations",
      "financial",
      "team",
      "brand",
      "experience",
      "beverage",
      "concept",
    ],
    website: "https://crossroadshotel.com.au/",
    featured: true,
    headline:
      "Elevating Crossroads Hotel into a food and beverage-led hospitality destination through strategic menu development, team training and guest experience innovation.",
    summary:
      "Partnered with Crossroads Hotel to transform beverage operations, increase profitability, improve service delivery and create destination-worthy guest experiences through strategy, training and commercial beverage development.",
    pillars: [
      {
        title: "Commercial Growth",
        body: "Implemented a commercially focused beverage strategy that improved profitability, menu performance and operational consistency across multiple outlets.",
      },
      {
        title: "Team Development",
        body: "Developed and trained front-of-house teams through structured beverage education, service standards and sales confidence programs.",
      },
      {
        title: "Guest Experience",
        body: "Created destination-led beverage experiences and seasonal activations that enhanced customer engagement and strengthened venue positioning.",
      },
    ],
    challenge:
      "Crossroads Hotel had undergone significant investment and redevelopment, positioning itself as one of South-West Sydney's largest hospitality destinations.\n\nWith multiple revenue streams including bars, dining, accommodation, functions and entertainment, the venue required a more sophisticated beverage strategy that aligned with the scale of the operation and the expectations of modern hospitality guests.\n\nWhile the venue already had strong foundations, there was an opportunity to further elevate beverage performance, improve team capability, simplify operational execution and create unique guest experiences that would differentiate Crossroads within a highly competitive market.",
    approach:
      "BHC worked closely with venue leadership to build a beverage and guest experience strategy designed to drive both commercial performance and customer engagement.\n\nThe project focused on several key areas: beverage menu engineering and profitability analysis, development of signature cocktail programs, seasonal menu creation and activation planning, service and sales training for front-of-house teams, beverage knowledge and upselling programs, operational workflow reviews, the creation of destination-focused beverage experiences and ongoing coaching for venue leadership.\n\nA key focus was ensuring every beverage offering served a commercial purpose while remaining approachable and relevant to the Crossroads guest demographic. Menus were simplified where required, high-margin opportunities were identified and the team was equipped with the tools and confidence needed to consistently deliver elevated service experiences.",
    outcome:
      "Crossroads Hotel now operates with a more commercially focused beverage program supported by stronger team capability and improved guest engagement: increased beverage profitability through strategic menu optimisation, improved beverage mix and sales performance, stronger staff confidence in beverage recommendations and upselling, more efficient service execution, successful seasonal activations and signature beverage experiences, increased repeat visitation and greater alignment between venue operations, marketing and commercial objectives.\n\nToday, Crossroads Hotel continues to strengthen its position as one of South-West Sydney's leading hospitality destinations, with a beverage program designed to support both exceptional guest experiences and sustainable commercial performance.",
  },

  // ─────────────────────────────────────────────────────────────────
  // 3 — Sonnel Group (19 venues, HQ Burwood)
  // ─────────────────────────────────────────────────────────────────
  {
    slug: "sonnel",
    name: "Sonnel",
    client: "Sonnel Hospitality Group",
    type: "venue-group",
    coords: [151.103, -33.878],
    suburb: "Burwood",
    year: 2024,
    duration: "18 months (ongoing)",
    services: [
      "strategy",
      "beverage",
      "operations",
      "team",
      "financial",
      "experience",
    ],
    website: "https://sonnel.com.au/",
    featured: true,
    headline:
      "Building group-wide hospitality standards, beverage strategy and operational excellence across a portfolio of leading hospitality venues.",
    summary:
      "Partnered with Sonnel Hospitality Group to establish scalable hospitality systems, beverage strategies and team development frameworks across a diverse portfolio of hotels, restaurants and entertainment venues.",
    pillars: [
      {
        title: "Group Standards",
        body: "Developed and implemented group-wide beverage, service and operational standards designed to create consistency across multiple venues and teams.",
      },
      {
        title: "Leadership Development",
        body: "Created structured training and development pathways for venue leaders, supervisors and frontline teams to support long-term operational success.",
      },
      {
        title: "Portfolio Growth",
        body: "Established scalable systems and commercial frameworks that allow individual venues to improve performance while maintaining alignment with the wider group vision.",
      },
    ],
    challenge:
      "As Sonnel Hospitality Group continued to expand and invest in its growing portfolio, there was an opportunity to create greater consistency across operations, guest experience and beverage performance.\n\nWith a diverse collection of venues operating across different demographics, markets and service styles, maintaining alignment while preserving each venue's individual identity became increasingly important.\n\nThe group required a scalable framework that could improve team capability, operational execution and commercial performance while supporting future growth.",
    approach:
      "BHC was engaged to work alongside senior leadership to develop a hospitality framework capable of supporting both individual venue success and broader group objectives.\n\nThe project focused on creating practical systems that could be implemented across multiple venues while remaining flexible enough to suit each venue's unique operating environment.\n\nKey initiatives included the development of Sonnel Hospitality Beverage Standards, group-wide front-of-house service standards, beverage menu strategy and optimisation, leadership and management development programs, team training frameworks and educational resources, seasonal beverage planning and activation strategies, commercial performance reviews and profitability analysis, venue-by-venue operational assessments, and the development of scalable implementation systems for future venues.\n\nThe approach prioritised simplicity, consistency and long-term sustainability, ensuring standards could be successfully embedded within daily operations rather than existing as standalone training programs.",
    outcome:
      "The partnership established stronger foundations across the Sonnel Hospitality portfolio: group-wide hospitality standards implemented across multiple venues, improved consistency in service delivery, enhanced beverage programs aligned with commercial objectives, stronger leadership capability across management teams, structured training pathways supporting employee development, increased operational accountability, improved collaboration between venue teams and group leadership, and scalable systems designed to support future venue acquisitions and developments.\n\nToday, Sonnel Hospitality Group operates with a stronger operational framework, clearer service standards and a scalable platform that supports both venue-level excellence and long-term portfolio growth.",
  },

  // ─────────────────────────────────────────────────────────────────
  // 4 — The Nielsen (Vaucluse, Sydney Restaurant Group)
  // ─────────────────────────────────────────────────────────────────
  {
    slug: "the-nielsen",
    name: "The Nielsen",
    client: "Sydney Restaurant Group",
    type: "restaurant",
    coords: [151.275, -33.854],
    suburb: "Vaucluse",
    year: 2025,
    duration: "4 months",
    services: ["pre-opening", "operations", "team", "experience"],
    website: "https://thenielsen.com.au/",
    featured: true,
    headline:
      "Developing the execution of a premium beverage and service program for one of Sydney's most iconic waterfront dining destinations.",
    summary:
      "Partnered with Sydney Restaurant Group to support the launch and operational development of The Nielsen, creating beverage systems, service standards and training frameworks aligned with a premium guest experience.",
    pillars: [
      {
        title: "Opening Readiness",
        body: "Developed beverage systems, operational procedures and service frameworks to support a successful venue launch.",
      },
      {
        title: "Team Development",
        body: "Delivered structured on-shift training programs focused on beverage knowledge, premium service standards, speed, efficiency and guest experience execution.",
      },
      {
        title: "Guest Experience",
        body: "Created a beverage and service strategy aligned with the venue's premium waterfront positioning and long-term operational goals — QSR, restaurant and events.",
      },
    ],
    challenge:
      "The Nielsen represented a significant opportunity for Sydney Restaurant Group to create a premium hospitality destination within one of Sydney's most recognisable waterfront locations.\n\nWith a unique combination of QSR, restaurant dining, events and destination tourism, the venue required operational systems, beverage standards and team capability that matched the quality of the physical asset and guest expectations.\n\nThe challenge was to ensure the venue launched with a cohesive guest experience while building foundations capable of supporting long-term operational success.",
    approach:
      "BHC worked alongside venue leadership and Sydney Restaurant Group to develop the beverage and service infrastructure required for a premium hospitality operation.\n\nThe focus extended beyond menu creation and included the systems, training and operational frameworks required to support a consistent guest experience.\n\nKey initiatives included beverage program development and menu consultation, premium wine, spirits and cocktail service training, front-of-house service standards and guest journey design, operational workflow reviews, opening support and implementation assistance, team capability development and coaching, service sequence creation and refinement, commercial beverage strategy and menu structure, and leadership support during launch and establishment phases.\n\nBy combining operational practicality with premium hospitality principles, the venue was able to establish systems that supported both guest satisfaction and long-term scalability.",
    outcome:
      "The Nielsen launched with stronger operational foundations, clearer service standards and a beverage program designed to complement its premium positioning: successful implementation of premium beverage and service standards, improved team confidence and capability through structured training, clear guest experience frameworks for front-of-house teams, operational systems designed to support consistency and efficiency, beverage offerings aligned with the venue's premium market position, enhanced collaboration between venue leadership and operational teams, and scalable systems capable of supporting both restaurant and event operations.\n\nToday, The Nielsen continues to operate with a structured hospitality framework that supports exceptional guest experiences while maintaining operational efficiency across a complex premium venue environment.",
  },

  // ─────────────────────────────────────────────────────────────────
  // 5 — The Grounds (Alexandria)
  // ─────────────────────────────────────────────────────────────────
  {
    slug: "the-grounds",
    name: "The Grounds",
    client: "The Grounds",
    type: "venue-group",
    coords: [151.195, -33.913],
    suburb: "Alexandria",
    year: 2018,
    duration: "Ongoing",
    services: [
      "strategy",
      "beverage",
      "operations",
      "experience",
      "concept",
    ],
    website: "https://thegrounds.com.au/",
    headline:
      "Supporting one of Australia's most iconic hospitality destinations through beverage strategy, operational advisory and experience-led venue development.",
    summary:
      "Engaged to develop and implement a comprehensive beverage strategy before continuing as a trusted advisor across venue development, activations and guest experience initiatives throughout The Grounds precinct.",
    pillars: [
      {
        title: "Beverage Strategy",
        body: "Designed and implemented a scalable beverage strategy aligned with the operational complexity and guest expectations of one of Australia's highest-volume hospitality destinations.",
      },
      {
        title: "Long-Term Partnership",
        body: "Maintained an ongoing advisory relationship since 2018, supporting venue evolution, operational improvements and new experience opportunities including the laneway activations.",
      },
      {
        title: "Experience & Commercial Growth",
        body: "Contributed to the development and activation of new hospitality experiences and precinct expansions, helping strengthen The Grounds' destination appeal.",
      },
    ],
    challenge:
      "The Grounds had already established itself as one of Australia's most recognisable hospitality brands, attracting thousands of guests each week across dining, retail, events and immersive guest experiences.\n\nAs the business continued to grow, there was a need to create a beverage strategy capable of supporting both operational efficiency and guest experience at scale.\n\nThe challenge was to design systems that could handle high-volume service periods while maintaining the quality, consistency and attention to detail that had become synonymous with The Grounds brand. As the precinct continued to evolve, further opportunities emerged around venue development, guest experience design and activation planning.",
    approach:
      "BHC was initially engaged to review and develop the beverage strategy across the precinct. The project focused on creating commercially sustainable beverage systems that aligned with the unique operational requirements of The Grounds while enhancing the guest experience.\n\nKey initiatives included beverage strategy development and implementation, menu engineering and commercial reviews, operational workflow analysis, service and execution recommendations, venue activation and guest experience consultation, advisory support for precinct development projects, concept development for emerging hospitality opportunities and strategic input into future venue and laneway activations.\n\nAs the relationship evolved, BHC continued to provide advisory support across a range of projects, acting as an external strategic partner to assist with operational thinking, hospitality trends and guest experience opportunities.",
    outcome:
      "The partnership has extended well beyond the original beverage strategy engagement, evolving into a trusted advisory relationship spanning multiple years and projects: successful implementation of a scalable beverage strategy, improved alignment between beverage operations and guest experience, long-term strategic partnership supporting ongoing venue evolution, advisory support across multiple development and activation projects, enhanced operational thinking around guest flow and service delivery, contribution to new hospitality concepts and experiential offerings, and a trusted advisor relationship maintained across multiple business growth phases.\n\nToday, The Grounds continues to set benchmarks for hospitality experiences in Australia, with BHC proud to have played a role in supporting both its operational foundations and ongoing evolution as a destination venue.",
    testimonial: {
      quote:
        "BHC brought a practical hospitality lens to our beverage strategy while understanding the bigger picture of guest experience and venue operations. The relationship has continued well beyond the original project, making Brendon a trusted sounding board for future opportunities and development.",
      name: "Ramzey Choker",
      role: "Founder, The Grounds",
    },
  },

  // ─────────────────────────────────────────────────────────────────
  // 6 — Barenz (Camden)
  // ─────────────────────────────────────────────────────────────────
  {
    slug: "barenz",
    name: "Barenz",
    client: "Barenz",
    type: "cafe",
    coords: [150.696, -34.055],
    suburb: "Camden",
    year: 2026,
    duration: "Ongoing",
    services: [
      "mentorship",
      "strategy",
      "operations",
      "brand",
      "beverage",
    ],
    website: "https://barenz.com.au/",
    headline:
      "Mentoring Kym to strengthen profitability, operational performance and guest experience across a growing all-day hospitality venue.",
    summary:
      "Partnered with Barenz to improve commercial performance, pricing strategy, beverage profitability and operational decision-making while supporting long-term growth across the café, restaurant and bar operation.",
    pillars: [
      {
        title: "Commercial Performance",
        body: "Developed pricing, costing and profitability frameworks that improved commercial confidence and strengthened financial decision-making.",
      },
      {
        title: "Operational Excellence",
        body: "Introduced systems and planning processes designed to improve operational efficiency, team accountability and day-to-day execution.",
      },
      {
        title: "Sustainable Growth",
        body: "Created strategic growth initiatives focused on increasing profitability while maintaining guest experience and venue quality.",
      },
    ],
    challenge:
      "Barenz had established itself as a popular all-day hospitality destination, successfully operating across breakfast, lunch, dinner and evening beverage service.\n\nAs the venue continued to grow, rising operating costs, increasing wage pressures and evolving customer expectations created new challenges around profitability, pricing and operational efficiency.\n\nThe ownership team required strategic support to better understand venue performance, improve commercial outcomes and build stronger systems that would support long-term sustainable growth.",
    approach:
      "BHC was engaged to work alongside ownership and leadership, providing strategic guidance focused on profitability, operations and growth.\n\nThe engagement centred on creating practical systems that allowed the business to make more informed commercial decisions while maintaining the guest experience that had made the venue successful.\n\nKey initiatives included menu and pricing strategy reviews, product costing and margin analysis, beverage profitability assessments, commercial performance reviews, monthly business planning sessions, operational systems and workflow recommendations, leadership support and accountability frameworks, revenue opportunity identification, customer experience and service reviews and long-term growth planning.\n\nA key focus of the engagement was helping ownership confidently implement pricing strategies while ensuring operational decisions were supported by clear financial data and performance indicators.",
    outcome:
      "The partnership has delivered stronger commercial visibility, improved operational clarity and greater confidence across key business decisions: improved pricing and profitability strategies, stronger commercial understanding across the business, more effective planning and decision-making processes, enhanced beverage and menu profitability, improved operational accountability, increased confidence around business growth initiatives, better visibility across venue performance metrics, stronger foundations for sustainable long-term growth and ongoing strategic support for ownership.\n\nToday, Barenz operates with greater commercial clarity, stronger operational systems and a clear roadmap for continued growth across its café, restaurant and bar offering.",
  },

  // ─────────────────────────────────────────────────────────────────
  // 7 — Miss Swig (RTD beverage brand, Sydney)
  // ─────────────────────────────────────────────────────────────────
  {
    slug: "miss-swig",
    name: "Miss Swig",
    client: "Miss Swig",
    type: "beverage-brand",
    coords: [151.207, -33.866],
    suburb: "Sydney",
    year: 2024,
    duration: "Ongoing",
    services: [
      "strategy",
      "product-dev",
      "beverage",
      "financial",
      "brand",
      "operations",
    ],
    website: "https://missswig.com.au/",
    headline:
      "Transforming an idea into a commercially viable beverage brand through product development, strategy and market execution.",
    summary:
      "Partnered with Miss Swig from product conception through to commercialisation, helping develop the product, build the go-to-market strategy and create the foundations for long-term growth.",
    pillars: [
      {
        title: "Product Development",
        body: "Worked alongside founders and food scientists to develop, refine and commercialise a market-ready beverage product.",
      },
      {
        title: "Go-to-Market Strategy",
        body: "Built wholesale, direct-to-consumer and e-commerce strategies designed to support sustainable growth and market penetration.",
      },
      {
        title: "Commercial Foundations",
        body: "Established pricing models, batching systems and sales frameworks that support scalability and profitability.",
      },
    ],
    challenge:
      "Miss Swig began with a strong concept and a clear vision, but like many emerging beverage brands, required support to transform an idea into a commercially viable product.\n\nThe challenge extended beyond product creation. The business required guidance across formulation, production planning, pricing, route-to-market strategy, sales development and operational systems to ensure the brand could successfully launch and scale.\n\nThe founders needed an experienced hospitality and beverage partner capable of connecting product development with real-world commercial execution.",
    approach:
      "BHC partnered closely with the founders throughout the development journey, providing strategic guidance from concept through to market readiness.\n\nWorking alongside food scientists and product specialists, the focus was to ensure the final product not only delivered on flavour and quality but could also succeed commercially.\n\nKey initiatives included product development and refinement, collaboration with food scientists and manufacturing partners, commercial viability assessments, product positioning and market strategy, wholesale go-to-market planning, e-commerce strategy development, pricing and margin modelling, sales strategy and customer acquisition planning, production and batching systems and ongoing operational and commercial advisory support.\n\nThroughout the engagement, BHC acted as a strategic partner, helping bridge the gap between product innovation and commercial reality.",
    outcome:
      "Miss Swig now operates with a stronger commercial foundation, a refined product offering and a clear pathway to market: successful development of a market-ready beverage product, strong collaboration between founders, food scientists and production partners, clear wholesale and e-commerce growth strategies, commercial pricing structures designed for sustainable profitability, scalable production and batching systems, improved understanding of route-to-market opportunities, stronger sales frameworks and growth planning, increased confidence across key business decisions and ongoing strategic support for future expansion.\n\nToday, Miss Swig is positioned with the systems, strategy and commercial foundations required to support growth, distribution expansion and long-term brand success.",
  },

  // ─────────────────────────────────────────────────────────────────
  // 8 — Brooksy Bar (Amora Hotel, Sydney CBD)
  // ─────────────────────────────────────────────────────────────────
  {
    slug: "brooksy-bar",
    name: "Brooksy Bar",
    client: "Amora Hotel",
    type: "bar",
    coords: [151.207, -33.864],
    suburb: "Sydney",
    year: 2022,
    duration: "12 months",
    services: ["strategy", "beverage", "experience", "operations", "team"],
    website: "https://www.amorahotels.com/sydney/",
    headline:
      "Bringing a luxury hotel lobby bar to life through concept development, beverage strategy, team training and launch execution.",
    summary:
      "Partnered with Amora Hotels to support the creation and launch of Brooksy Bar, developing the beverage program, operational framework, team capability and guest experience strategy for the hotel's flagship lobby destination.",
    pillars: [
      {
        title: "Venue Launch",
        body: "Delivered end-to-end beverage and operational support to assist the successful launch of a premium hotel bar concept.",
      },
      {
        title: "Team Development",
        body: "Created and implemented comprehensive training programs covering beverage knowledge, service standards and luxury guest experiences.",
      },
      {
        title: "Brand & Creative",
        body: "Developed a distinctive beverage concept and guest experience strategy aligned with the hotel's premium positioning and commercial objectives.",
      },
    ],
    challenge:
      "Amora Hotels identified an opportunity to transform its lobby offering into a destination venue that could attract both hotel guests and the local Sydney market.\n\nThe vision was to create a premium bar experience that felt authentic to the property while delivering a level of service, beverage quality and atmosphere expected from a leading hotel destination.\n\nTo achieve this, the venue required a complete beverage strategy, operational framework, team development program and launch plan capable of bringing the concept to life.",
    approach:
      "BHC partnered closely with hotel leadership throughout the development and launch process, providing strategic support from concept through to execution.\n\nThe objective was to ensure every element of the guest experience aligned with the venue's positioning while creating a commercially sustainable operation.\n\nKey initiatives included beverage concept and menu development, signature cocktail creation and menu engineering, bar layout and operational fit-out consultation, workflow and service design recommendations, the development of opening procedures and operational systems, comprehensive team training programs, luxury guest experience and service standards, beverage knowledge and upselling training, launch planning and go-to-market strategy and ongoing operational advisory support.\n\nA significant focus was placed on creating a venue that balanced premium guest experiences with operational efficiency, ensuring the bar could perform successfully within the unique environment of a luxury hotel.",
    outcome:
      "Brooksy Bar launched with a clear identity, structured operational framework and a team equipped to deliver a premium guest experience: successful launch of a flagship hotel beverage destination, development of a unique and commercially focused beverage program, structured training systems supporting long-term team capability, enhanced guest experience standards, operational systems designed for consistency and scalability, strong alignment between hotel brand, guest expectations and beverage offering, improved confidence and capability within the front-of-house team and clear foundations for future growth, activations and ongoing innovation.\n\nToday, Brooksy Bar serves as a key hospitality touchpoint within the Amora Hotel experience, providing guests with a premium beverage offering supported by strong operational systems and service excellence.",
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
