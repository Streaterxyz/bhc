import Link from "next/link";
import { redirect } from "next/navigation";

import { readLeadSession } from "@/lib/auth/cookie";
import { getVenueProfile } from "@/lib/venue";
import { DiagnosticForm } from "@/components/app/DiagnosticForm";
import {
  emptyAnswers,
  type DiagnosticAnswers,
} from "@/lib/tools/diagnostic";
import { getCurrentPeriodMonth, getSnapshot } from "@/lib/tools/snapshots";

export const dynamic = "force-dynamic";

export default async function DiagnosticPage() {
  // Entitlement enforced by app/app/layout.tsx.
  const session = await readLeadSession();
  const profile = session ? await getVenueProfile(session.leadId) : null;
  // Need a venue profile first.
  if (!profile) redirect("/app/onboarding");

  // Pre-fill from this month's snapshot if it exists (re-runnable/editable).
  const existing = await getSnapshot(
    session!.leadId,
    "diagnostic",
    getCurrentPeriodMonth(),
  );
  const initial =
    (existing?.payload as { answers?: DiagnosticAnswers } | null)?.answers ??
    null;
  const isReRun = Boolean(initial);

  return (
    <main className="mx-auto max-w-5xl px-6 py-10 lg:py-14">
      <Link
        href="/app"
        className="mb-8 inline-flex items-center gap-2 text-xs tracking-[0.16em] uppercase text-fg-tertiary hover:text-[color:var(--accent)] transition-colors"
      >
        <span aria-hidden>←</span> Dashboard
      </Link>

      <div className="mb-10 max-w-2xl">
        <p className="mb-3 text-[0.7rem] tracking-[0.22em] uppercase text-[color:var(--accent)] font-semibold">
          {isReRun ? "Re-run · this month" : "Start here"}
        </p>
        <h1 className="mb-4 text-3xl font-extrabold tracking-tight lg:text-4xl">
          The Top 5 Leaks Diagnostic
        </h1>
        <p className="text-fg-secondary">
          Answer honestly — Yes if you&apos;ve got it handled, No if
          there&apos;s a gap. Your Venue Health Score and the leaks worth
          fixing first update live as you go. Takes about 3 minutes.
        </p>
      </div>

      <DiagnosticForm initial={initial ?? emptyAnswers()} />
    </main>
  );
}
