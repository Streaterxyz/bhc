"use client";

import { motion } from "framer-motion";

// Real client names sourced from the BHC Capability Statement.
// Rendered as typeset wordmarks until SVG logo assets are provided —
// keeps the section production-ready without bitmap placeholders.
const CLIENTS = [
  { name: "The Orchard", style: "serif italic" },
  { name: "The Grounds of Alexandria", style: "serif" },
  { name: "Sydney Restaurant Group", style: "sans" },
  { name: "Sonnel", style: "sans uppercase tracking-[0.16em]" },
  { name: "Volo Group", style: "sans uppercase tracking-[0.18em]" },
  { name: "Cabravale Club Resort", style: "serif" },
  { name: "Ole Lynggaard", style: "serif italic" },
  { name: "GellaFrenda", style: "sans" },
  { name: "Four Pillars", style: "serif uppercase tracking-[0.12em]" },
  { name: "Employees Only Sydney", style: "sans uppercase tracking-[0.14em]" },
  { name: "El Patron", style: "sans uppercase tracking-[0.18em]" },
  { name: "Bianco", style: "serif italic" },
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

        {/* Logo grid — typeset wordmarks until SVG assets arrive */}
        <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-px bg-[color:var(--border-subtle)] border border-[color:var(--border-subtle)]">
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
              className="group bg-bg-base h-24 lg:h-28 flex items-center justify-center px-4 hover:bg-bg-elevated transition-colors duration-500"
            >
              <span
                className={`text-fg-tertiary group-hover:text-fg-primary transition-colors duration-500 text-center text-sm lg:text-base font-medium leading-tight ${
                  client.style.includes("serif") ? "font-serif" : ""
                } ${
                  client.style.includes("italic") ? "italic" : ""
                } ${
                  client.style.includes("uppercase") ? "uppercase" : ""
                } ${client.style.match(/tracking-\[[^\]]+\]/)?.[0] ?? ""}`}
              >
                {client.name}
              </span>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
