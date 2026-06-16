/**
 * POST /api/checkout/intent
 *
 * Creates a Stripe PaymentIntent for the custom /checkout page (Payment
 * Element). Cookie-gated; the purchase is tied to the lead id from the
 * verified session, never the body.
 *
 * Flow:
 *   1. Verify lead session → load lead.
 *   2. Resolve amount/currency from the dashboard Price (source of truth),
 *      falling back to TOOLKIT_PRODUCT.
 *   3. Insert a `pending` purchases row.
 *   4. Create a PaymentIntent stamped with purchaseId/leadId metadata
 *      (the webhook reconciles on payment_intent.succeeded) and return its
 *      client_secret for the Payment Element.
 *
 * automatic_payment_methods lets Stripe surface every eligible method
 * (card, Apple Pay, Google Pay, Link) in the Element with no extra config.
 */

import { NextResponse } from "next/server";

import { db } from "@/lib/db/client";
import { purchases } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { readLeadSession } from "@/lib/auth/cookie";
import { getLeadById } from "@/lib/leads";
import { getStripe, TOOLKIT_PRODUCT } from "@/lib/stripe/client";

export const runtime = "nodejs";

export async function POST() {
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

  try {
    // 1. Amount/currency from the dashboard Price (fallback to constant).
    let amountCents: number = TOOLKIT_PRODUCT.amountCents;
    let currency: string = TOOLKIT_PRODUCT.currency;
    const priceId = process.env.STRIPE_PRICE_ID;
    if (priceId) {
      const price = await stripe.prices.retrieve(priceId);
      if (price.unit_amount) amountCents = price.unit_amount;
      if (price.currency) currency = price.currency;
    }

    // 2. Pending purchase row (id used as PaymentIntent metadata).
    const [purchase] = await db
      .insert(purchases)
      .values({
        leadId: lead.id,
        productId: TOOLKIT_PRODUCT.id,
        amountCents,
        currency: currency.toUpperCase(),
        status: "pending",
      })
      .returning();

    // 3. PaymentIntent.
    const intent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency,
      receipt_email: lead.email,
      description: TOOLKIT_PRODUCT.name,
      automatic_payment_methods: { enabled: true },
      metadata: {
        purchaseId: purchase.id,
        leadId: lead.id,
        productId: TOOLKIT_PRODUCT.id,
      },
    });

    // 4. Persist the PI id for webhook reconciliation.
    await db
      .update(purchases)
      .set({ stripePaymentIntentId: intent.id })
      .where(eq(purchases.id, purchase.id));

    return NextResponse.json({
      ok: true,
      clientSecret: intent.client_secret,
      amountCents,
      currency,
    });
  } catch (err) {
    console.error("[/api/checkout/intent] failed:", err);
    return NextResponse.json(
      { ok: false, error: "Could not start checkout. Please try again." },
      { status: 500 },
    );
  }
}
