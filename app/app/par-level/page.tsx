import Link from "next/link";
import { redirect } from "next/navigation";

import { readLeadSession } from "@/lib/auth/cookie";
import { getVenueProfile } from "@/lib/venue";
import { ParLevelCalculator } from "@/components/app/ParLevelCalculator";
import { type ParLevelInput } from "@/lib/tools/par-level";
import { getSnapshot } from "@/lib/tools/snapshots";

export const dynamic = "force-dynamic";

export default async function ParLevelPage() {
  // Entitlement enforced by app/app/layout.tsx.
  const session = await readLeadSession();
  const profile = session ? await getVenueProfile(session.leadId) : null;
  if (!profile) redirect("/app/onboarding");

  const snap = await getSnapshot(session!.leadId, "par-level", "all");
  const saved =
    (snap?.payload as { lines?: ParLevelInput[] } | null)?.lines ?? [];
  const initial = saved.map((line, i) => ({ ...line, id: `saved_${i}` }));

  return (
    <main className="mx-auto max-w-6xl px-6 py-10 lg:py-14">
      <Link
        href="/app"
        className="mb-8 inline-flex items-center gap-2 text-xs tracking-[0.16em] uppercase text-fg-tertiary hover:text-[color:var(--accent)] transition-colors"
      >
        <span aria-hidden>←</span> Dashboard
      </Link>

      <div className="mb-10 max-w-2xl">
        <p className="mb-3 text-[0.7rem] tracking-[0.22em] uppercase text-[color:var(--accent)] font-semibold">
          Inventory · Par-Level Calculator
        </p>
        <h1 className="mb-4 text-3xl font-extrabold tracking-tight lg:text-4xl">
          Par-Level Calculator
        </h1>
        <p className="text-fg-secondary">
          Turn your usage data into exact order quantities so you stop
          over-ordering — and stop running out. Build a par sheet for your key
          products and revisit it whenever your trade changes.
        </p>
      </div>

      <ParLevelCalculator initial={initial} />
    </main>
  );
}
