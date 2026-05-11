"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";

// Globe must be client-only — uses WebGL + window globals.
const Globe = dynamic(
  () => import("./Globe").then((m) => m.Globe),
  { ssr: false }
);

export function GlobeHero() {
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
    </section>
  );
}
