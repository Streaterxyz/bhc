"use client";

import { motion } from "framer-motion";

type Pillar = {
  number: string;
  title: string;
  body: string;
};

const PILLARS: Pillar[] = [
  {
    number: "01",
    title: "Real-World Experience",
    body: "We've worked across every level of hospitality — from the floor to the boardroom. We don't diagnose problems from a spreadsheet. We've stood where your team stands and we know what it takes to fix things that actually need fixing.",
  },
  {
    number: "02",
    title: "Diagnosis Over Opinion",
    body: "Any consultant can identify obvious problems. BHC goes further — we understand why the problem exists, what it's costing you, and how to fix the root cause. We bring a framework, not just an observation.",
  },
  {
    number: "03",
    title: "Accountability That Shows Up",
    body: "We're a dedicated consultancy, not a side project. We show up when it counts, document our work, report on progress, and take responsibility for outcomes. When the stakes are high, you need a partner who doesn't disappear.",
  },
];

export function WhyBHC() {
  return (
    <section
      id="after-hero"
      aria-labelledby="why-bhc-heading"
      className="relative bg-bg-base py-24 lg:py-36 px-6 lg:px-12 scroll-mt-16 border-t border-[color:var(--border-subtle)]"
    >
      {/* Vertical brand label — editorial detail from the brand book */}
      <div
        aria-hidden
        className="hidden lg:block absolute top-24 left-6 label-vertical text-[0.7rem] tracking-[0.3em] uppercase text-fg-muted"
      >
        06 · Why BHC
      </div>

      <div className="max-w-[1440px] mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16 lg:mb-24 max-w-4xl lg:pl-12"
        >
          <p className="eyebrow mb-5">Why BHC</p>
          <h2 id="why-bhc-heading" className="headline">
            Real-world experience.
            <br />
            Commercial rigour.{" "}
            <span className="text-[color:var(--accent)]">
              Genuine accountability.
            </span>
          </h2>
          <p className="body-lg mt-6 max-w-2xl">
            Three principles that separate BHC from advice-only consultants —
            from a single venue tune-up to multi-site group strategy.
          </p>
        </motion.div>

        {/* Three pillars */}
        <ol className="lg:pl-12 grid grid-cols-1 md:grid-cols-3 gap-px bg-[color:var(--border-subtle)] border border-[color:var(--border-subtle)]">
          {PILLARS.map((pillar, i) => (
            <motion.li
              key={pillar.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: 0.7,
                ease: [0.16, 1, 0.3, 1],
                delay: 0.12 * i,
              }}
              className="group relative bg-bg-base p-8 lg:p-12 hover:bg-bg-elevated transition-colors duration-500"
            >
              {/* Top accent line that draws in on hover */}
              <div className="absolute top-0 left-0 h-px w-0 bg-[color:var(--accent)] group-hover:w-full transition-all duration-700 ease-out" />

              <div className="flex items-baseline gap-4 mb-8">
                <span className="text-xl font-bold tracking-tight text-[color:var(--accent)]">
                  {pillar.number}
                </span>
                <span className="h-px flex-1 bg-[color:var(--border-default)]" />
              </div>

              <h3 className="text-2xl lg:text-3xl font-extrabold leading-tight tracking-tight mb-6">
                {pillar.title}
              </h3>

              <p className="text-fg-secondary leading-relaxed text-base">
                {pillar.body}
              </p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
