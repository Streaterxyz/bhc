"use client";

import { motion } from "framer-motion";

type Props = {
  label: string;
  value: string;
  index?: number;
};

export function MetricTile({ label, value, index = 0 }: Props) {
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

      <div className="text-3xl lg:text-5xl font-extrabold text-[color:var(--accent)] leading-none mb-4 tracking-tight">
        {value}
      </div>
      <div className="text-[0.65rem] tracking-[0.18em] uppercase text-fg-tertiary">
        {label}
      </div>
    </motion.div>
  );
}
