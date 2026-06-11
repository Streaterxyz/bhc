"use client";

import Image from "next/image";
import { motion } from "framer-motion";

type ClientLogo = {
  name: string;
  src: string;
  /** Short partnership blurb shown as a hover tooltip on desktop. */
  blurb?: string;
};

// Real client logos sourced from the BHC capability statement client list.
// All logos are supplied as white-on-transparent PNGs designed for dark
// backgrounds. Blurbs sourced from Brendon's Nov 2024 partner-brand notes —
// only added to brands where Brendon explicitly supplied copy. The rest
// (Sydney Restaurant Group, Four Pillars Gin, Olsen Palmer, Belance, Goliath,
// and case-study clients like The Grounds / Sonnel / Cabravale that already
// have full project pages) render as logo-only.
const CLIENTS: ClientLogo[] = [
  { name: "The Grounds of Alexandria", src: "/clients/grounds-of-alexandria.png" },
  { name: "Sonnel Group", src: "/clients/sonnel-group.png" },
  { name: "Sydney Restaurant Group", src: "/clients/sydney-restaurant-group.png" },
  {
    name: "The Orchard",
    src: "/clients/the-orchard.png",
    blurb:
      "Concept, development, Greenfield, pre-opening, training, people and culture.",
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
    blurb: "Preferred beverage supplier for luxury events.",
  },
  { name: "Olsen Palmer", src: "/clients/olsen-palmer.png" },
  {
    name: "El Patron",
    src: "/clients/el-patron.png",
    blurb:
      "Operational mentorship and leadership, beverage consultancy and internal audit partner.",
  },
  {
    name: "Gella Frenda",
    src: "/clients/gella-frenda.png",
    blurb:
      "Pre-opening, OS&E, training, concept development and post-opening support.",
  },
  { name: "Belance", src: "/clients/belance.png" },
  { name: "Goliath Coffee Roasters", src: "/clients/goliath-coffee.png" },
  { name: "Cabravale Club Resort", src: "/clients/cabravale-club-resort.png" },
  // { name: "Ovolo Group", src: "/clients/ovolo-group.png" },
  //   Held out — supplied PNG contains zero visible content (0 non-white pixels).
  //   Restore this line once a non-empty Ovolo Group export is dropped into
  //   public/clients/ovolo-group.png. Brendon's blurb on file:
  //   "Training and brand support."
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
        <ul className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-px bg-[color:var(--border-subtle)] border border-[color:var(--border-subtle)]">
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
