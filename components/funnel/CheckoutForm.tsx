"use client";

/**
 * The payment form inside the Elements provider. Renders the Express
 * Checkout row (Apple Pay / Google Pay / Link) + the Payment Element, and
 * confirms the PaymentIntent on submit. Card data is entered into Stripe's
 * own iframes — it never touches our server or this component.
 */

import { useState } from "react";
import {
  PaymentElement,
  ExpressCheckoutElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

type Props = {
  /** Absolute URL Stripe returns to after payment (success state). */
  returnUrl: string;
};

export function CheckoutForm({ returnUrl }: Props) {
  const stripe = useStripe();
  const elements = useElements();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expressReady, setExpressReady] = useState(false);

  // Build the post-payment return URL from the live browser origin so it's
  // always a valid absolute URL — independent of NEXT_PUBLIC_SITE_URL being
  // set correctly in env. Falls back to the server-passed prop only if
  // window is somehow unavailable. (Stripe rejects relative/protocol-less
  // return_urls with "Not a valid URL".)
  function resolveReturnUrl(): string {
    if (typeof window !== "undefined" && window.location?.origin) {
      return `${window.location.origin}/training?purchase=success`;
    }
    return returnUrl;
  }

  async function confirm() {
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError(null);

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: resolveReturnUrl() },
    });

    // If we get here, confirmation failed (success redirects away).
    if (submitError) {
      setError(
        submitError.message ?? "Payment could not be completed. Please retry.",
      );
      setSubmitting(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await confirm();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Express checkout — only takes space once Stripe says a wallet is
          available (renders the divider then). */}
      <div className={expressReady ? "block" : "hidden"}>
        <ExpressCheckoutElement
          onReady={({ availablePaymentMethods }) => {
            setExpressReady(Boolean(availablePaymentMethods));
          }}
          onConfirm={async () => {
            if (!stripe || !elements) return;
            setSubmitting(true);
            setError(null);
            const { error: submitError } = await stripe.confirmPayment({
              elements,
              confirmParams: { return_url: resolveReturnUrl() },
            });
            if (submitError) {
              setError(submitError.message ?? "Payment could not be completed.");
              setSubmitting(false);
            }
          }}
        />
        <div className="flex items-center gap-4 my-6">
          <span className="h-px flex-1 bg-[color:var(--border-subtle)]" />
          <span className="text-xs tracking-[0.18em] uppercase text-fg-muted">
            or pay by card
          </span>
          <span className="h-px flex-1 bg-[color:var(--border-subtle)]" />
        </div>
      </div>

      <PaymentElement options={{ layout: "tabs" }} />

      {error && (
        <p role="alert" className="text-sm text-[#ff6b5e]">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!stripe || submitting}
        className="w-full inline-flex items-center justify-center gap-3 bg-white text-black font-semibold text-base px-8 py-4 rounded-full hover:bg-[color:var(--accent)] transition-colors disabled:opacity-70 disabled:cursor-wait"
      >
        {submitting ? "Processing…" : "Pay $89 — get instant access"}
      </button>

      <p className="text-center text-[0.7rem] tracking-[0.1em] uppercase text-fg-muted">
        Secure payment · powered by Stripe
      </p>
    </form>
  );
}
