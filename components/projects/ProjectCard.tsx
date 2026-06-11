"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { type Project, TYPE_LABELS } from "@/lib/projects";

type Props = {
  project: Project;
  aspect?: "tall" | "wide";
  index?: number;
};

/**
 * Image-led project card.
 * - Placeholder gradient until project photography arrives — swap the inner
 *   `bg-gradient...` div for an <Image src={project.hero_image} /> later.
 * - Editorial overlay: type · suburb · year eyebrow, project name (display
 *   weight), one-line headline, then the top metric anchored to the bottom.
 * - Scroll-reveal via Framer Motion whileInView.
 */
export function ProjectCard({ project, aspect = "tall", index = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
        delay: 0.05 * (index % 4),
      }}
    >
      <Link
        href={`/projects/${project.slug}`}
        className="group block relative overflow-hidden rounded-md bg-bg-elevated border border-[color:var(--border-subtle)] hover:border-[color:var(--border-strong)] transition-colors"
        aria-label={`View case study: ${project.name}`}
      >
        <div
          className={`relative overflow-hidden ${
            aspect === "tall" ? "aspect-[4/5]" : "aspect-[5/4]"
          }`}
        >
          {/* Placeholder hero image. Swap to <Image> when project photography is available. */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-[#1c1c1c] via-[#0a0a0a] to-[#222] transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
            style={{
              backgroundImage:
                "radial-gradient(at 30% 25%, rgba(244,194,28,0.08), transparent 55%), radial-gradient(at 75% 80%, rgba(255,255,255,0.04), transparent 60%)",
            }}
            aria-hidden
          />

          {/* Faint grain via mixed gradient — adds texture without an image */}
          <div
            className="absolute inset-0 opacity-[0.18] mix-blend-overlay"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 3px)",
            }}
            aria-hidden
          />

          {/* Bottom darkening for text contrast */}
          <div
            className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black via-black/70 to-transparent"
            aria-hidden
          />

          {/* Top-right arrow indicator */}
          <div className="absolute top-5 right-5 w-9 h-9 rounded-full border border-[color:var(--border-strong)] bg-black/30 backdrop-blur-sm flex items-center justify-center text-fg-secondary opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-1 transition-all duration-300">
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden
            >
              <path
                d="M1 13L13 1M13 1H4M13 1V10"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Overlay content */}
          <div className="absolute inset-0 p-6 lg:p-8 flex flex-col justify-end">
            <div className="flex items-center gap-2 mb-3 text-[0.65rem] tracking-[0.18em] uppercase">
              <span className="text-[color:var(--accent)] font-semibold">
                {TYPE_LABELS[project.type]}
              </span>
              <span className="text-fg-muted">·</span>
              <span className="text-fg-tertiary">{project.suburb}</span>
              <span className="text-fg-muted">·</span>
              <span className="text-fg-tertiary">{project.year}</span>
            </div>

            <h3 className="text-2xl lg:text-3xl font-extrabold leading-[1.05] tracking-tight mb-3 group-hover:text-[color:var(--accent)] transition-colors">
              {project.name}
            </h3>

            <p className="text-sm lg:text-base text-fg-secondary leading-relaxed mb-5 max-w-md">
              {project.headline}
            </p>

            {/* Top stat — numeric metric if present, else lead pillar title.
                Falls back to nothing when neither is supplied. */}
            {project.metrics?.[0] ? (
              <div className="flex items-baseline gap-3 pt-4 border-t border-white/10">
                <span className="text-2xl lg:text-3xl font-extrabold text-[color:var(--accent)] leading-none">
                  {project.metrics[0].value}
                </span>
                <span className="text-[0.65rem] tracking-[0.16em] uppercase text-fg-tertiary">
                  {project.metrics[0].label}
                </span>
              </div>
            ) : project.pillars?.[0] ? (
              <div className="flex items-baseline gap-3 pt-4 border-t border-white/10">
                <span className="text-[0.65rem] tracking-[0.16em] uppercase text-[color:var(--accent)] font-semibold">
                  01
                </span>
                <span className="text-sm lg:text-base font-semibold text-fg-primary leading-snug">
                  {project.pillars[0].title}
                </span>
              </div>
            ) : null}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
