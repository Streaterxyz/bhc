import Link from "next/link";
import { redirect } from "next/navigation";

import { readLeadSession } from "@/lib/auth/cookie";
import { getVenueProfile } from "@/lib/venue";
import { SupplierChecklist } from "@/components/app/SupplierChecklist";
import { type SupplierAnswers } from "@/lib/tools/supplier";
import { getCurrentPeriodMonth, getSnapshot } from "@/lib/tools/snapshots";

export const dynamic = "force-dynamic";

export default async function SupplierPage() {
  // Entitlement enforced by app/app/layout.tsx.
  const session = await readLeadSession();
  if (!session) redirect("/training");

  // profile + this month's snapshot are independent — fetch in parallel.
  const [profile, existing] = await Promise.all([
    getVenueProfile(session.leadId),
    getSnapshot(session.leadId, "supplier", getCurrentPeriodMonth()),
  ]);
  if (!profile) redirect("/app/onboarding");
  const initial =
    (existing?.payload as { answers?: SupplierAnswers } | null)?.answers ??
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
          Leak 4 · Stock Accountability
        </p>
        <h1 className="mb-4 text-3xl font-extrabold tracking-tight lg:text-4xl">
          Supplier Cost Leak Detector
        </h1>
        <p className="text-fg-secondary">
          Your suppliers might be charging more than you realise — or
          you&apos;re buying more than you need. Work through the audit, lift
          your supplier-health score, and use the scripts to renegotiate with
          confidence.
        </p>
      </div>

      <SupplierChecklist initial={initial} />
    </main>
  );
}
