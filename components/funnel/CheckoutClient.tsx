"use client";

/**
 * Custom checkout experience. Two columns: a conversion-geared order
 * summary (founding price anchor, guarantee, trust, proof) and the Stripe
 * Payment Element. Creates a PaymentIntent on mount, then themes the
 * Elements to the BHC dark palette.
 */

import { useEffect, useState } from "react";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

import { CheckoutForm } from "./CheckoutForm";

const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const ANCHOR_PRICE = 149;

// Load Stripe once (module scope).
let stripePromise: Promise<Stripe | null> | null = null;
function getStripePromise() {
  if (!stripePromise && PUBLISHABLE_KEY) {
    stripePromise = loadStripe(PUBLISHABLE_KEY);
  }
  return stripePromise;
}

// Dark theme matching the BHC palette.
const appearance = {
  theme: "night" as const,
  variables: {
    colorPrimary: "#F4C21C",
    colorBackground: "#141414",
    colorText: "#f5f5f5",
    colorTextSecondary: "#9a9a9a",
    colorDanger: "#ff6b5e",
    fontFamily: "Manrope, system-ui, sans-serif",
    borderRadius: "12px",
    spacingUnit: "4px",
  },
  rules: {
    ".Input": { border: "1px solid #2a2a2a", backgroundColor: "#0e0e0e" },
    ".Input:focus": { border: "1px solid #F4C21C", boxShadow: "none" },
    ".Tab": { border: "1px solid #2a2a2a", backgroundColor: "#0e0e0e" },
    ".Tab--selected": { borderColor: "#F4C21C" },
    ".Label": { color: "#9a9a9a" },
  },
};

const KIT_ITEMS = [
  "Top 5 Leaks Checklist",
  "Roster Waste Cheat Sheet",
  "Menu Margin Trap Fixer",
  "Supplier Cost Leak Detector",
  "BONUS — The Silent Upsell System",
  "15 quick-win strategies",
  "1 month community access",
  "Lifetime access + updates",
];

type Props = {
  returnUrl: string;
};

export function CheckoutClient({ returnUrl }: Props) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/checkout/intent", { method: "POST" });
        const data = (await res.json()) as {
          clientSecret?: string;
          error?: string;
        };
        if (cancelled) return;
        if (!res.ok || !data.clientSecret) {
          setError(data.error ?? "Could not start checkout.");
          return;
        }
        setClientSecret(data.clientSecret);
      } catch {
        if (!cancelled) setError("Network error. Please refresh and try again.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto grid lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-16">
      {/* ── Order summary / proof ── */}
      <div className="lg:order-1">
        <p className="eyebrow mb-4">Your Order</p>
        <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight mb-2">
          The Profit Patch Kit
        </h1>
        <div className="flex items-baseline gap-3 mb-1.5">
          <span className="text-2xl text-fg-muted line-through">
            ${ANCHOR_PRICE}
          </span>
          <span className="text-4xl font-extrabold tracking-tight">$89</span>
          <span className="text-sm text-fg-tertiary">AUD</span>
          <span className="ml-1 text-[0.6rem] tracking-[0.16em] uppercase text-[color:var(--accent)] border border-[color:var(--accent)]/40 rounded-full px-2.5 py-1">
            Founding price
          </span>
        </div>
        <p className="text-xs text-fg-muted mb-6">
          One-time payment · GST inclusive (A$8.09 GST)
        </p>

        <ul className="space-y-2.5 mb-8">
          {KIT_ITEMS.map((item) => (
            <li
              key={item}
              className="flex items-start gap-3 text-sm text-fg-secondary"
            >
              <span className="text-[color:var(--accent)] mt-0.5" aria-hidden>
                ✓
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        {/* Guarantee */}
        <div className="rounded-xl border border-[color:var(--accent)]/30 bg-[color:var(--accent)]/[0.04] p-5 mb-6">
          <p className="text-sm font-semibold text-fg-primary mb-1">
            The $500 Guarantee
          </p>
          <p className="text-xs text-fg-secondary leading-relaxed">
            Don&apos;t uncover at least $500 in monthly savings within 30 days
            and we&apos;ll refund every penny. Backed by our 14-day, no-
            questions-asked policy.
          </p>
        </div>

        <div className="flex flex-wrap gap-x-5 gap-y-2 text-[0.7rem] tracking-[0.1em] uppercase text-fg-muted">
          <span>Instant access</span>
          <span>Lifetime access</span>
          <span>14-day refund</span>
        </div>
      </div>

      {/* ── Payment ── */}
      <div className="lg:order-2 rounded-2xl border border-[color:var(--border-strong)] bg-bg-elevated p-6 lg:p-8">
        {error ? (
          <div className="text-center py-10">
            <p className="text-sm text-[#ff6b5e] mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-[color:var(--accent)] hover:underline"
            >
              Try again
            </button>
          </div>
        ) : !clientSecret || !getStripePromise() ? (
          <div className="py-16 flex items-center justify-center">
            <div className="h-6 w-6 rounded-full border-2 border-[color:var(--border-strong)] border-t-[color:var(--accent)] animate-spin" />
          </div>
        ) : (
          <Elements
            stripe={getStripePromise()}
            options={{ clientSecret, appearance }}
          >
            <CheckoutForm returnUrl={returnUrl} />
          </Elements>
        )}
      </div>
    </div>
  );
}
