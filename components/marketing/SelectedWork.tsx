"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { getFeaturedProjects, projects, type Project } from "@/lib/projects";

/**
 * Selected Work — staggered two-column grid of featured projects.
 * Right column is offset down on md+ to create the editorial stagger.
 */
export function SelectedWork() {
  const featured = getFeaturedProjects();
  const remaining = projects.filter(
    (p) => !featured.some((f) => f.slug === p.slug)
  );
  const showcase: Project[] = [...featured, ...remaining].slice(0, 6);

  const leftCol = showcase.filter((_, i) => i % 2 === 0);
  const rightCol = showcase.filter((_, i) => i % 2 === 1);

  return (
    <section
      aria-labelledby="selected-work-heading"
      className="bg-bg-base py-24 lg:py-32 px-6 lg:px-12 scroll-mt-16 border-t border-[color:var(--border-subtle)]"
    >
      <div className="max-w-[1440px] mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16 lg:mb-24 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8"
        >
          <div className="max-w-3xl">
            <p className="eyebrow mb-5">Selected Work</p>
            <h2 id="selected-work-heading" className="headline">
              Real venues.{" "}
              <span className="text-[color:var(--accent)]">Real impact.</span>
            </h2>
            <p className="body-lg mt-6 max-w-xl">
              A snapshot of recent engagements across Greater Sydney —
              hospitality groups, restaurants, bars, and hotels we&apos;ve
              partnered with to lift performance and elevate the guest
              experience.
            </p>
          </div>

          <Link
            href="#hero-globe"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="hidden lg:inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-fg-secondary hover:text-[color:var(--accent)] transition-colors"
          >
            <span className="border-b border-current pb-0.5">
              See all on the globe
            </span>
            <span aria-hidden>↑</span>
          </Link>
        </motion.div>

        {/* Staggered two-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
          <div className="space-y-6 lg:space-y-10">
            {leftCol.map((p, i) => (
              <ProjectCard
                key={p.slug}
                project={p}
                aspect={i % 2 === 0 ? "tall" : "wide"}
                index={i * 2}
              />
            ))}
          </div>
          <div className="space-y-6 lg:space-y-10 md:mt-16 lg:mt-24">
            {rightCol.map((p, i) => (
              <ProjectCard
                key={p.slug}
                project={p}
                aspect={i % 2 === 0 ? "wide" : "tall"}
                index={i * 2 + 1}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
