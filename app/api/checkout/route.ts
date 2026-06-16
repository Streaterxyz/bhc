/**
 * POST /api/checkout
 *
 * Starts a Stripe Checkout Session for the $89 toolkit. Cookie-gated: only
 * an authenticated lead can buy, and the purchase is tied to the lead id
 * from the verified session (never the request body).
 *
 * Flow:
 *   1. Verify lead session → load lead.
 *   2. Insert a `pending` purchases row.
 *   3. Create a Stripe Checkout Session (one-time payment), stamping the
 *      purchaseId + leadId into metadata so the webhook can reconcile.
 *   4. Store the session id on the purchase row, return the redirect URL.
 *
 * The webhook (checkout.session.completed) flips the row to `paid`.
 */

import { NextResponse } from "next/server";

import { db } from "@/lib/db/client";
import { purchases } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { readLeadSession } from "@/lib/auth/cookie";
import { getLeadById } from "@/lib/leads";
import { getStripe, TOOLKIT_PRODUCT } from "@/lib/stripe/client";

export const runtime = "nodejs";

function siteOrigin(req: Request): string {
  // Prefer an explicit env (set in prod), else derive from the request.
  const env = process.env.NEXT_PUBLIC_SITE_URL;
  if (env) return env.replace(/\/$/, "");
  const url = new URL(req.url);
  return `${url.protocol}//${url.host}`;
}

export async function POST(req: Request) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { ok: false, error: "Checkout is not available yet." },
      { status: 503 },
    );
  }

  const session = await readLeadSession();
  if (!session) {
    return NextResponse.json(
      { ok: false, error: "Please access the training first." },
      { status: 401 },
    );
  }

  const lead = await getLeadById(session.leadId);
  if (!lead) {
    return NextResponse.json(
      { ok: false, error: "Session expired. Please re-enter your email." },
      { status: 401 },
    );
  }

  const origin = siteOrigin(req);

  try {
    // 1. Create the pending purchase row first so we have an id for metadata.
    const [purchase] = await db
      .insert(purchases)
      .values({
        leadId: lead.id,
        productId: TOOLKIT_PRODUCT.id,
        amountCents: TOOLKIT_PRODUCT.amountCents,
        currency: TOOLKIT_PRODUCT.currency.toUpperCase(),
        status: "pending",
      })
      .returning();

    // 2. Create the Stripe Checkout Session.
    // Prefer the dashboard Price (STRIPE_PRICE_ID) so price/copy can be
    // edited in Stripe without a deploy. Fall back to an inline price only
    // if no Price ID is configured (e.g. a quick local test).
    const priceId = process.env.STRIPE_PRICE_ID;
    const lineItem: import("stripe").Stripe.Checkout.SessionCreateParams.LineItem =
      priceId
        ? { quantity: 1, price: priceId }
        : {
            quantity: 1,
            price_data: {
              currency: TOOLKIT_PRODUCT.currency,
              unit_amount: TOOLKIT_PRODUCT.amountCents,
              product_data: {
                name: TOOLKIT_PRODUCT.name,
                description: TOOLKIT_PRODUCT.description,
              },
            },
          };

    const checkout = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: lead.email,
      client_reference_id: lead.id,
      line_items: [lineItem],
      metadata: {
        purchaseId: purchase.id,
        leadId: lead.id,
        productId: TOOLKIT_PRODUCT.id,
      },
      // Stripe appends ?session_id={CHECKOUT_SESSION_ID} we don't need here;
      // our own ?purchase flag drives the success UI.
      success_url: `${origin}/training?purchase=success`,
      cancel_url: `${origin}/training?purchase=cancelled`,
      // 14-day refund policy is enforced via webhook; surface T&Cs link too.
      allow_promotion_codes: false,
    });

    if (!checkout.url) {
      throw new Error("Stripe returned no checkout URL.");
    }

    // 3. Persist the session id for webhook reconciliation.
    await db
      .update(purchases)
      .set({ stripeCheckoutSessionId: checkout.id })
      .where(eq(purchases.id, purchase.id));

    return NextResponse.json({ ok: true, url: checkout.url });
  } catch (err) {
    console.error("[/api/checkout] failed:", err);
    return NextResponse.json(
      { ok: false, error: "Could not start checkout. Please try again." },
      { status: 500 },
    );
  }
}
