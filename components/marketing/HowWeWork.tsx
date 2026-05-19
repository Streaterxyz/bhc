"use client";

import { motion } from "framer-motion";

type Step = {
  number: string;
  title: string;
  body: string;
};

type Phase = {
  number: string;
  title: string;
  body: string;
};

const STEPS: Step[] = [
  {
    number: "01",
    title: "Diagnose",
    body: "Understand the business, identify the gaps, define the opportunity.",
  },
  {
    number: "02",
    title: "Design",
    body: "Build the systems, standards, and strategies the business needs.",
  },
  {
    number: "03",
    title: "Embed",
    body: "Get into the business and start shifting behaviour at every level.",
  },
  {
    number: "04",
    title: "Execute",
    body: "Drive implementation on the floor, in the team, and across operations.",
  },
  {
    number: "05",
    title: "Develop",
    body: "Build internal capability so improvements hold without us in the room.",
  },
  {
    number: "06",
    title: "Sustain",
    body: "Stay close as a strategic partner — protecting standards, unlocking growth.",
  },
];

const PHASES: Phase[] = [
  {
    number: "I",
    title: "Intensive Phase",
    body: "Deep embedding. We're in the business regularly, identifying gaps, building systems, and driving change at pace.",
  },
  {
    number: "II",
    title: "Developmental Phase",
    body: "Standards are established. We shift focus to embedding capability into your team so improvements hold without us in the room.",
  },
  {
    number: "III",
    title: "Ongoing Partnership",
    body: "The business is running well. We stay close as a strategic partner — available when you need us, proactive when we see opportunity.",
  },
];

export function HowWeWork() {
  return (
    <section
      aria-labelledby="how-we-work-heading"
      className="relative bg-bg-elevated py-24 lg:py-36 px-6 lg:px-12 border-t border-[color:var(--border-subtle)]"
    >
      {/* Vertical brand label */}
      <div
        aria-hidden
        className="hidden lg:block absolute top-24 left-6 label-vertical text-[0.7rem] tracking-[0.3em] uppercase text-fg-muted"
      >
        04 · How We Work
      </div>

      <div className="max-w-[1440px] mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16 lg:mb-20 max-w-4xl lg:pl-12"
        >
          <p className="eyebrow mb-5">How We Work</p>
          <h2 id="how-we-work-heading" className="headline">
            Embedded.
            <br />
            Phased.{" "}
            <span className="text-[color:var(--accent)]">Built to last.</span>
          </h2>
          <p className="body-lg mt-6 max-w-2xl">
            We don&apos;t consult from a distance. BHC embeds inside your
            business — working directly alongside your team to diagnose
            problems, build solutions, and see them through to execution.
          </p>
        </motion.div>

        {/* 6-step process — horizontal flow on desktop, stacked on mobile */}
        <div className="lg:pl-12 mb-20 lg:mb-28">
          <p className="eyebrow mb-8 text-fg-muted">
            The progression
          </p>
          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-px bg-[color:var(--border-subtle)] border border-[color:var(--border-subtle)]">
            {STEPS.map((step, i) => (
              <motion.li
                key={step.number}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  duration: 0.6,
                  ease: [0.16, 1, 0.3, 1],
                  delay: 0.06 * i,
                }}
                className="group relative bg-bg-base p-6 lg:p-7 hover:bg-bg-elevated transition-colors duration-500"
              >
                <div className="absolute top-0 left-0 h-px w-0 bg-[color:var(--accent)] group-hover:w-full transition-all duration-700 ease-out" />

                <span className="block text-xs font-bold tracking-[0.16em] text-[color:var(--accent)] mb-4">
                  {step.number}
                </span>
                <h3 className="text-lg font-extrabold tracking-tight mb-3">
                  {step.title}
                </h3>
                <p className="text-fg-tertiary text-sm leading-relaxed">
                  {step.body}
                </p>
              </motion.li>
            ))}
          </ol>
        </div>

        {/* 3 phases — supplementary cards */}
        <div className="lg:pl-12">
          <p className="eyebrow mb-8 text-fg-muted">Engagement phases</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[color:var(--border-subtle)] border border-[color:var(--border-subtle)]">
            {PHASES.map((phase, i) => (
              <motion.article
                key={phase.number}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.7,
                  ease: [0.16, 1, 0.3, 1],
                  delay: 0.1 * i,
                }}
                className="group relative bg-bg-base p-8 lg:p-10 hover:bg-bg-elevated transition-colors duration-500"
              >
                <div className="absolute top-0 left-0 h-px w-0 bg-[color:var(--accent)] group-hover:w-full transition-all duration-700 ease-out" />

                <div className="text-3xl font-extrabold text-[color:var(--accent)] mb-4 tracking-tight">
                  {phase.number}
                </div>
                <h3 className="text-xl lg:text-2xl font-extrabold leading-tight tracking-tight mb-4">
                  {phase.title}
                </h3>
                <p className="text-fg-secondary leading-relaxed">
                  {phase.body}
                </p>
              </motion.article>
            ))}
          </div>

          {/* Closing line — pulled directly from the capability statement */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            className="mt-16 lg:mt-20 text-2xl lg:text-3xl font-light leading-[1.4] max-w-3xl text-fg-primary"
          >
            The goal is not dependency. It&apos;s a business that runs better
            with us — and{" "}
            <span className="text-[color:var(--accent)] font-normal">
              continues to run well without us.
            </span>
          </motion.p>
        </div>
      </div>
    </section>
  );
}
