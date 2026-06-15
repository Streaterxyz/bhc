"use client";

import Image from "next/image";
import { motion } from "framer-motion";

type ClientLogo = {
  name: string;
  src: string;
  /** Short partnership blurb shown as a hover tooltip on desktop. */
  blurb?: string;
};

// Real client logos sourced from the BHC capability statement + Brendon's
// Nov 2024 partner-brand notes. All logos are supplied as white-on-transparent
// PNGs designed for dark backgrounds. Blurbs only added where Brendon
// supplied copy — case-study clients (The Grounds, Sonnel, Cabravale, SRG)
// render logo-only because their deeper story lives at /projects/<slug>.
//
// 18 entries → renders cleanly as 3 rows of 6 on desktop (lg:grid-cols-6).
const CLIENTS: ClientLogo[] = [
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
  // { name: "Ovolo Group", src: "/clients/ovolo-group.png" },
  //   blurb: "Training and brand support."
  // { name: "Summersalt (SRG)", src: "/clients/summersalt.png" },
  //   blurb: "Beverage program, OS&E, training and opening support."
];

export function ClientLogos() {
  return (
    <section
      aria-labelledby="clients-heading"
      className="relative bg-bg-base py-16 lg:py-20 px-6 lg:px-12 border-t border-[color:var(--border-subtle)]"
    >
      <div className="max-w-[1440px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-12 lg:mb-16"
        >
          <p
            id="clients-heading"
            className="text-[0.7rem] tracking-[0.28em] uppercase text-fg-muted"
          >
            Venues we&apos;ve worked with
          </p>
        </motion.div>

        {/* Logo grid */}
        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-[color:var(--border-subtle)] border border-[color:var(--border-subtle)]">
          {CLIENTS.map((client, i) => (
            <motion.li
              key={client.name}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
                delay: 0.04 * i,
              }}
              className="group relative bg-bg-base h-24 lg:h-28 flex items-center justify-center px-6 lg:px-8 py-6 transition-colors duration-500 hover:bg-bg-elevated"
            >
              <Image
                src={client.src}
                alt={`${client.name} — BHC client`}
                width={200}
                height={80}
                className="max-h-full max-w-full w-auto h-auto object-contain opacity-60 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  filter: "brightness(0) invert(1)",
                }}
              />

              {/* Hover tooltip — only renders when a blurb is supplied.
                  Hidden on mobile (no hover affordance). Always layered above
                  neighbouring cells via z-index so it can spill outside the
                  hairline cell border. */}
              {client.blurb && (
                <div
                  role="tooltip"
                  className="pointer-events-none hidden lg:block absolute left-1/2 -translate-x-1/2 top-full mt-2 z-20 w-[260px] opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300 ease-out"
                >
                  <div className="relative bg-bg-elevated border border-[color:var(--border-default)] rounded-md px-4 py-3 shadow-2xl">
                    {/* Caret pointing back to the logo */}
                    <div
                      aria-hidden
                      className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-bg-elevated border-t border-l border-[color:var(--border-default)]"
                    />
                    <p className="text-[0.65rem] tracking-[0.18em] uppercase text-[color:var(--accent)] font-semibold mb-1.5">
                      {client.name}
                    </p>
                    <p className="text-xs leading-snug text-fg-secondary">
                      {client.blurb}
                    </p>
                  </div>
                </div>
              )}
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
