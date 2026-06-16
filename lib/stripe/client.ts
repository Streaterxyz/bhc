/**
 * Stripe client + product config.
 *
 * Env-gated: `getStripe()` returns null when STRIPE_SECRET_KEY is unset, so
 * the checkout route can degrade gracefully (503 + disabled button) until
 * keys are added. This lets the whole flow ship and be reviewed before the
 * Stripe account is wired.
 */

import Stripe from "stripe";

let cached: Stripe | null | undefined;

export function getStripe(): Stripe | null {
  if (cached !== undefined) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    cached = null;
    return null;
  }
  cached = new Stripe(key, {
    // Pin to the version the installed SDK is built against, so behaviour
    // is stable across Stripe API changes.
    apiVersion: "2026-05-27.dahlia",
    appInfo: { name: "BHC", url: "https://brendonhill.co" },
  });
  return cached;
}

/** True when Stripe is configured — used to enable/disable the buy button. */
export function isCheckoutConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

/**
 * The single digital product. Inline price (price_data) keeps us from
 * having to pre-create a Stripe Price object — fine for one SKU. If we add
 * more products later, migrate these to real Stripe Products/Prices.
 */
export const TOOLKIT_PRODUCT = {
  id: "profit-patch-kit-v1",
  name: "The Profit Patch Kit",
  description:
    "The 4 tools, bonus Silent Upsell System, 15 extra strategies and 1 month of community access from the training. Plug your venue's profit leaks. Lifetime access.",
  amountCents: 8900, // $89 charged. $149 is a display-only anchor, never charged.
  currency: "aud",
} as const;

/** Display-only anchor price (in whole dollars). Never charged — used to
 *  show the founding-member discount. The real charge is amountCents above. */
export const TOOLKIT_ANCHOR_PRICE = 149;
