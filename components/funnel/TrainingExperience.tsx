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

import { TrainingVideo } from "./TrainingVideo";
import { BuyToolkitButton } from "./BuyToolkitButton";

type Props = {
  firstName?: string | null;
  checkoutEnabled?: boolean;
  purchased?: boolean;
};

export function TrainingExperience({
  firstName,
  checkoutEnabled = false,
  purchased = false,
}: Props) {
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

      {/* Video — env-gated Cloudflare Stream player. Falls back to the
          cinematic placeholder until NEXT_PUBLIC_STREAM_VIDEO_ID is set. */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      >
        <TrainingVideo />
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
            {purchased ? (
              // Post-purchase confirmation state.
              <div className="lg:text-right">
                <div className="inline-flex items-center gap-2 text-[color:var(--accent)] font-semibold mb-2 lg:justify-end">
                  <span aria-hidden>✓</span>
                  <span>You own this</span>
                </div>
                <p className="text-sm text-fg-secondary mb-6 max-w-xs lg:ml-auto">
                  Your toolkit is ready. Check your email for the download
                  link, or head to your downloads.
                </p>
                <a
                  href="/downloads"
                  className="w-full lg:w-auto inline-flex items-center justify-center gap-3 bg-white text-black font-semibold text-base px-8 py-4 rounded-full hover:bg-[color:var(--accent)] transition-colors"
                >
                  <span>Go to downloads</span>
                  <span aria-hidden>→</span>
                </a>
              </div>
            ) : (
              <>
                <div className="flex items-baseline gap-2 lg:justify-end mb-1">
                  <span className="text-5xl font-extrabold tracking-tight">
                    $89
                  </span>
                  <span className="text-sm text-fg-tertiary">AUD</span>
                </div>
                <p className="text-xs text-fg-muted mb-6">
                  One-time · 14-day money-back guarantee
                </p>
                <BuyToolkitButton enabled={checkoutEnabled} />
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
