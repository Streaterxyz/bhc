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
    title: "VIP Mindset",
    body: "Everyone gets the VIP treatment — not because they ask, but because it's how we work. We focus on the moments that matter, creating experiences people remember and come back for. Excellence isn't occasional. It's consistent.",
  },
  {
    number: "02",
    title: "Details Are The Difference",
    body: "The smallest details create the biggest impact. We know where to look, what to fix, and how to move fast. When something can be better, we make it better — smoothly, intentionally, and with purpose.",
  },
  {
    number: "03",
    title: "Personal, Always",
    body: "We don't do templates. We get close to the business, understand the vision, and treat every goal like it's our own. It takes time, energy, and care — and that's exactly what we bring.",
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
        02 · Why BHC
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
            Everything Elevated.
            <br />
            <span className="text-[color:var(--accent)]">No Exceptions.</span>
          </h2>
          <p className="body-lg mt-6 max-w-2xl">
            Three principles shape every engagement — from a single venue
            tune-up to multi-site group strategy.
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
