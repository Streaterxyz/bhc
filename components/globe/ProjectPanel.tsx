"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import {
  type Project,
  SERVICE_LABELS,
  TYPE_LABELS,
} from "@/lib/projects";

type Props = {
  project: Project | null;
  onClose: () => void;
};

export function ProjectPanel({ project, onClose }: Props) {
  return (
    <AnimatePresence>
      {project && (
        <motion.aside
          key={project.slug}
          role="dialog"
          aria-label={`Project highlights: ${project.name}`}
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed top-0 right-0 bottom-0 z-[60] w-full sm:w-[440px] lg:w-[480px] bg-[color:var(--bg-elevated)]/95 backdrop-blur-xl border-l border-[color:var(--border-subtle)] overflow-y-auto"
        >
          <div className="p-8 lg:p-10 pt-24">
            <button
              onClick={onClose}
              aria-label="Close project panel"
              className="absolute top-5 right-5 z-[61] w-10 h-10 flex items-center justify-center rounded-full border border-[color:var(--border-default)] text-fg-tertiary hover:text-fg-primary hover:border-[color:var(--border-strong)] bg-black/40 backdrop-blur-sm transition-colors"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden
              >
                <path
                  d="M1 1L13 13M13 1L1 13"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
            </button>

            <div className="flex items-center gap-3 mb-6">
              <span className="text-xs tracking-widest uppercase text-[color:var(--accent)]">
                {TYPE_LABELS[project.type]}
              </span>
              <span className="text-xs text-fg-muted">·</span>
              <span className="text-xs tracking-widest uppercase text-fg-tertiary">
                {project.suburb}
              </span>
              <span className="text-xs text-fg-muted">·</span>
              <span className="text-xs tracking-widest uppercase text-fg-tertiary">
                {project.year}
              </span>
            </div>

            <h2 className="text-3xl lg:text-4xl font-extrabold leading-[1.05] tracking-tight mb-4">
              {project.name}
            </h2>

            <p className="text-fg-secondary text-base leading-relaxed mb-8">
              {project.summary}
            </p>

            {/* Headline outcome */}
            <div className="border-l-2 border-[color:var(--accent)] pl-4 mb-8">
              <p className="text-xs tracking-widest uppercase text-fg-tertiary mb-1">
                The result
              </p>
              <p className="text-lg font-semibold text-fg-primary leading-snug">
                {project.headline}
              </p>
            </div>

            {/* Result tiles — numeric metrics if present, otherwise pillar
                titles. Both formats render in the same compact 3-up grid. */}
            {project.metrics?.length ? (
              <div className="grid grid-cols-3 gap-3 mb-8">
                {project.metrics.map((m) => (
                  <div
                    key={m.label}
                    className="border border-[color:var(--border-subtle)] rounded-lg p-3 bg-black/40"
                  >
                    <div className="text-xl font-extrabold text-[color:var(--accent)] leading-none mb-2">
                      {m.value}
                    </div>
                    <div className="text-[0.65rem] tracking-wider uppercase text-fg-tertiary leading-tight">
                      {m.label}
                    </div>
                  </div>
                ))}
              </div>
            ) : project.pillars?.length ? (
              <div className="grid grid-cols-3 gap-3 mb-8">
                {project.pillars.map((p, i) => (
                  <div
                    key={p.title}
                    className="border border-[color:var(--border-subtle)] rounded-lg p-3 bg-black/40"
                  >
                    <div className="text-[0.6rem] tracking-[0.18em] uppercase text-[color:var(--accent)] font-semibold mb-2">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div className="text-xs font-semibold text-fg-primary leading-snug">
                      {p.title}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {/* Services */}
            <div className="mb-10">
              <p className="text-xs tracking-widest uppercase text-fg-tertiary mb-3">
                Services
              </p>
              <div className="flex flex-wrap gap-2">
                {project.services.map((s) => (
                  <span
                    key={s}
                    className="text-xs px-3 py-1.5 rounded-full border border-[color:var(--border-default)] text-fg-secondary"
                  >
                    {SERVICE_LABELS[s]}
                  </span>
                ))}
              </div>
            </div>

            <Link
              href={`/projects/${project.slug}`}
              className="group flex items-center justify-between w-full px-5 py-4 bg-white text-black font-semibold text-sm rounded-full hover:bg-[color:var(--accent)] transition-colors"
            >
              <span>View full case study</span>
              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>

            <div className="mt-6 text-xs text-fg-muted">
              {project.duration} engagement · {project.client}
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
