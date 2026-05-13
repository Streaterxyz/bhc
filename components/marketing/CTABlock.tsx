"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function CTABlock() {
  return (
    <section
      aria-labelledby="cta-heading"
      className="relative bg-black py-32 lg:py-48 px-6 lg:px-12 border-t border-[color:var(--border-subtle)] overflow-hidden"
    >
      {/* Subtle gold radial glow as visual interest */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 80% 50%, rgba(244,194,28,0.08), transparent 55%)",
        }}
      />

      {/* Vertical brand label */}
      <div
        aria-hidden
        className="hidden lg:block absolute top-24 left-6 label-vertical text-[0.7rem] tracking-[0.3em] uppercase text-fg-muted"
      >
        05 · Get In Touch
      </div>

      <div className="relative max-w-[1440px] mx-auto lg:pl-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl"
        >
          <p className="eyebrow mb-6">Let&apos;s Build Something Exceptional</p>

          <h2 id="cta-heading" className="display mb-8">
            Ready to elevate
            <br />
            <span className="text-[color:var(--accent)]">your venue?</span>
          </h2>

          <p className="body-lg max-w-2xl mb-12">
            A free 15-minute call to talk through where the business is, where
            you want it, and whether we&apos;re the right fit to help you get
            there. No prep needed.
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            <Link
              href="/contact"
              className="group inline-flex items-center justify-between gap-6 bg-white text-black font-semibold text-base px-7 py-4 rounded-full hover:bg-[color:var(--accent)] transition-colors"
            >
              <span>Book your free 15-minute call</span>
              <span
                aria-hidden
                className="transition-transform group-hover:translate-x-1"
              >
                →
              </span>
            </Link>

            <a
              href="mailto:brendon@brendonhill.co"
              className="text-sm tracking-[0.16em] uppercase text-fg-secondary hover:text-[color:var(--accent)] transition-colors border-b border-[color:var(--border-default)] hover:border-[color:var(--accent)] pb-1"
            >
              Or email Brendon directly
            </a>
          </div>

          <p className="text-xs text-fg-muted mt-10">
            Typical response time: one business day.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
