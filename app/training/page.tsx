import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { BhcLogo } from "@/components/brand/BhcLogo";
import { LeadCaptureForm } from "@/components/funnel/LeadCaptureForm";
import { TrainingExperience } from "@/components/funnel/TrainingExperience";
import { readLeadSession } from "@/lib/auth/cookie";
import { getLeadById } from "@/lib/leads";
import { hasActivePurchase } from "@/lib/purchases";
import { isCheckoutConfigured } from "@/lib/stripe/client";

export const metadata: Metadata = {
  title: "Free Training — BHC",
  description:
    "A free 30-minute training for hospitality operators ready to lift margin, systemise operations, and build a venue that runs without them.",
  robots: { index: false, follow: false },
};

// Reads cookies → must render dynamically per request.
export const dynamic = "force-dynamic";

export default async function TrainingPage({
  searchParams,
}: {
  searchParams: Promise<{ purchase?: string }>;
}) {
  const session = await readLeadSession();
  const lead = session ? await getLeadById(session.leadId) : null;
  const authed = Boolean(lead);

  const { purchase } = await searchParams;
  // Source of truth is a paid row in the DB. We also treat a fresh
  // ?purchase=success redirect from Stripe as optimistically purchased,
  // since the webhook may land a beat after the user is redirected back.
  const purchased =
    authed && lead
      ? (await hasActivePurchase(lead.id)) || purchase === "success"
      : false;
  const checkoutEnabled = isCheckoutConfigured();

  return (
    <div className="min-h-screen flex flex-col bg-bg-base">
      {/* Minimal funnel header — logo only, no nav, to reduce exits. */}
      <header className="px-6 lg:px-12 h-16 flex items-center">
        <Link href="/" aria-label="BHC home" className="text-fg-primary">
          <BhcLogo className="h-5 w-auto" aria-label="Brendon Hill Consultancy home" />
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 lg:px-12 py-12 lg:py-20">
        {authed ? (
          <TrainingExperience
            firstName={lead?.name ?? null}
            checkoutEnabled={checkoutEnabled}
            purchased={purchased}
          />
        ) : (
          <GatedView />
        )}
      </main>

      <footer className="px-6 lg:px-12 py-8 text-center">
        <p className="text-xs text-fg-muted">
          © {new Date().getFullYear()} Brendon Hill Consultancy. Everything
          Elevated. No Exceptions.
        </p>
      </footer>
    </div>
  );
}

function GatedView() {
  return (
    <div className="w-full max-w-5xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
      {/* Left: the pitch */}
      <div>
        <p className="eyebrow mb-5">Free 30-Minute Training</p>
        <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight leading-[1.02] mb-6">
          Run a venue that
          <br />
          <span className="text-[color:var(--accent)]">
            runs without you.
          </span>
        </h1>
        <p className="body-lg mb-8 max-w-lg">
          The systems, margins and operating rhythm behind Sydney&apos;s
          best-run venues — distilled into 30 minutes. Free, instant access.
        </p>

        <ul className="space-y-3">
          {[
            "Why most venues plateau — and the system that breaks through",
            "The margin levers operators consistently miss",
            "How to build an operating rhythm that doesn't depend on you",
          ].map((point) => (
            <li key={point} className="flex items-start gap-3 text-fg-secondary">
              <span
                className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[color:var(--accent)] shrink-0"
                aria-hidden
              />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Right: the capture form */}
      <div className="lg:pl-6">
        <div className="rounded-2xl border border-[color:var(--border-subtle)] bg-bg-elevated/40 p-8 lg:p-10">
          <h2 className="text-xl font-extrabold tracking-tight mb-2">
            Get instant access
          </h2>
          <p className="text-sm text-fg-tertiary mb-6">
            Enter your email and the training unlocks immediately.
          </p>
          <Suspense fallback={<FormSkeleton />}>
            <LeadCaptureForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function FormSkeleton() {
  return (
    <div className="w-full max-w-md space-y-3" aria-hidden>
      <div className="h-14 rounded-xl bg-bg-elevated animate-pulse" />
      <div className="h-14 rounded-xl bg-bg-elevated animate-pulse" />
      <div className="h-14 rounded-full bg-bg-elevated animate-pulse" />
    </div>
  );
}
