"use client";

import { motion } from "framer-motion";

type Archetype = {
  number: string;
  title: string;
  body: string;
};

const ARCHETYPES: Archetype[] = [
  {
    number: "01",
    title: "The New Build or Opening",
    body: "You're launching something new and the margin for error is small. Everything needs to come together at once. You need a partner who has been through it before and knows how to build it right from day one.",
  },
  {
    number: "02",
    title: "The Owner-Operator at Capacity",
    body: "You're running everything yourself. Profitability is inconsistent and every decision lands on your desk. You need a partner who can take weight off, not add to it.",
  },
  {
    number: "03",
    title: "The Growing Group Without Structure",
    body: "You've scaled fast but systems haven't kept up. Standards are inconsistent, leadership is stretched, and the wheels are starting to wobble.",
  },
  {
    number: "04",
    title: "The Enterprise Venue Seeking Transformation",
    body: "Strong infrastructure, experienced team — but strategy isn't translating to the floor. You need someone embedded, accountable, and commercially focused.",
  },
];

export function WhyThisExists() {
  return (
    <section
      aria-labelledby="why-exists-heading"
      className="relative bg-bg-base py-24 lg:py-36 px-6 lg:px-12 border-t border-[color:var(--border-subtle)]"
    >
      {/* Vertical brand label */}
      <div
        aria-hidden
        className="hidden lg:block absolute top-24 left-6 label-vertical text-[0.7rem] tracking-[0.3em] uppercase text-fg-muted"
      >
        02 · Why This Exists
      </div>

      <div className="max-w-[1440px] mx-auto">
        {/* Section header — two-column layout: pull quote left, intro right */}
        <div className="lg:pl-12 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 mb-16 lg:mb-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7"
          >
            <p className="eyebrow mb-5">Why This Exists</p>
            <h2 id="why-exists-heading" className="headline">
              Most hospitality businesses don&apos;t have a knowledge problem.
              <br />
              <span className="text-[color:var(--accent)]">
                They have a capacity problem.
              </span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            className="lg:col-span-5"
          >
            <p className="text-fg-secondary text-lg leading-relaxed">
              You know what needs to change. But between running operations,
              managing people, and keeping revenue moving, there&apos;s no room
              to step back and actually fix it.
            </p>
            <p className="text-fg-secondary text-lg leading-relaxed mt-5">
              BHC exists to close that gap — embedded inside your business as
              a working part of your leadership, bringing the strategic clarity
              and on-the-floor execution most teams only get when they&apos;re
              big enough to afford a full head office.
            </p>
          </motion.div>
        </div>

        {/* Archetype grid — 2x2 on desktop */}
        <div className="lg:pl-12">
          <p className="eyebrow mb-8 text-fg-muted">Sound familiar?</p>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[color:var(--border-subtle)] border border-[color:var(--border-subtle)]">
            {ARCHETYPES.map((a, i) => (
              <motion.li
                key={a.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.7,
                  ease: [0.16, 1, 0.3, 1],
                  delay: 0.08 * i,
                }}
                className="group relative bg-bg-base p-8 lg:p-12 hover:bg-bg-elevated transition-colors duration-500"
              >
                <div className="absolute top-0 left-0 h-px w-0 bg-[color:var(--accent)] group-hover:w-full transition-all duration-700 ease-out" />

                <div className="flex items-baseline gap-4 mb-6">
                  <span className="text-sm font-bold tracking-tight text-[color:var(--accent)]">
                    {a.number}
                  </span>
                  <span className="h-px flex-1 bg-[color:var(--border-default)]" />
                </div>

                <h3 className="text-xl lg:text-2xl font-extrabold leading-tight tracking-tight mb-5">
                  {a.title}
                </h3>

                <p className="text-fg-secondary leading-relaxed">{a.body}</p>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
