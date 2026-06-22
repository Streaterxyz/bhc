/**
 * POST /api/checkout/intent
 *
 * Starts the custom /checkout (Payment Element) using Stripe's
 * "invoice-first" flow: we create + finalize an Invoice up front and pay it
 * with the Payment Element. This is what lets Stripe natively email BOTH a
 * formal (GST) tax-invoice PDF and a payment-receipt PDF, AND keeps refunds
 * fully reconcilable (a real charge backs the invoice, so a refund issues a
 * proper credit note — unlike an out-of-band-paid invoice).
 *
 * Cookie-gated; the purchase is tied to the lead id from the verified
 * session, never the body.
 *
 * Flow:
 *   1. Verify lead session → load lead.
 *   2. Resolve amount/currency from the dashboard Price (source of truth),
 *      falling back to TOOLKIT_PRODUCT.
 *   3. Insert a `pending` purchases row (its id rides on invoice metadata so
 *      the webhook can reconcile on invoice.paid).
 *   4. Reuse/create a Customer, create a draft Invoice + one inclusive-GST
 *      line item, then finalize it expanding `confirmation_secret`.
 *   5. Return the invoice PaymentIntent's client_secret for the Payment
 *      Element (the form confirms it exactly like a standalone PI).
 */

import { NextResponse } from "next/server";

import { db } from "@/lib/db/client";
import { purchases } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { readLeadSession } from "@/lib/auth/cookie";
import { getLeadById } from "@/lib/leads";
import { getStripe, getGstTaxRateId, TOOLKIT_PRODUCT } from "@/lib/stripe/client";

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

    // 2. Pending purchase row (id rides on invoice metadata for the webhook).
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

    // 3. Reuse a Customer by email, else create one (the invoice + both PDFs
    //    are addressed to it; we carry the lead name for a nicer invoice).
    const existing = await stripe.customers.list({ email: lead.email, limit: 1 });
    const customer =
      existing.data[0] ??
      (await stripe.customers.create({
        email: lead.email,
        name: lead.name ?? undefined,
        metadata: { leadId: lead.id },
      }));

    // 4. Draft invoice → one inclusive-GST line item → finalize. We finalize
    //    manually (auto_advance:false) so Stripe never dunns an abandoned
    //    checkout; the open invoice just sits until paid (or ignored).
    const taxRateId = await getGstTaxRateId(stripe);

    const invoice = await stripe.invoices.create({
      customer: customer.id,
      currency,
      collection_method: "charge_automatically",
      auto_advance: false,
      description: TOOLKIT_PRODUCT.name,
      metadata: {
        purchaseId: purchase.id,
        leadId: lead.id,
        productId: TOOLKIT_PRODUCT.id,
      },
    });
    if (!invoice.id) throw new Error("Invoice was created without an id.");

    await stripe.invoiceItems.create({
      customer: customer.id,
      invoice: invoice.id,
      amount: amountCents,
      currency,
      description: TOOLKIT_PRODUCT.name,
      tax_rates: [taxRateId],
    });

    // Finalizing assigns the sequential invoice number, renders the PDF, and
    // creates the PaymentIntent whose client_secret we hand to the Element.
    const finalized = await stripe.invoices.finalizeInvoice(invoice.id, {
      expand: ["confirmation_secret"],
    });

    const clientSecret = finalized.confirmation_secret?.client_secret;
    if (!clientSecret) {
      throw new Error("Finalized invoice has no confirmation secret.");
    }

    // Make Stripe email the receipt (invoice + receipt PDFs) on payment.
    // Stripe only auto-sends invoice receipts when it *auto-charges* a saved
    // card; when the invoice is paid inline via the Payment Element's
    // confirmation_secret it doesn't fire. Setting receipt_email on the
    // underlying PaymentIntent makes Stripe send the receipt on success
    // regardless of the dashboard email settings. The PI id is the part of
    // the client_secret before "_secret_". Best-effort — never block checkout.
    const paymentIntentId = clientSecret.split("_secret_")[0];
    try {
      await stripe.paymentIntents.update(paymentIntentId, {
        receipt_email: lead.email,
      });
    } catch (err) {
      console.error("[/api/checkout/intent] could not set receipt_email:", err);
    }

    // 5. Stamp the customer id now; the PaymentIntent id is stamped by the
    //    webhook on invoice.paid (needed so charge.refunded can revoke).
    await db
      .update(purchases)
      .set({ stripeCustomerId: customer.id })
      .where(eq(purchases.id, purchase.id));

    return NextResponse.json({
      ok: true,
      clientSecret,
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
