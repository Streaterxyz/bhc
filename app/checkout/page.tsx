import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { BhcLogo } from "@/components/brand/BhcLogo";
import { CheckoutClient } from "@/components/funnel/CheckoutClient";
import { readLeadSession } from "@/lib/auth/cookie";
import { getLeadById } from "@/lib/leads";
import { hasActivePurchase } from "@/lib/purchases";
import { isCheckoutConfigured } from "@/lib/stripe/client";

export const metadata: Metadata = {
  title: "Checkout — The Profit Patch Kit — BHC",
  description: "Complete your order for the Profit Patch Kit.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://brendonhill.co").replace(
    /\/$/,
    "",
  );
}

export default async function CheckoutPage() {
  const session = await readLeadSession();
  const lead = session ? await getLeadById(session.leadId) : null;

  // Must be an identified lead — send them through the training gate first.
  if (!lead) redirect("/training");
  // Already bought — straight to their tools.
  if (await hasActivePurchase(lead.id)) redirect("/app");

  const configured = isCheckoutConfigured();
  const returnUrl = `${siteUrl()}/training?purchase=success`;

  return (
    <div className="min-h-screen flex flex-col bg-bg-base">
      <header className="px-6 lg:px-12 h-16 flex items-center justify-between">
        <Link href="/" aria-label="BHC home" className="text-fg-primary">
          <BhcLogo
            className="h-5 w-auto"
            aria-label="Brendon Hill Consultancy home"
          />
        </Link>
        <Link
          href="/training"
          className="text-xs tracking-[0.16em] uppercase text-fg-tertiary hover:text-[color:var(--accent)] transition-colors"
        >
          ← Back to training
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 lg:px-12 py-12 lg:py-16">
        {configured ? (
          <CheckoutClient returnUrl={returnUrl} />
        ) : (
          <div className="text-center max-w-md">
            <p className="eyebrow mb-4">Checkout</p>
            <h1 className="text-3xl font-extrabold tracking-tight mb-3">
              Checkout opening soon.
            </h1>
            <p className="text-fg-secondary mb-8">
              Payments aren&apos;t live just yet. Head back to the training and
              we&apos;ll have this ready shortly.
            </p>
            <Link
              href="/training"
              className="inline-flex items-center gap-2 bg-white text-black font-semibold px-7 py-3.5 rounded-full hover:bg-[color:var(--accent)] transition-colors"
            >
              <span>Back to training</span>
              <span aria-hidden>→</span>
            </Link>
          </div>
        )}
      </main>

      <footer className="px-6 lg:px-12 py-8 text-center">
        <p className="text-xs text-fg-muted">
          © {new Date().getFullYear()} Brendon Hill Consultancy ·{" "}
          <Link href="/legal/refund-policy" className="hover:text-fg-secondary">
            Refunds
          </Link>{" "}
          ·{" "}
          <Link href="/legal/terms" className="hover:text-fg-secondary">
            Terms
          </Link>
        </p>
      </footer>
    </div>
  );
}
