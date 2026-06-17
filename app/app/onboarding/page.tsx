import { readLeadSession } from "@/lib/auth/cookie";
import { getVenueProfile } from "@/lib/venue";
import { OnboardingForm } from "@/components/app/OnboardingForm";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  // Entitlement is already enforced by app/app/layout.tsx.
  const session = await readLeadSession();
  const existing = session ? await getVenueProfile(session.leadId) : null;
  const editing = Boolean(existing);

  return (
    <main className="mx-auto max-w-2xl px-6 py-12 lg:py-20">
      <p className="mb-4 text-[0.7rem] tracking-[0.22em] uppercase text-[color:var(--accent)] font-semibold">
        {editing ? "Edit your venue" : "Welcome — let's set up your venue"}
      </p>
      <h1 className="mb-4 text-3xl font-extrabold tracking-tight lg:text-4xl">
        {editing ? "Venue details" : "Tell us about your venue."}
      </h1>
      <p className="mb-10 max-w-lg text-fg-secondary">
        {editing
          ? "Update your details — the tools use these to personalise every calculation."
          : "We'll use this once to pre-fill and personalise every tool. Takes about a minute, and you can change it anytime."}
      </p>

      <OnboardingForm
        initial={
          existing
            ? {
                name: existing.name,
                type: existing.type,
                seatsCapacity: existing.seatsCapacity,
                avgSpendPerHead: existing.avgSpendPerHead,
                targetLabourPct: existing.targetLabourPct,
                tradingDays: existing.tradingDays,
              }
            : null
        }
      />
    </main>
  );
}
