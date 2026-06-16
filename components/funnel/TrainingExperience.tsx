"use client";

/**
 * The authenticated /training view — a direct-response sales page built
 * around the training video.
 *
 * Structure:
 *   1. Welcome + video
 *   2. Sticky buy bar — reveals once the viewer passes 30% watch progress
 *      (progress comes from TrainingVideo's onProgress callback)
 *   3. Offer section: stack → outcome anchor → founding price → $500
 *      guarantee → "this is for you if" → testimonial slots → FAQ → CTA
 *
 * Pricing: $149 anchor (display only) struck through to $89 founding price.
 * The real charge is always $89 (see TOOLKIT_PRODUCT.amountCents); the $149
 * is never charged.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { TrainingVideo } from "./TrainingVideo";
import { BuyToolkitButton } from "./BuyToolkitButton";

type Props = {
  firstName?: string | null;
  checkoutEnabled?: boolean;
  purchased?: boolean;
};

const ANCHOR_PRICE = 149;

// The offer stack — every component of the kit with its proof figure.
const KIT_ITEMS: { label: string; detail: string; bonus?: boolean }[] = [
  {
    label: "Tool 1 — Top 5 Leaks Checklist",
    detail: "Pinpoint exactly where your biggest profit drains are hiding.",
  },
  {
    label: "Tool 2 — Roster Waste Cheat Sheet",
    detail:
      "The colour-coded labour fix. One venue saved $83,200 a year without touching service quality.",
  },
  {
    label: "Tool 3 — Menu Margin Trap Fixer",
    detail:
      "Swap profit-killers for profit-makers. Turned a venue's kitchen from a drain into +$30k/yr.",
  },
  {
    label: "Tool 4 — Supplier Cost Leak Detector",
    detail:
      "Audit scripts + negotiation templates that stopped $18k/yr of hidden supplier gouging.",
  },
  {
    label: "BONUS — The Silent Upsell System",
    detail:
      "One hero item, no pushy selling — the play that added $100k+/yr from a single $3 dish.",
    bonus: true,
  },
  {
    label: "15 Small-Fix, Big-Return Strategies",
    detail: "Fast wins you can implement between services.",
  },
  {
    label: "1 Month Community Access",
    detail: "Weekly topics and real-time problem solving alongside other operators.",
  },
  {
    label: "Lifetime Access + Updates",
    detail: "Yours to keep. Every future improvement to the kit, free.",
  },
];

const FAQS: { q: string; a: string }[] = [
  {
    q: "Will this work for my type of venue?",
    a: "Yes. The tools are built for hospitality across the board — restaurants, bars, cafés, clubs and multi-venue groups. The principles (labour, stock, menu, suppliers, upselling) apply to any operation serving food and drink.",
  },
  {
    q: "How fast will I see results?",
    a: "Most owners find enough leaks in the first week alone to pay for the kit ten times over. The tools are plug-and-play — you can audit your first leak the night you get them.",
  },
  {
    q: "I'm not a spreadsheet person. Is it complicated?",
    a: "No. Everything is done-for-you and ready to drop into your venue. The training walks through exactly how to use each tool with a real venue example.",
  },
  {
    q: "What if it's not for me?",
    a: "You're covered by the $500 guarantee and our 14-day money-back policy. If you don't uncover at least $500 in monthly savings within 30 days, you get a full refund.",
  },
];

export function TrainingExperience({
  firstName,
  checkoutEnabled = false,
  purchased = false,
}: Props) {
  // Watch progress drives the sticky-bar reveal. 0–1.
  const [watched, setWatched] = useState(0);
  const showStickyBar = watched >= 0.3 && !purchased;

  return (
    <div className="w-full max-w-5xl mx-auto pb-24">
      {/* ── Welcome + video ── */}
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
          silent upsell system at the end is the one most operators get wrong.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      >
        <TrainingVideo onProgress={setWatched} />
      </motion.div>

      {purchased ? (
        <PurchasedBlock />
      ) : (
        <OfferSection checkoutEnabled={checkoutEnabled} />
      )}

      {/* ── Sticky buy bar (reveals at 30% watch) ── */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-0 bottom-0 z-40 border-t border-[color:var(--border-strong)] bg-black/90 backdrop-blur-md"
          >
            <div className="max-w-5xl mx-auto px-5 lg:px-8 py-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-fg-primary truncate">
                  Get the Profit Patch Kit
                </p>
                <p className="text-xs text-fg-tertiary">
                  <span className="line-through text-fg-muted">
                    ${ANCHOR_PRICE}
                  </span>{" "}
                  <span className="text-[color:var(--accent)] font-semibold">
                    $89
                  </span>{" "}
                  founding price · $500 guarantee
                </p>
              </div>
              <a
                href="#offer"
                className="shrink-0 inline-flex items-center gap-2 bg-white text-black font-semibold text-sm px-5 py-3 rounded-full hover:bg-[color:var(--accent)] transition-colors"
              >
                <span>Get it now</span>
                <span aria-hidden>→</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
function OfferSection({ checkoutEnabled }: { checkoutEnabled: boolean }) {
  return (
    <section id="offer" className="scroll-mt-24">
      {/* Offer card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="mt-14 lg:mt-20 relative overflow-hidden rounded-2xl border border-[color:var(--border-strong)] bg-bg-elevated p-8 lg:p-12"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              "radial-gradient(circle at 85% 20%, rgba(244,194,28,0.08), transparent 55%)",
          }}
        />
        <div className="relative">
          <p className="eyebrow mb-4">Plug Every Leak</p>
          <h2 className="text-2xl lg:text-4xl font-extrabold tracking-tight mb-4 max-w-2xl">
            Get the complete Profit Patch Kit.
          </h2>
          <p className="text-fg-secondary leading-relaxed max-w-2xl mb-10">
            The exact tools from the training — done-for-you and ready to drop
            into your venue today. Stop the silent profit drain and keep what
            you&apos;re already earning.
          </p>

          {/* The stack */}
          <ul className="grid sm:grid-cols-2 gap-x-10 gap-y-5 mb-12">
            {KIT_ITEMS.map((item) => (
              <li key={item.label} className="flex items-start gap-3">
                <span
                  className={`mt-0.5 shrink-0 ${
                    item.bonus
                      ? "text-[color:var(--accent)]"
                      : "text-[color:var(--accent)]"
                  }`}
                  aria-hidden
                >
                  {item.bonus ? "★" : "✓"}
                </span>
                <div>
                  <p className="text-sm font-semibold text-fg-primary">
                    {item.label}
                  </p>
                  <p className="text-sm text-fg-tertiary leading-snug">
                    {item.detail}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          {/* Outcome anchor */}
          <div className="rounded-xl border border-[color:var(--border-default)] bg-black/30 p-6 mb-10 max-w-2xl">
            <p className="text-fg-secondary leading-relaxed">
              The venue in the case study found{" "}
              <span className="text-[color:var(--accent)] font-bold">
                $393,600 a year.
              </span>{" "}
              Your kit costs{" "}
              <span className="text-fg-primary font-bold">$89.</span> Most
              owners find enough leaks in week one to pay for it ten times over.
            </p>
          </div>

          {/* Price + CTA */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-6 mb-2">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="inline-block text-[0.65rem] tracking-[0.16em] uppercase text-[color:var(--accent)] border border-[color:var(--accent)]/40 rounded-full px-3 py-1">
                  Founding-member price
                </span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-2xl text-fg-muted line-through">
                  ${ANCHOR_PRICE}
                </span>
                <span className="text-5xl font-extrabold tracking-tight">
                  $89
                </span>
                <span className="text-sm text-fg-tertiary">AUD</span>
              </div>
              <p className="text-xs text-fg-muted mt-2 max-w-xs">
                Founding price while we build out the community — locks in your
                spot and your price.
              </p>
            </div>
            <div className="sm:pb-1">
              <BuyToolkitButton enabled={checkoutEnabled} />
            </div>
          </div>

          <p className="text-[0.7rem] tracking-[0.1em] uppercase text-fg-muted mt-4">
            Secure checkout · Stripe · Instant access · Lifetime access
          </p>
        </div>
      </motion.div>

      {/* Guarantee */}
      <div className="mt-8 rounded-2xl border border-[color:var(--accent)]/30 bg-[color:var(--accent)]/[0.04] p-8 lg:p-10">
        <p className="eyebrow mb-3">The $500 Guarantee</p>
        <h3 className="text-xl lg:text-2xl font-extrabold tracking-tight mb-3">
          Find $500 or pay nothing.
        </h3>
        <p className="text-fg-secondary leading-relaxed max-w-2xl">
          Implement these systems and if you don&apos;t uncover at least{" "}
          <span className="text-fg-primary font-semibold">
            $500 in monthly savings within 30 days
          </span>
          , I&apos;ll refund every penny. Backed by our 14-day, no-questions-
          asked money-back policy.
        </p>
      </div>

      {/* This is for you if */}
      <div className="mt-14 lg:mt-20">
        <p className="eyebrow mb-5">This Is For You If…</p>
        <ul className="space-y-3 max-w-2xl">
          {[
            "You're working 70-hour weeks just to break even.",
            "Your venue should be printing money — but the bank balance doesn't match.",
            "You're tired of putting out fires while the competition pulls ahead.",
            "You want to fix your profit problems this week, not next quarter.",
          ].map((line) => (
            <li
              key={line}
              className="flex items-start gap-3 text-fg-secondary"
            >
              <span className="text-[color:var(--accent)] mt-0.5" aria-hidden>
                →
              </span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Testimonial slots — designed, content added later */}
      <div className="mt-14 lg:mt-20">
        <p className="eyebrow mb-6">What Operators Say</p>
        <div className="grid sm:grid-cols-2 gap-5">
          {[0, 1].map((i) => (
            <figure
              key={i}
              className="rounded-2xl border border-dashed border-[color:var(--border-default)] bg-bg-elevated/30 p-6"
            >
              <blockquote className="text-fg-tertiary italic leading-relaxed mb-4">
                “Testimonial coming soon — real operator results to be added
                here.”
              </blockquote>
              <figcaption className="text-xs tracking-[0.14em] uppercase text-fg-muted">
                Venue Owner · Sydney
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-14 lg:mt-20">
        <p className="eyebrow mb-6">Questions</p>
        <dl className="divide-y divide-[color:var(--border-subtle)] border-t border-[color:var(--border-subtle)]">
          {FAQS.map((faq) => (
            <div key={faq.q} className="py-6">
              <dt className="text-base lg:text-lg font-semibold text-fg-primary mb-2">
                {faq.q}
              </dt>
              <dd className="text-fg-secondary leading-relaxed max-w-2xl">
                {faq.a}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Final CTA */}
      <div className="mt-14 lg:mt-20 text-center">
        <h3 className="text-2xl lg:text-3xl font-extrabold tracking-tight mb-3">
          Your venue&apos;s profit is already there.
        </h3>
        <p className="text-fg-secondary mb-8 max-w-xl mx-auto">
          You just need to stop the leaks. Get the complete Profit Patch Kit and
          fix your profit problems this week.
        </p>
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-baseline gap-3 justify-center">
            <span className="text-xl text-fg-muted line-through">
              ${ANCHOR_PRICE}
            </span>
            <span className="text-3xl font-extrabold tracking-tight">$89</span>
            <span className="text-sm text-fg-tertiary">AUD</span>
          </div>
          <BuyToolkitButton enabled={checkoutEnabled} />
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────
function PurchasedBlock() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="mt-14 lg:mt-20 rounded-2xl border border-[color:var(--accent)]/30 bg-[color:var(--accent)]/[0.04] p-8 lg:p-12 text-center"
    >
      <div className="inline-flex items-center gap-2 text-[color:var(--accent)] font-semibold mb-3">
        <span aria-hidden>✓</span>
        <span>You own the Profit Patch Kit</span>
      </div>
      <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight mb-3">
        Your kit is ready.
      </h2>
      <p className="text-fg-secondary mb-8 max-w-md mx-auto">
        Check your email for the download link, or head straight to your
        downloads to grab everything.
      </p>
      <a
        href="/downloads"
        className="inline-flex items-center justify-center gap-3 bg-white text-black font-semibold text-base px-8 py-4 rounded-full hover:bg-[color:var(--accent)] transition-colors"
      >
        <span>Go to downloads</span>
        <span aria-hidden>→</span>
      </a>
    </motion.div>
  );
}
