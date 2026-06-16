"use client";

/**
 * The "Get the toolkit" CTA. Navigates to our custom /checkout page
 * (dark-branded Payment Element). Env-gated via the `enabled` prop (true
 * when STRIPE_SECRET_KEY is set server-side) so it shows a "coming soon"
 * state until Stripe is wired.
 */

import Link from "next/link";

import { capture, EVENTS } from "@/lib/analytics";

type Props = {
  enabled: boolean;
};

export function BuyToolkitButton({ enabled }: Props) {
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
      <Link
        href="/checkout"
        onClick={() =>
          capture(EVENTS.BEGIN_CHECKOUT, {
            product: "profit-patch-kit-v1",
            price: 89,
          })
        }
        className="w-full lg:w-auto inline-flex items-center justify-center gap-3 bg-white text-black font-semibold text-base px-8 py-4 rounded-full hover:bg-[color:var(--accent)] transition-colors"
      >
        <span>Get the toolkit</span>
        <span aria-hidden>→</span>
      </Link>
      <p className="mt-3 text-[0.7rem] tracking-[0.15em] uppercase text-fg-muted">
        Secure checkout · powered by Stripe
      </p>
    </>
  );
}
