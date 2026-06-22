"use client";

/**
 * Custom checkout experience. Two columns: a conversion-geared order
 * summary (founding price anchor, guarantee, trust, proof) and the Stripe
 * Payment Element. A quick billing step (optional business details) runs
 * first so they can be set on the invoice before it's finalized; on
 * "Continue" we create the invoice and theme the Elements to the BHC dark
 * palette.
 */

import { useState } from "react";
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

const inputCls =
  "w-full rounded-lg border border-[color:var(--border-strong)] bg-[#0e0e0e] px-3.5 py-2.5 text-sm text-fg-primary placeholder:text-fg-muted focus:border-[color:var(--accent)] focus:outline-none transition-colors";

export function CheckoutClient({ returnUrl }: Props) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  // Optional "buying as a business?" billing details. Collected before the
  // invoice is created so they land on the tax-invoice PDF.
  const [isBusiness, setIsBusiness] = useState(false);
  const [biz, setBiz] = useState({
    name: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
  });

  async function startPayment() {
    setStarting(true);
    setError(null);
    try {
      const business = isBusiness && biz.name.trim() ? biz : undefined;
      const res = await fetch("/api/checkout/intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ business }),
      });
      const data = (await res.json()) as {
        clientSecret?: string;
        error?: string;
      };
      if (!res.ok || !data.clientSecret) {
        setError(data.error ?? "Could not start checkout.");
        return;
      }
      setClientSecret(data.clientSecret);
    } catch {
      setError("Network error. Please refresh and try again.");
    } finally {
      setStarting(false);
    }
  }

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
        {clientSecret && getStripePromise() ? (
          /* Step 2 — payment. */
          <Elements
            stripe={getStripePromise()}
            options={{ clientSecret, appearance }}
          >
            <CheckoutForm returnUrl={returnUrl} />
          </Elements>
        ) : (
          /* Step 1 — billing details (optional business info), then continue. */
          <div className="space-y-5">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isBusiness}
                onChange={(e) => setIsBusiness(e.target.checked)}
                className="h-4 w-4 accent-[color:var(--accent)]"
              />
              <span className="text-sm text-fg-secondary">
                I&apos;m buying as a business — add details to my tax invoice
              </span>
            </label>

            {isBusiness && (
              <div className="space-y-3">
                <input
                  className={inputCls}
                  placeholder="Business name"
                  value={biz.name}
                  onChange={(e) => setBiz({ ...biz, name: e.target.value })}
                  autoComplete="organization"
                />
                <input
                  className={inputCls}
                  placeholder="Address line 1"
                  value={biz.line1}
                  onChange={(e) => setBiz({ ...biz, line1: e.target.value })}
                  autoComplete="address-line1"
                />
                <input
                  className={inputCls}
                  placeholder="Address line 2 (optional)"
                  value={biz.line2}
                  onChange={(e) => setBiz({ ...biz, line2: e.target.value })}
                  autoComplete="address-line2"
                />
                <div className="grid grid-cols-[1.5fr_1fr] gap-3">
                  <input
                    className={inputCls}
                    placeholder="Suburb / City"
                    value={biz.city}
                    onChange={(e) => setBiz({ ...biz, city: e.target.value })}
                    autoComplete="address-level2"
                  />
                  <input
                    className={inputCls}
                    placeholder="State"
                    value={biz.state}
                    onChange={(e) => setBiz({ ...biz, state: e.target.value })}
                    autoComplete="address-level1"
                  />
                </div>
                <input
                  className={inputCls}
                  placeholder="Postcode"
                  value={biz.postalCode}
                  onChange={(e) =>
                    setBiz({ ...biz, postalCode: e.target.value })
                  }
                  autoComplete="postal-code"
                  inputMode="numeric"
                />
              </div>
            )}

            {error && (
              <p role="alert" className="text-sm text-[#ff6b5e]">
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={startPayment}
              disabled={starting || (isBusiness && !biz.name.trim())}
              className="w-full inline-flex items-center justify-center gap-3 bg-white text-black font-semibold text-base px-8 py-4 rounded-full hover:bg-[color:var(--accent)] transition-colors disabled:opacity-70 disabled:cursor-wait"
            >
              {starting ? "Starting…" : "Continue to payment"}
            </button>

            <p className="text-center text-[0.7rem] tracking-[0.1em] uppercase text-fg-muted">
              Secure payment · powered by Stripe
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
