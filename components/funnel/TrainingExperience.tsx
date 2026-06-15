"use client";

/**
 * The authenticated /training view — shown once a valid lead session
 * cookie is present. Contains:
 *   1. A welcome line
 *   2. The training video (placeholder until Cloudflare Stream is wired
 *      in Phase 2B — the 16:9 frame + play affordance is final, only the
 *      <iframe> source is pending)
 *   3. The $89 upsell card (placeholder checkout button until Stripe is
 *      wired in Phase 2B)
 *
 * Visual + layout are production-final so Phase 2B is a pure plumbing
 * swap, not a redesign.
 */

import { motion } from "framer-motion";

type Props = {
  firstName?: string | null;
};

export function TrainingExperience({ firstName }: Props) {
  return (
    <div className="w-full max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="eyebrow mb-4">Your Free Training</p>
        <h1 className="text-3xl lg:text-5xl font-extrabold tracking-tight mb-3">
          {firstName ? `Welcome, ${firstName}.` : "You're in."}
        </h1>
        <p className="body-lg max-w-2xl mb-10">
          Here&apos;s the full 30-minute training. Watch it end-to-end — the
          system at the end is what most operators get wrong.
        </p>
      </motion.div>

      {/* Video frame — placeholder until Cloudflare Stream (Phase 2B). */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        className="relative aspect-video w-full rounded-2xl overflow-hidden border border-[color:var(--border-strong)] bg-black"
      >
        {/* Placeholder cinematic backdrop */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(at 50% 40%, rgba(244,194,28,0.12), transparent 60%), linear-gradient(150deg, #161616 0%, #050505 70%)",
          }}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
          <div className="w-20 h-20 rounded-full border border-[color:var(--border-strong)] bg-black/40 backdrop-blur-sm flex items-center justify-center">
            <svg width="22" height="26" viewBox="0 0 22 26" fill="none" aria-hidden>
              <path d="M21 13L0.75 25.124L0.75 0.876L21 13Z" fill="currentColor" className="text-[color:var(--accent)]" />
            </svg>
          </div>
          <p className="text-xs tracking-[0.2em] uppercase text-fg-tertiary">
            Training video — coming online shortly
          </p>
        </div>
      </motion.div>

      {/* ── Upsell card — placeholder until Stripe (Phase 2B) ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        className="mt-12 lg:mt-16 relative overflow-hidden rounded-2xl border border-[color:var(--border-strong)] bg-bg-elevated p-8 lg:p-12"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              "radial-gradient(circle at 85% 30%, rgba(244,194,28,0.08), transparent 55%)",
          }}
        />
        <div className="relative grid lg:grid-cols-[1fr_auto] gap-8 items-center">
          <div>
            <p className="eyebrow mb-4">Go Deeper</p>
            <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight mb-4">
              The complete operator toolkit.
            </h2>
            <p className="text-fg-secondary leading-relaxed max-w-xl mb-6">
              Every template, spreadsheet and system referenced in the training
              — costing models, roster frameworks, menu engineering sheets and
              the operating rhythm that runs them. Done-for-you, ready to drop
              into your venue today.
            </p>
            <ul className="space-y-2 text-sm text-fg-secondary">
              {[
                "Menu & beverage costing spreadsheets",
                "Rostering + labour-model templates",
                "The weekly operating-rhythm system",
                "Lifetime access · free updates",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="text-[color:var(--accent)]" aria-hidden>
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:text-right">
            <div className="flex items-baseline gap-2 lg:justify-end mb-1">
              <span className="text-5xl font-extrabold tracking-tight">
                $89
              </span>
              <span className="text-sm text-fg-tertiary">AUD</span>
            </div>
            <p className="text-xs text-fg-muted mb-6">
              One-time · 14-day money-back guarantee
            </p>
            <button
              type="button"
              disabled
              className="w-full lg:w-auto inline-flex items-center justify-center gap-3 bg-white text-black font-semibold text-base px-8 py-4 rounded-full opacity-70 cursor-not-allowed"
              title="Checkout coming soon"
            >
              <span>Get the toolkit</span>
              <span aria-hidden>→</span>
            </button>
            <p className="mt-3 text-[0.7rem] tracking-[0.15em] uppercase text-fg-muted">
              Checkout opening soon
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
