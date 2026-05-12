"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";

// Globe must be client-only — uses WebGL + window globals.
const Globe = dynamic(
  () => import("./Globe").then((m) => m.Globe),
  { ssr: false }
);

export function GlobeHero() {
  const scrollToNext = () => {
    const next = document.getElementById("after-hero");
    if (next) {
      next.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollBy({ top: window.innerHeight, behavior: "smooth" });
    }
  };

  return (
    <section className="relative w-full h-[100dvh] overflow-hidden bg-black">
      <Globe />

      {/* Overlaid hero copy */}
      <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-end p-6 lg:p-12 pb-24 lg:pb-32">
        <div className="max-w-[1440px] mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            className="max-w-3xl"
          >
            <div className="eyebrow mb-5">
              Brendon Hill Consultancy · Hospitality
            </div>
            <h1 className="display text-fg-primary">
              Everything Elevated.
              <br />
              <span className="text-[color:var(--accent)]">No Exceptions.</span>
            </h1>
            <p className="body-lg mt-6 max-w-xl">
              A people-led hospitality consultancy. Real projects across
              Greater Sydney — each one plotted, with the impact to prove it.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Scroll cue */}
      <motion.button
        onClick={scrollToNext}
        aria-label="Scroll to next section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.6 }}
        className="group absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 text-fg-tertiary hover:text-[color:var(--accent)] transition-colors"
      >
        <span className="text-[0.65rem] tracking-[0.2em] uppercase font-medium">
          Scroll
        </span>
        <motion.span
          aria-hidden
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center"
        >
          <svg
            width="14"
            height="22"
            viewBox="0 0 14 22"
            fill="none"
            className="opacity-80 group-hover:opacity-100 transition-opacity"
          >
            <rect
              x="0.5"
              y="0.5"
              width="13"
              height="21"
              rx="6.5"
              stroke="currentColor"
              strokeOpacity="0.6"
            />
            <motion.circle
              cx="7"
              cy="6"
              r="1.4"
              fill="currentColor"
              animate={{ cy: [6, 14, 6], opacity: [1, 0.2, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            />
          </svg>
        </motion.span>
      </motion.button>
    </section>
  );
}
