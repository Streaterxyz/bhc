"use client";

import Image from "next/image";
import { motion } from "framer-motion";

import { CLIENTS } from "@/lib/clients";

// Logo list now lives in lib/clients.ts — shared with the training-landing
// LogoTicker. 18 entries → renders cleanly as 3 rows of 6 on desktop.

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
