import Link from "next/link";
import { redirect } from "next/navigation";

import { readLeadSession } from "@/lib/auth/cookie";
import { getVenueProfile } from "@/lib/venue";
import { SilentUpsellChecklist } from "@/components/app/SilentUpsellChecklist";
import { type SilentUpsellAnswers } from "@/lib/tools/silent-upsell";
import { getCurrentPeriodMonth, getSnapshot } from "@/lib/tools/snapshots";

export const dynamic = "force-dynamic";

export default async function SilentUpsellPage() {
  // Entitlement enforced by app/app/layout.tsx.
  const session = await readLeadSession();
  const profile = session ? await getVenueProfile(session.leadId) : null;
  if (!profile) redirect("/app/onboarding");

  const existing = await getSnapshot(
    session!.leadId,
    "silent-upsell",
    getCurrentPeriodMonth(),
  );
  const initial =
    (existing?.payload as { answers?: SilentUpsellAnswers } | null)?.answers ??
    null;

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
          Bonus · Silent Upsell System
        </p>
        <h1 className="mb-4 text-3xl font-extrabold tracking-tight lg:text-4xl">
          The Silent Upsell System
        </h1>
        <p className="text-fg-secondary">
          Most venues believe they have a sales strategy because they have good
          staff. In reality, revenue is often left to chance. Without clear
          briefs, hero products, scripts and consistent communication, every
          team member delivers a different guest experience — and small missed
          opportunities on every table add up to thousands each year. Work
          through the audit and lift your sales-health score.
        </p>
      </div>

      <SilentUpsellChecklist initial={initial} />
    </main>
  );
}
