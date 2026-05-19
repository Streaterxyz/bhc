"use client";

import { motion } from "framer-motion";

type Member = {
  initials: string;
  name: string;
  role: string;
};

const TEAM: Member[] = [
  {
    initials: "BH",
    name: "Brendon Hill",
    role: "Managing Director",
  },
  {
    initials: "MF",
    name: "Mansour Flaihan",
    role: "Hospitality Projects & Operations",
  },
  {
    initials: "BZ",
    name: "Bayley Zeiher",
    role: "Head of Training & Strategy Development",
  },
  {
    initials: "DV",
    name: "Daniel Vardareff",
    role: "Commercial Analyst & Data Solutions",
  },
];

export function TheTeam() {
  return (
    <section
      aria-labelledby="team-heading"
      className="relative bg-bg-base py-24 lg:py-36 px-6 lg:px-12 border-t border-[color:var(--border-subtle)]"
    >
      {/* Vertical brand label */}
      <div
        aria-hidden
        className="hidden lg:block absolute top-24 left-6 label-vertical text-[0.7rem] tracking-[0.3em] uppercase text-fg-muted"
      >
        08 · The Team
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
          <p className="eyebrow mb-5">The Team</p>
          <h2 id="team-heading" className="headline">
            The people that{" "}
            <span className="text-[color:var(--accent)]">make it happen.</span>
          </h2>
          <p className="body-lg mt-6 max-w-2xl">
            A dedicated team of hospitality operators, strategists, and analysts
            — embedded inside your business when it counts.
          </p>
        </motion.div>

        {/* Team grid */}
        <div className="lg:pl-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[color:var(--border-subtle)] border border-[color:var(--border-subtle)]">
          {TEAM.map((member, i) => (
            <motion.article
              key={member.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.7,
                ease: [0.16, 1, 0.3, 1],
                delay: 0.08 * i,
              }}
              className="group relative bg-bg-base hover:bg-bg-elevated transition-colors duration-500"
            >
              <div className="absolute top-0 left-0 h-px w-0 bg-[color:var(--accent)] group-hover:w-full transition-all duration-700 ease-out z-10" />

              {/* Portrait placeholder — square with monogram. Swap to <Image> when headshots arrive. */}
              <div
                className="relative aspect-square overflow-hidden"
                style={{
                  backgroundImage:
                    "radial-gradient(at 30% 30%, rgba(244,194,28,0.10), transparent 55%), linear-gradient(140deg, #1a1a1a 0%, #050505 70%)",
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <span
                    aria-hidden
                    className="text-6xl lg:text-7xl font-extrabold tracking-tight text-fg-muted/30 select-none transition-colors duration-500 group-hover:text-[color:var(--accent)]/40"
                  >
                    {member.initials}
                  </span>
                </div>
                {/* Subtle noise overlay for texture */}
                <div
                  aria-hidden
                  className="absolute inset-0 opacity-[0.06] mix-blend-overlay"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(0deg, rgba(255,255,255,0.4) 0 1px, transparent 1px 3px)",
                  }}
                />
                {/* Bottom fade for caption legibility */}
                <div
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-bg-base to-transparent"
                />
              </div>

              {/* Caption */}
              <div className="p-6 lg:p-7">
                <h3 className="text-lg lg:text-xl font-extrabold tracking-tight mb-2">
                  {member.name}
                </h3>
                <p className="text-fg-tertiary text-xs tracking-[0.14em] uppercase leading-relaxed">
                  {member.role}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
