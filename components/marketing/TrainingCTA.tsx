"use client";

/**
 * Top-of-funnel banner driving to the free /training lead magnet.
 *
 * Deliberately distinct from the bottom-of-funnel CTABlock ("Book a
 * call"): this is the low-commitment, email-gated entry point into the
 * Phase 2 funnel. Gold-tinted band so it reads as a different "offer"
 * beat than the surrounding editorial sections.
 */

import Link from "next/link";
import { motion } from "framer-motion";

export function TrainingCTA() {
  return (
    <section
      aria-labelledby="training-cta-heading"
      className="relative bg-bg-elevated border-t border-b border-[color:var(--border-subtle)] overflow-hidden"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 50%, rgba(244,194,28,0.10), transparent 50%)",
        }}
      />

      <div className="relative max-w-[1440px] mx-auto px-6 lg:px-12 py-16 lg:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="grid lg:grid-cols-[1fr_auto] gap-8 lg:gap-12 items-center"
        >
          <div>
            <p className="eyebrow mb-4">Free Training</p>
            <h2
              id="training-cta-heading"
              className="text-3xl lg:text-5xl font-extrabold tracking-tight leading-[1.05] mb-4"
            >
              Your venue isn&apos;t broken. It&apos;s leaking.
            </h2>
            <p className="body-lg max-w-2xl">
              The hidden profit leaks quietly draining your margins — and the
              four tools that plug them. See how one venue went from −10% to a{" "}
              <span className="text-fg-primary font-semibold">
                $393,600 turnaround
              </span>
              .
            </p>
          </div>

          <div className="lg:text-right">
            <Link
              href="/training"
              className="group inline-flex items-center justify-center gap-3 bg-white text-black font-semibold text-base px-7 py-4 rounded-full hover:bg-[color:var(--accent)] transition-colors"
            >
              <span>Watch the free training</span>
              <span
                aria-hidden
                className="transition-transform group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
            <p className="mt-3 text-xs text-fg-muted">
              30 minutes · Email to unlock
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
