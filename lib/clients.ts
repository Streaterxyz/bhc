/**
 * Shared client/partner logo list — single source of truth for both the
 * home-page logo wall (ClientLogos) and the training-landing logo ticker
 * (LogoTicker).
 *
 * Real client logos sourced from the BHC capability statement + Brendon's
 * Nov 2024 partner-brand notes. All logos are white-on-transparent PNGs
 * designed for dark backgrounds (the components apply brightness(0) invert(1)).
 * Blurbs only exist where Brendon supplied copy — case-study clients
 * (The Grounds, Sonnel, Cabravale, SRG) render logo-only because their
 * deeper story lives at /projects/<slug>.
 */

export type ClientLogo = {
  name: string;
  src: string;
  /** Short partnership blurb shown as a hover tooltip on the home wall. */
  blurb?: string;
};

export const CLIENTS: ClientLogo[] = [
  { name: "The Grounds of Alexandria", src: "/clients/grounds-of-alexandria.png" },
  { name: "Sonnel Group", src: "/clients/sonnel-group.png" },
  { name: "Sydney Restaurant Group", src: "/clients/sydney-restaurant-group.png" },
  { name: "Cabravale Club Resort", src: "/clients/cabravale-club-resort.png" },
  {
    name: "The Orchard",
    src: "/clients/the-orchard.png",
    blurb:
      "Concept and venue development, pre-opening, training and culture-building.",
  },
  { name: "Four Pillars Gin", src: "/clients/four-pillars-gin.png" },
  {
    name: "Employees Only Sydney",
    src: "/clients/employees-only-sydney.png",
    blurb: "Leadership training and venue uplift.",
  },
  {
    name: "Bianco",
    src: "/clients/bianco.png",
    blurb: "Strategy, execution, training, marketing and mentorship.",
  },
  {
    name: "Ole Lynggaard",
    src: "/clients/ole-lynggaard.png",
    blurb: "Preferred beverage partner for luxury brand activations.",
  },
  {
    name: "Bang & Olufsen",
    src: "/clients/bang-and-olufson.png",
    blurb: "Preferred beverage partner for luxury brand events.",
  },
  {
    name: "BMW",
    src: "/clients/bmw.png",
    blurb: "Preferred beverage partner and luxury event specialist.",
  },
  { name: "Olsen Palmer", src: "/clients/olsen-palmer.png" },
  {
    name: "El Patron",
    src: "/clients/el-patron.png",
    blurb:
      "Operational mentorship, leadership development, beverage consultancy and internal audit.",
  },
  {
    name: "Gella Frenda",
    src: "/clients/gella-frenda.png",
    blurb:
      "Pre-opening, OS&E, training, concept development and post-opening support.",
  },
  {
    name: "Drink West",
    src: "/clients/drink-west.png",
    blurb:
      "End-to-end advisory: capital raise, go-to-market, commercial strategy and product development.",
  },
  {
    name: "Cali Burgers",
    src: "/clients/cali-burgers.png",
    blurb: "Creative beverage program development for a QSR brand.",
  },
  {
    name: "The Flower Shop Penrith",
    src: "/clients/the-flower-shop-penrith.png",
    blurb:
      "Full-spectrum partnership across strategy, operations, brand and experience.",
  },
  { name: "Belance", src: "/clients/belance.png" },
  // Held out — supplied PNGs contain zero visible content. Restore once
  // non-empty exports land in public/clients/.
  // { name: "Ovolo Group", src: "/clients/ovolo-group.png", blurb: "Training and brand support." }
  // { name: "Summersalt (SRG)", src: "/clients/summersalt.png", blurb: "Beverage program, OS&E, training and opening support." }
];
