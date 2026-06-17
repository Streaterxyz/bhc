import Link from "next/link";
import { redirect } from "next/navigation";

import { readLeadSession } from "@/lib/auth/cookie";
import { getVenueProfile } from "@/lib/venue";

export const dynamic = "force-dynamic";

const TYPE_LABELS: Record<string, string> = {
  restaurant: "Restaurant",
  bar: "Bar",
  cafe: "Cafe",
  pub: "Pub",
  hotel: "Hotel",
};

export default async function AppHome() {
  // Entitlement enforced by app/app/layout.tsx.
  const session = await readLeadSession();
  const profile = session ? await getVenueProfile(session.leadId) : null;

  // First-run: no venue yet → onboarding.
  if (!profile) redirect("/app/onboarding");

  return (
    <main className="mx-auto max-w-5xl px-6 py-12 lg:py-16">
      {/* Welcome */}
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-[0.7rem] tracking-[0.22em] uppercase text-fg-muted">
            Your venue
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight lg:text-4xl">
            {profile.name}
          </h1>
          <p className="mt-1 text-fg-tertiary">
            {TYPE_LABELS[profile.type] ?? profile.type}
            {profile.seatsCapacity ? ` · ${profile.seatsCapacity} covers` : ""}
            {` · target labour ${profile.targetLabourPct}%`}
          </p>
        </div>
        <Link
          href="/app/onboarding"
          className="text-xs tracking-[0.16em] uppercase text-fg-tertiary hover:text-[color:var(--accent)] transition-colors"
        >
          Edit venue
        </Link>
      </div>

      {/* Dashboard placeholder — Phase 3 builds the real counters + leak cards. */}
      <div className="rounded-2xl border border-[color:var(--border-subtle)] bg-bg-elevated p-8 lg:p-12">
        <p className="mb-3 text-[0.7rem] tracking-[0.22em] uppercase text-[color:var(--accent)] font-semibold">
          Your Profit Recovery dashboard
        </p>
        <h2 className="mb-4 text-2xl font-extrabold tracking-tight">
          Your tools are being set up.
        </h2>
        <p className="max-w-lg text-fg-secondary">
          Next, you&apos;ll run the leak diagnostic to personalise your
          dashboard — then work through the calculators to see exactly how
          much your venue is leaking, and watch it recovered month over month.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {[
            "Top 5 Leaks Diagnostic",
            "Roster Waste Calculator",
            "Menu Margin Trap Fixer",
            "Supplier Cost Leak Detector",
          ].map((tool) => (
            <div
              key={tool}
              className="flex items-center justify-between rounded-xl border border-[color:var(--border-subtle)] bg-bg-base px-4 py-3.5"
            >
              <span className="text-sm font-medium text-fg-secondary">
                {tool}
              </span>
              <span className="text-[0.6rem] tracking-[0.16em] uppercase text-fg-muted">
                Coming soon
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
