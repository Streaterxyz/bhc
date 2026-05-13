"use client";

import { motion } from "framer-motion";

type Service = {
  number: string;
  title: string;
  body: string;
};

const SERVICES: Service[] = [
  {
    number: "01",
    title: "Strategy & Advisory",
    body: "Tailored strategic direction for hospitality operators at every stage — from single-venue positioning to multi-site portfolio planning. We map the path from where the business is today to where it needs to be.",
  },
  {
    number: "02",
    title: "Operational Systems",
    body: "Build the systems that scale. SOPs, rosters, costing, service flow, and the daily operating rhythm that lifts margin without burning out the team.",
  },
  {
    number: "03",
    title: "Financial & Commercial",
    body: "Sharper visibility into the numbers that move the business: P&L health checks, menu engineering, pricing strategy, and the commercial discipline to turn revenue into profit.",
  },
  {
    number: "04",
    title: "Team & Talent",
    body: "Hire the right people, train them properly, keep them. End-to-end support for recruitment, onboarding, performance, and the culture that holds it all together.",
  },
  {
    number: "05",
    title: "Brand & Growth",
    body: "Positioning, partnerships, and the marketing infrastructure that builds a recognisable hospitality brand — from neighbourhood favourite to multi-site name.",
  },
  {
    number: "06",
    title: "Experience Design",
    body: "The end-to-end guest experience, designed deliberately. Service touchpoints, atmosphere, beverage and food programs that turn first-time visits into long-term loyalty.",
  },
];

export function Services() {
  return (
    <section
      aria-labelledby="services-heading"
      className="relative bg-bg-base py-24 lg:py-36 px-6 lg:px-12 border-t border-[color:var(--border-subtle)]"
    >
      {/* Vertical brand label */}
      <div
        aria-hidden
        className="hidden lg:block absolute top-24 left-6 label-vertical text-[0.7rem] tracking-[0.3em] uppercase text-fg-muted"
      >
        03 · Services
      </div>

      <div className="max-w-[1440px] mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16 lg:mb-24 max-w-4xl lg:pl-12 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8"
        >
          <div>
            <p className="eyebrow mb-5">What We Do</p>
            <h2 id="services-heading" className="headline">
              Six disciplines.
              <br />
              <span className="text-[color:var(--accent)]">One outcome.</span>
            </h2>
          </div>
          <p className="body-lg max-w-md">
            Each engagement combines whichever disciplines are needed to lift
            the venue — strategy, operations, finance, people, brand, and
            experience.
          </p>
        </motion.div>

        {/* Service rows */}
        <ol className="lg:pl-12 border-t border-[color:var(--border-subtle)]">
          {SERVICES.map((service, i) => (
            <motion.li
              key={service.number}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.7,
                ease: [0.16, 1, 0.3, 1],
                delay: 0.05 * i,
              }}
              className="group relative border-b border-[color:var(--border-subtle)] hover:bg-bg-elevated transition-colors duration-500"
            >
              {/* Gold accent line at the left edge that grows on hover */}
              <div className="absolute top-0 bottom-0 left-0 w-0 bg-[color:var(--accent)] group-hover:w-[2px] transition-all duration-500" />

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-12 py-8 lg:py-10 px-4 lg:px-6">
                {/* Number */}
                <div className="md:col-span-1">
                  <span className="text-sm font-bold tracking-tight text-[color:var(--accent)]">
                    {service.number}
                  </span>
                </div>

                {/* Title */}
                <div className="md:col-span-4">
                  <h3 className="text-2xl lg:text-3xl font-extrabold leading-[1.05] tracking-tight">
                    {service.title}
                  </h3>
                </div>

                {/* Body */}
                <div className="md:col-span-6 md:col-start-7">
                  <p className="text-fg-secondary leading-relaxed text-base lg:text-lg">
                    {service.body}
                  </p>
                </div>

                {/* Arrow */}
                <div className="md:col-span-1 flex md:justify-end items-center">
                  <span
                    aria-hidden
                    className="text-fg-muted group-hover:text-[color:var(--accent)] group-hover:translate-x-1 transition-all duration-300"
                  >
                    →
                  </span>
                </div>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
