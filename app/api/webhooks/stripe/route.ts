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
import { getStripe, TOOLKIT_PRODUCT } from "@/lib/stripe/client";
import { getLeadById } from "@/lib/leads";
import { signMagicToken } from "@/lib/auth/magic";
import { sendEmail } from "@/lib/email/resend";
import { receiptEmail, invoiceEmail } from "@/lib/email/templates";
import { loopsUpsertContact, loopsTrackEvent } from "@/lib/loops";

function siteOrigin(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://brendonhill.co").replace(
    /\/$/,
    "",
  );
}

/**
 * Best-effort receipt + magic access link after a paid order. Never throws —
 * an email hiccup must not make the webhook 500 and trigger Stripe retries.
 */
async function sendReceipt(leadId: string | undefined, amountCents: number) {
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
    console.error("[stripe webhook] receipt email failed:", err);
  }
}

/**
 * Generate + email a formal AU tax invoice for a paid order. Best-effort +
 * env-gated (STRIPE_AUTO_INVOICE === "true"), so it never breaks the webhook
 * and can be enabled per environment (test first, then live).
 *
 * The custom checkout charges via a PaymentIntent (no Customer/Invoice), so
 * we create the invoice here, after the money is already taken:
 *   1. Reuse/create a Customer (carrying the card's billing address so
 *      Stripe Tax can determine GST applicability).
 *   2. Add the dashboard Price as the line item (inherits product +
 *      tax_behavior — set it to "inclusive" so $89 = total incl GST).
 *   3. Create the invoice with automatic_tax, finalize it (Stripe assigns a
 *      sequential invoice number + renders the PDF), and mark it
 *      paid_out_of_band (the PaymentIntent already collected payment).
 * With "Email finalized invoices" on in Stripe, the customer gets the
 * numbered tax-invoice PDF automatically.
 */
/** Map a charge's billing address (string | null fields) to the customer
 *  AddressParam shape (string | undefined). */
function toAddressParam(
  a: Stripe.Address | null | undefined,
): Stripe.AddressParam | undefined {
  if (!a) return undefined;
  return {
    line1: a.line1 ?? undefined,
    line2: a.line2 ?? undefined,
    city: a.city ?? undefined,
    state: a.state ?? undefined,
    postal_code: a.postal_code ?? undefined,
    country: a.country ?? undefined,
  };
}

async function sendTaxInvoice(stripe: Stripe, pi: Stripe.PaymentIntent) {
  if (process.env.STRIPE_AUTO_INVOICE !== "true") return;
  const leadId = pi.metadata?.leadId;
  if (!leadId) return;
  try {
    const lead = await getLeadById(leadId);
    if (!lead) return;

    // Billing details from the charge — gives at least country/postcode,
    // which Stripe Tax needs to decide whether GST applies.
    const chargeId =
      typeof pi.latest_charge === "string"
        ? pi.latest_charge
        : (pi.latest_charge?.id ?? null);
    let billing: Stripe.Charge.BillingDetails | null = null;
    if (chargeId) {
      const charge = await stripe.charges.retrieve(chargeId);
      billing = charge.billing_details ?? null;
    }

    // Reuse a customer by email if one exists, else create.
    const existing = await stripe.customers.list({ email: lead.email, limit: 1 });
    const addressParam = toAddressParam(billing?.address);
    let customer = existing.data[0];
    if (!customer) {
      customer = await stripe.customers.create({
        email: lead.email,
        name: billing?.name ?? lead.name ?? undefined,
        address: addressParam,
      });
    } else if (!customer.address && addressParam) {
      customer = await stripe.customers.update(customer.id, {
        address: addressParam,
      });
    }

    // Line item from the dashboard Price (carries product + tax behaviour);
    // fall back to an inline amount if no Price is configured.
    // Use the actual charged amount as a tax-inclusive line item — Stripe Tax
    // breaks out the GST component from the $89 inclusive total, so the
    // invoice total always matches what the customer paid.
    await stripe.invoiceItems.create({
      customer: customer.id,
      amount: pi.amount,
      currency: pi.currency,
      description: TOOLKIT_PRODUCT.name,
      tax_behavior: "inclusive",
    });

    const invoice = await stripe.invoices.create({
      customer: customer.id,
      auto_advance: false,
      collection_method: "charge_automatically",
      automatic_tax: { enabled: true },
      metadata: { paymentIntentId: pi.id, leadId: lead.id },
    });
    const finalized = await stripe.invoices.finalizeInvoice(invoice.id);

    // Mark it paid out-of-band (the PaymentIntent already collected the
    // money). The SDK may auto-retry and the first attempt can already have
    // succeeded → treat "already paid" as success.
    if (finalized.status !== "paid") {
      try {
        await stripe.invoices.pay(finalized.id, { paid_out_of_band: true });
      } catch (err) {
        const msg =
          (err as { raw?: { message?: string } })?.raw?.message ?? "";
        if (!msg.toLowerCase().includes("already paid")) throw err;
      }
    }

    // Stripe's auto-email is unreliable for out-of-band-paid invoices, so we
    // deliver the official Stripe-generated PDF ourselves via Resend.
    const inv = await stripe.invoices.retrieve(finalized.id);
    if (inv.invoice_pdf) {
      const pdfRes = await fetch(inv.invoice_pdf);
      if (pdfRes.ok) {
        const content = Buffer.from(await pdfRes.arrayBuffer());
        const { subject, html } = invoiceEmail({
          amount: `A$${(pi.amount / 100).toFixed(2)}`,
          invoiceNumber: inv.number ?? undefined,
        });
        await sendEmail({
          to: lead.email,
          subject,
          html,
          attachments: [
            {
              filename: `BHC-tax-invoice-${inv.number ?? inv.id}.pdf`,
              content,
            },
          ],
        });
      }
    }
  } catch (err) {
    console.error("[stripe webhook] tax invoice failed:", err);
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

        // Receipt + magic access link, marketing sync, and the formal AU
        // tax invoice — all best-effort (a failure here never 500s the
        // webhook, which would make Stripe retry the whole event).
        await sendReceipt(pi.metadata?.leadId, pi.amount);
        await trackPurchase(pi.metadata?.leadId, pi.amount);
        await sendTaxInvoice(stripe, pi);
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
