/**
 * JSON-LD structured data builders — the entity graph search engines and
 * AI assistants use to connect "Brendon Hill" → BHC → hospitality
 * consulting → Sydney → the published results.
 *
 * Sitewide graph (Organization + Person + ProfessionalService) renders in
 * the root layout; per-page schema (Article on case studies, AboutPage on
 * /about) renders on its page. Every URL/claim here must be real and
 * verifiable — schema is a trust surface, not a wish list.
 */

const SITE = "https://brendonhill.co";

export const BRENDON_SAME_AS = [
  "https://www.linkedin.com/in/brendon-james-hill-55578366/",
  "https://www.instagram.com/brendonhillconsulting/",
];

/** Stable @ids so the graph nodes can reference each other across pages. */
export const IDS = {
  org: `${SITE}/#organization`,
  person: `${SITE}/#brendon-hill`,
  service: `${SITE}/#service`,
};

export function organizationSchema() {
  return {
    "@type": "Organization",
    "@id": IDS.org,
    name: "Brendon Hill Consultancy",
    alternateName: "BHC",
    url: SITE,
    logo: `${SITE}/icon.svg`,
    slogan: "Everything Elevated. No Exceptions.",
    description:
      "A people-led hospitality consultancy in Sydney, Australia, helping venues lift profit through strategy, operations, beverage programs and team development. Systems used across 100+ venues.",
    email: "brendon@brendonhill.co",
    founder: { "@id": IDS.person },
    sameAs: BRENDON_SAME_AS,
    areaServed: {
      "@type": "AdministrativeArea",
      name: "Greater Sydney, New South Wales, Australia",
    },
  };
}

export function personSchema() {
  return {
    "@type": "Person",
    "@id": IDS.person,
    name: "Brendon Hill",
    jobTitle: "Hospitality Consultant & Managing Director",
    worksFor: { "@id": IDS.org },
    url: `${SITE}/about`,
    image: `${SITE}/headshots/Brendon.png`,
    description:
      "Sydney hospitality consultant. Founder of Brendon Hill Consultancy — strategy, operations and beverage systems used across 100+ venues, including a documented $393,600 annual profit turnaround.",
    knowsAbout: [
      "Hospitality consulting",
      "Venue profitability",
      "Beverage strategy",
      "Restaurant operations",
      "Menu engineering",
      "Hospitality team training",
    ],
    sameAs: BRENDON_SAME_AS,
  };
}

export function serviceSchema() {
  return {
    "@type": "ProfessionalService",
    "@id": IDS.service,
    name: "Brendon Hill Consultancy — Hospitality Consulting",
    url: SITE,
    parentOrganization: { "@id": IDS.org },
    description:
      "Hospitality consulting for restaurants, bars, pubs, clubs and venue groups: profitability audits, beverage strategy, menu engineering, operational systems and team development.",
    areaServed: {
      "@type": "AdministrativeArea",
      name: "Greater Sydney, New South Wales, Australia",
    },
    priceRange: "$$$",
  };
}

/** The sitewide graph rendered once in the root layout. */
export function siteGraph() {
  return {
    "@context": "https://schema.org",
    "@graph": [organizationSchema(), personSchema(), serviceSchema()],
  };
}

/** Case-study Article schema for /projects/[slug]. */
export function projectArticleSchema(p: {
  slug: string;
  name: string;
  headline: string;
  summary: string;
  year: number;
  suburb: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${p.name} — ${p.headline}`,
    description: p.summary,
    url: `${SITE}/projects/${p.slug}`,
    image: `${SITE}/projects/${p.slug}/hero.webp`,
    author: { "@id": IDS.person },
    publisher: { "@id": IDS.org },
    datePublished: `${p.year}-01-01`,
    about: {
      "@type": "Thing",
      name: `Hospitality consulting case study — ${p.suburb}, Australia`,
    },
  };
}
