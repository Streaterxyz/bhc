/**
 * POST /api/webhooks/stripe
 *
 * Stripe event sink. Verifies the signature against STRIPE_WEBHOOK_SECRET,
 * then reconciles our `purchases` rows:
 *
 *   checkout.session.completed → flip pending → paid, stamp payment intent
 *                                + customer id, set paidAt. This is what
 *                                grants download access.
 *   charge.refunded            → flip paid → refunded, set refundedAt.
 *                                This is what revokes download access
 *                                (the /downloads page + signed-URL route
 *                                check status === 'paid').
 *
 * Idempotent: re-delivered events (Stripe retries) are safe — we only
 * transition forward and match on stable ids.
 *
 * IMPORTANT: needs the raw request body for signature verification, so we
 * read req.text() (not req.json()) and never let any framework parse it
 * first.
 */

import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { db } from "@/lib/db/client";
import { purchases } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getStripe } from "@/lib/stripe/client";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !webhookSecret) {
    return NextResponse.json(
      { ok: false, error: "Webhook not configured." },
      { status: 503 },
    );
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json(
      { ok: false, error: "Missing stripe-signature header." },
      { status: 400 },
    );
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("[stripe webhook] signature verification failed:", err);
    return NextResponse.json(
      { ok: false, error: "Invalid signature." },
      { status: 400 },
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const cs = event.data.object as Stripe.Checkout.Session;
        // Only mark paid when Stripe confirms the payment is settled.
        if (cs.payment_status !== "paid") break;

        const purchaseId = cs.metadata?.purchaseId;
        const paymentIntentId =
          typeof cs.payment_intent === "string"
            ? cs.payment_intent
            : (cs.payment_intent?.id ?? null);
        const customerId =
          typeof cs.customer === "string"
            ? cs.customer
            : (cs.customer?.id ?? null);

        // Prefer matching on our metadata purchaseId; fall back to the
        // session id (covers events that predate the metadata stamp).
        const whereClause = purchaseId
          ? eq(purchases.id, purchaseId)
          : eq(purchases.stripeCheckoutSessionId, cs.id);

        await db
          .update(purchases)
          .set({
            status: "paid",
            paidAt: new Date(),
            stripePaymentIntentId: paymentIntentId,
            stripeCustomerId: customerId,
          })
          .where(whereClause);
        break;
      }

      case "payment_intent.succeeded": {
        // Custom /checkout flow (Payment Element). The pending purchase was
        // stamped with purchaseId in metadata when the intent was created.
        const pi = event.data.object as Stripe.PaymentIntent;
        const purchaseId = pi.metadata?.purchaseId;
        const customerId =
          typeof pi.customer === "string"
            ? pi.customer
            : (pi.customer?.id ?? null);

        const whereClause = purchaseId
          ? eq(purchases.id, purchaseId)
          : eq(purchases.stripePaymentIntentId, pi.id);

        await db
          .update(purchases)
          .set({
            status: "paid",
            paidAt: new Date(),
            stripePaymentIntentId: pi.id,
            stripeCustomerId: customerId,
          })
          .where(whereClause);
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId =
          typeof charge.payment_intent === "string"
            ? charge.payment_intent
            : (charge.payment_intent?.id ?? null);
        if (!paymentIntentId) break;

        // Revoke access: flip to refunded. The /downloads gate checks
        // status === 'paid', so this instantly removes entitlement.
        await db
          .update(purchases)
          .set({ status: "refunded", refundedAt: new Date() })
          .where(eq(purchases.stripePaymentIntentId, paymentIntentId));
        break;
      }

      default:
        // Unhandled event types are acknowledged so Stripe stops retrying.
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error(`[stripe webhook] handler error for ${event.type}:`, err);
    // 500 → Stripe retries with backoff, which is what we want for a
    // transient DB blip.
    return NextResponse.json(
      { ok: false, error: "Handler error." },
      { status: 500 },
    );
  }
}
