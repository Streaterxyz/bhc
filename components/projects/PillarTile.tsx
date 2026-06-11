"use client";

import { motion } from "framer-motion";

type Props = {
  title: string;
  body: string;
  index?: number;
};

/**
 * Narrative outcome tile — used where a project's "result" is described as
 * an outcome area (e.g. "Commercial Performance") rather than a single
 * standout numeric stat. Pairs with MetricTile for projects that use
 * numeric metrics; both render inside the same hairline mat grid.
 */
export function PillarTile({ title, body, index = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.7,
        ease: [0.16, 1, 0.3, 1],
        delay: 0.08 * index,
      }}
      className="group relative p-6 lg:p-8 bg-bg-base hover:bg-bg-elevated transition-colors duration-500"
    >
      {/* Top gold accent that draws in on hover */}
      <div className="absolute top-0 left-0 h-px w-0 bg-[color:var(--accent)] group-hover:w-full transition-all duration-700 ease-out" />

      <div className="text-xs tracking-[0.18em] uppercase text-[color:var(--accent)] mb-4 font-semibold">
        {String(index + 1).padStart(2, "0")}
      </div>
      <h4 className="text-xl lg:text-2xl font-extrabold tracking-tight text-fg-primary leading-tight mb-4">
        {title}
      </h4>
      <p className="text-sm lg:text-base text-fg-secondary leading-relaxed">
        {body}
      </p>
    </motion.div>
  );
}
