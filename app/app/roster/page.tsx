import Link from "next/link";
import { redirect } from "next/navigation";

import { readLeadSession } from "@/lib/auth/cookie";
import { getVenueProfile } from "@/lib/venue";
import { RosterCalculator } from "@/components/app/RosterCalculator";
import { emptyDays, type DayInput } from "@/lib/tools/roster";
import { getCurrentPeriodMonth, getSnapshot } from "@/lib/tools/snapshots";

export const dynamic = "force-dynamic";

export default async function RosterPage() {
  // Entitlement enforced by app/app/layout.tsx.
  const session = await readLeadSession();
  const profile = session ? await getVenueProfile(session.leadId) : null;
  if (!profile) redirect("/app/onboarding");

  const targetPct = profile.targetLabourPct ?? 28;

  // Pre-fill from this month's snapshot, else seed with the venue's SPH.
  const existing = await getSnapshot(
    session!.leadId,
    "roster",
    getCurrentPeriodMonth(),
  );
  const savedDays =
    (existing?.payload as { days?: DayInput[] } | null)?.days ?? null;
  const initialDays = savedDays ?? emptyDays(profile.avgSpendPerHead ?? 0);

  return (
    <main className="mx-auto max-w-5xl px-6 py-10 lg:py-14">
      <Link
        href="/app"
        className="mb-8 inline-flex items-center gap-2 text-xs tracking-[0.16em] uppercase text-fg-tertiary hover:text-[color:var(--accent)] transition-colors"
      >
        <span aria-hidden>←</span> Dashboard
      </Link>

      <div className="mb-8 max-w-2xl">
        <p className="mb-3 text-[0.7rem] tracking-[0.22em] uppercase text-[color:var(--accent)] font-semibold">
          Leak 2 · Labour Modelling
        </p>
        <h1 className="mb-4 text-3xl font-extrabold tracking-tight lg:text-4xl">
          Roster Waste Calculator
        </h1>
        <p className="text-fg-secondary">
          Enter a typical week. We&apos;ll show exactly how much you&apos;re
          overspending on labour against your {targetPct}% target — annualised
          — so you can see the leak and plug it.
        </p>
      </div>

      <RosterCalculator initialDays={initialDays} targetPct={targetPct} />
    </main>
  );
}
