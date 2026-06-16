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
  title: "Free Training — The Profit Patch Kit — BHC",
  description:
    "Your venue isn't broken — it's leaking. A free 30-minute training revealing the hidden profit leaks draining hospitality margins, and the four tools that plug them.",
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

const LEAK_HOOKS = [
  "The labour trap that pushes payroll past 68% — and the roster fix that claws it straight back",
  "How one venue lost 18 bottles of premium vodka in a single weekend — with zero theft involved",
  "The “ego menu” mistake quietly killing your margins (and the swap that fixes it)",
  "The supplier minimum-order trap costing venues thousands a year without anyone noticing",
  "Why it's your systems — not your demand — that are capping your revenue",
];

function GatedView() {
  return (
    <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-center">
      {/* Left: the pitch */}
      <div>
        <p className="eyebrow mb-5">Free 30-Minute Training</p>
        <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight leading-[1.02] mb-6">
          Your venue isn&apos;t broken.
          <br />
          It&apos;s{" "}
          <span className="text-[color:var(--accent)]">leaking.</span>
        </h1>
        <p className="body-lg mb-8 max-w-xl">
          The hidden profit leaks quietly draining your margins — and the four
          tools that plug them. Watch free, unlock instantly.
        </p>

        <p className="text-xs tracking-[0.18em] uppercase text-fg-muted mb-4">
          In the next 30 minutes you&apos;ll discover
        </p>
        <ul className="space-y-3 mb-10">
          {LEAK_HOOKS.map((point) => (
            <li key={point} className="flex items-start gap-3 text-fg-secondary">
              <span
                className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[color:var(--accent)] shrink-0"
                aria-hidden
              />
              <span>{point}</span>
            </li>
          ))}
        </ul>

        {/* Proof + founder credibility */}
        <div className="border-t border-[color:var(--border-subtle)] pt-6 space-y-4 max-w-xl">
          <p className="text-sm text-fg-secondary">
            <span className="text-fg-primary font-semibold">
              The exact systems used across 50+ venues
            </span>{" "}
            to bank millions in extra profit — including one that went from{" "}
            <span className="text-fg-primary font-semibold">
              −10% profit to a $393,600 turnaround.
            </span>
          </p>
          <p className="text-sm text-fg-tertiary italic">
            “I built these out of necessity — 80-hour weeks, bleeding cash, not
            paying myself. There&apos;s a better way, and it starts here.”
            <span className="not-italic"> — Brendon Hill</span>
          </p>
        </div>
      </div>

      {/* Right: the capture form */}
      <div className="lg:pl-2">
        <div className="rounded-2xl border border-[color:var(--border-strong)] bg-bg-elevated/60 p-8 lg:p-10">
          <p className="eyebrow mb-3">Watch Free</p>
          <h2 className="text-2xl font-extrabold tracking-tight mb-2">
            Unlock the training
          </h2>
          <p className="text-sm text-fg-tertiary mb-6">
            Enter your email and it unlocks immediately. No spam — just the
            training.
          </p>
          <Suspense fallback={<FormSkeleton />}>
            <LeadCaptureForm />
          </Suspense>
          <p className="mt-5 text-[0.7rem] tracking-[0.12em] uppercase text-fg-muted text-center">
            Instant access · 30 minutes · 100% free
          </p>
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
