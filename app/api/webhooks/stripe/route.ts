/**
 * POST /api/webhooks/stripe
 *
 * Stripe event sink. Verifies the signature against STRIPE_WEBHOOK_SECRET,
 * then reconciles our `purchases` rows.
 *
 * The custom /checkout uses Stripe's invoice-first flow (an Invoice is
 * finalized up front and paid with the Payment Element), so access is granted
 * when the invoice is paid:
 *
 *   invoice.paid    → flip pending → paid, stamp the PaymentIntent + customer
 *                     ids, set paidAt. Grants /app access. Sends our branded
 *                     access email (magic link — Stripe can't) + Loops sync.
 *                     Stripe itself natively emails the GST tax-invoice PDF
 *                     and the payment-receipt PDF.
 *   charge.refunded → flip paid → refunded, set refundedAt. Revokes access.
 *                     Reconciles cleanly because a real charge backs the
 *                     invoice (a refund can issue a proper credit note).
 *   checkout.session.completed → legacy Stripe-hosted checkout (dormant);
 *                     kept so any stray event is still handled.
 *
 * Idempotent: re-delivered events are safe — the grant only fires on the
 * pending → paid transition (so the access email never double-sends), and we
 * match on stable ids.
 *
 * IMPORTANT: needs the raw request body for signature verification, so we
 * read req.text() (not req.json()) and never let any framework parse it
 * first.
 */

import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { db } from "@/lib/db/client";
import { purchases } from "@/lib/db/schema";
import { and, eq, ne } from "drizzle-orm";
import { getStripe, TOOLKIT_PRODUCT } from "@/lib/stripe/client";
import { getLeadById } from "@/lib/leads";
import { signMagicToken } from "@/lib/auth/magic";
import { sendEmail } from "@/lib/email/resend";
import { receiptEmail } from "@/lib/email/templates";
import { loopsUpsertContact, loopsTrackEvent } from "@/lib/loops";

function siteOrigin(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://brendonhill.co").replace(
    /\/$/,
    "",
  );
}

/**
 * Best-effort branded access email (magic link into /app) after a paid order.
 * Stripe sends the invoice + receipt PDFs; this is the one thing it can't —
 * the gated access link. Never throws — an email hiccup must not 500 the
 * webhook and trigger Stripe retries.
 */
async function sendAccessEmail(leadId: string | undefined, amountCents: number) {
  if (!leadId) return;
  try {
    const lead = await getLeadById(leadId);
    if (!lead) return;
    const token = await signMagicToken({ leadId: lead.id, email: lead.email });
    const link = `${siteOrigin()}/api/auth/verify?token=${encodeURIComponent(
      token,
    )}&to=${encodeURIComponent("/app")}`;
    const amount = `A$${(amountCents / 100).toFixed(2)}`;
    const { subject, html } = receiptEmail({
      link,
      amount,
      productName: TOOLKIT_PRODUCT.name,
    });
    await sendEmail({ to: lead.email, subject, html });
  } catch (err) {
    console.error("[stripe webhook] access email failed:", err);
  }
}

/**
 * Best-effort marketing sync after a paid order. Moves the contact into the
 * customer lifecycle in Loops (so the sales nurture stops and onboarding can
 * start). Never throws — Loops being down must not 500 the webhook.
 */
async function trackPurchase(leadId: string | undefined, amountCents: number) {
  if (!leadId) return;
  try {
    const lead = await getLeadById(leadId);
    if (!lead) return;
    await loopsUpsertContact(lead.email, { lastProduct: TOOLKIT_PRODUCT.id });
    await loopsTrackEvent(lead.email, "purchased", {
      product: TOOLKIT_PRODUCT.id,
      amount: amountCents / 100,
    });
  } catch (err) {
    console.error("[stripe webhook] loops purchase sync failed:", err);
  }
}

/** Pull the PaymentIntent id from a paid invoice's payments so a later
 *  charge.refunded can match the purchase and revoke access. */
async function resolveInvoicePaymentIntentId(
  stripe: Stripe,
  invoiceId: string,
): Promise<string | null> {
  try {
    const full = await stripe.invoices.retrieve(invoiceId, {
      expand: ["payments"],
    });
    const payment = full.payments?.data?.[0]?.payment;
    if (!payment?.payment_intent) return null;
    return typeof payment.payment_intent === "string"
      ? payment.payment_intent
      : payment.payment_intent.id;
  } catch (err) {
    console.error("[stripe webhook] could not resolve invoice PI:", err);
    return null;
  }
}

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
      case "invoice.paid": {
        const inv = event.data.object as Stripe.Invoice;
        const purchaseId = inv.metadata?.purchaseId;
        if (!purchaseId || !inv.id) break; // not one of our checkout invoices

        const customerId =
          typeof inv.customer === "string"
            ? inv.customer
            : (inv.customer?.id ?? null);
        const paymentIntentId = await resolveInvoicePaymentIntentId(
          stripe,
          inv.id,
        );

        // Grant only on the pending → paid transition so re-delivered events
        // never double-send the access email.
        const granted = await db
          .update(purchases)
          .set({
            status: "paid",
            paidAt: new Date(),
            stripePaymentIntentId: paymentIntentId,
            stripeCustomerId: customerId,
          })
          .where(
            and(eq(purchases.id, purchaseId), ne(purchases.status, "paid")),
          )
          .returning();

        if (granted.length === 0) break; // already processed

        const leadId = inv.metadata?.leadId;
        await sendAccessEmail(leadId, inv.amount_paid);
        await trackPurchase(leadId, inv.amount_paid);
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId =
          typeof charge.payment_intent === "string"
            ? charge.payment_intent
            : (charge.payment_intent?.id ?? null);
        if (!paymentIntentId) break;

        // Revoke access: flip to refunded. The /app + downloads gates check
        // status === 'paid', so this instantly removes entitlement.
        await db
          .update(purchases)
          .set({ status: "refunded", refundedAt: new Date() })
          .where(eq(purchases.stripePaymentIntentId, paymentIntentId));
        break;
      }

      case "checkout.session.completed": {
        // Legacy Stripe-hosted checkout (dormant). Kept so a stray event is
        // still reconciled if one ever arrives.
        const cs = event.data.object as Stripe.Checkout.Session;
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
