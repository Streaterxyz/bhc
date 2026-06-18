import Link from "next/link";
import { redirect } from "next/navigation";

import { readLeadSession } from "@/lib/auth/cookie";
import { getVenueProfile } from "@/lib/venue";
import { MenuCalculator } from "@/components/app/MenuCalculator";
import {
  DEFAULT_TARGET_GP_PCT,
  emptyMenuItems,
  type MenuItem,
} from "@/lib/tools/menu";
import { getCurrentPeriodMonth, getSnapshot } from "@/lib/tools/snapshots";
import { isMenuExtractConfigured } from "@/lib/ai/menu-extract";

export const dynamic = "force-dynamic";

export default async function MenuPage() {
  // Entitlement enforced by app/app/layout.tsx.
  const session = await readLeadSession();
  const profile = session ? await getVenueProfile(session.leadId) : null;
  if (!profile) redirect("/app/onboarding");

  const existing = await getSnapshot(
    session!.leadId,
    "menu",
    getCurrentPeriodMonth(),
  );
  const saved = existing?.payload as
    | { items?: MenuItem[]; targetGpPct?: number }
    | null;
  const initialItems =
    saved?.items && saved.items.length > 0 ? saved.items : emptyMenuItems(5);
  const initialTargetGpPct = saved?.targetGpPct ?? DEFAULT_TARGET_GP_PCT;

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
          Leak 5 · Menu Profitability
        </p>
        <h1 className="mb-4 text-3xl font-extrabold tracking-tight lg:text-4xl">
          Menu Margin Trap Fixer
        </h1>
        <p className="text-fg-secondary">
          Enter each item&apos;s true cost (ingredient + prep + overhead) and
          sell price to see its real margin. Add monthly units sold and
          we&apos;ll show the annual margin you&apos;re leaving on the table on
          your worst performers.
        </p>
      </div>

      <MenuCalculator
        initialItems={initialItems}
        initialTargetGpPct={initialTargetGpPct}
        importEnabled={isMenuExtractConfigured()}
      />
    </main>
  );
}
