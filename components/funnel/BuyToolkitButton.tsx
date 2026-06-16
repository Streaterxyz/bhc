"use client";

/**
 * The "Get the toolkit" CTA. POSTs to /api/checkout and redirects to the
 * Stripe-hosted checkout page. Env-gated via the `enabled` prop (true when
 * STRIPE_SECRET_KEY is set server-side) so it shows a "coming soon" state
 * until Stripe is wired.
 */

import { useState } from "react";

import { capture, EVENTS } from "@/lib/analytics";

type Props = {
  enabled: boolean;
};

export function BuyToolkitButton({ enabled }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout() {
    setLoading(true);
    setError(null);
    capture(EVENTS.BEGIN_CHECKOUT, { product: "profit-patch-kit-v1", price: 89 });
    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error ?? "Could not start checkout.");
        setLoading(false);
        return;
      }
      // Hand off to Stripe-hosted checkout.
      window.location.href = data.url;
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  if (!enabled) {
    return (
      <>
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
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={startCheckout}
        disabled={loading}
        className="w-full lg:w-auto inline-flex items-center justify-center gap-3 bg-white text-black font-semibold text-base px-8 py-4 rounded-full hover:bg-[color:var(--accent)] transition-colors disabled:opacity-70 disabled:cursor-wait"
      >
        <span>{loading ? "Starting checkout…" : "Get the toolkit"}</span>
        {!loading && <span aria-hidden>→</span>}
      </button>
      {error ? (
        <p className="mt-3 text-xs text-red-400" role="alert">
          {error}
        </p>
      ) : (
        <p className="mt-3 text-[0.7rem] tracking-[0.15em] uppercase text-fg-muted">
          Secure checkout · powered by Stripe
        </p>
      )}
    </>
  );
}
