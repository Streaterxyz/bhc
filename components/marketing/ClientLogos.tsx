"use client";

import Image from "next/image";
import { motion } from "framer-motion";

type ClientLogo = {
  name: string;
  src: string;
  /** Visual weight per logo so we can subtly normalise their size. */
  scale?: number;
};

// Real client logos sourced from the BHC capability statement client list.
// All logos are supplied as white-on-transparent PNGs designed for dark backgrounds.
const CLIENTS: ClientLogo[] = [
  { name: "The Grounds of Alexandria", src: "/clients/grounds-of-alexandria.png" },
  { name: "Sonnel Group", src: "/clients/sonnel-group.png" },
  { name: "Sydney Restaurant Group", src: "/clients/sydney-restaurant-group.png" },
  { name: "The Orchard", src: "/clients/the-orchard.png" },
  { name: "Four Pillars Gin", src: "/clients/four-pillars-gin.png" },
  { name: "Employees Only Sydney", src: "/clients/employees-only-sydney.png" },
  { name: "Bianco", src: "/clients/bianco.png" },
  { name: "Ole Lynggaard", src: "/clients/ole-lynggaard.png" },
  { name: "Olsen Palmer", src: "/clients/olsen-palmer.png" },
  { name: "El Patron", src: "/clients/el-patron.png" },
  { name: "Gella Frenda", src: "/clients/gella-frenda.png" },
  { name: "Belance", src: "/clients/belance.png" },
  { name: "Goliath Coffee Roasters", src: "/clients/goliath-coffee.png" },
  // { name: "Ovolo Group", src: "/clients/ovolo-group.png" },
  //   Held out — supplied PNG contains zero visible content (0 non-white pixels).
  //   Restore this line once a non-empty Ovolo Group export is dropped into
  //   public/clients/ovolo-group.png.
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
              className="group bg-bg-base h-24 lg:h-28 flex items-center justify-center px-6 lg:px-8 py-6 transition-colors duration-500 hover:bg-bg-elevated"
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
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
