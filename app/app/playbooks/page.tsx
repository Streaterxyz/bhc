import Link from "next/link";
import { redirect } from "next/navigation";

import { readLeadSession } from "@/lib/auth/cookie";
import { getVenueProfile } from "@/lib/venue";
import { PLAYBOOKS } from "@/lib/tools/playbooks";
import { PLAYBOOKS_PERIOD, getSnapshot } from "@/lib/tools/snapshots";

export const dynamic = "force-dynamic";

export default async function PlaybooksIndex() {
  const session = await readLeadSession();
  if (!session) redirect("/training");

  const [profile, snap] = await Promise.all([
    getVenueProfile(session.leadId),
    getSnapshot(session.leadId, "playbooks", PLAYBOOKS_PERIOD),
  ]);
  if (!profile) redirect("/app/onboarding");
  const implemented = new Set(
    (snap?.payload as { implemented?: string[] } | null)?.implemented ?? [],
  );

  return (
    <main className="mx-auto max-w-4xl px-6 py-10 lg:py-14">
      <Link
        href="/app"
        className="mb-8 inline-flex items-center gap-2 text-xs tracking-[0.16em] uppercase text-fg-tertiary hover:text-[color:var(--accent)] transition-colors"
      >
        <span aria-hidden>←</span> Dashboard
      </Link>

      <div className="mb-10 max-w-2xl">
        <p className="mb-3 text-[0.7rem] tracking-[0.22em] uppercase text-[color:var(--accent)] font-semibold">
          Playbooks
        </p>
        <h1 className="mb-4 text-3xl font-extrabold tracking-tight lg:text-4xl">
          The strategy playbooks
        </h1>
        <p className="text-fg-secondary">
          The thinking behind the numbers — menu psychology, staff scripts,
          maximising covers and 20+ quick wins. Work through each and tick off
          what you&apos;ve implemented.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {PLAYBOOKS.map((p) => {
          const done = p.actions.filter((a) => implemented.has(a.id)).length;
          const complete = done === p.actions.length;
          return (
            <Link
              key={p.slug}
              href={`/app/playbooks/${p.slug}`}
              className="group rounded-2xl border border-[color:var(--border-subtle)] bg-bg-elevated p-6 transition-colors hover:border-[color:var(--border-strong)]"
            >
              <h2 className="text-lg font-extrabold tracking-tight">
                {p.title}
              </h2>
              <p className="mt-1 line-clamp-2 text-sm text-fg-tertiary">
                {p.intro}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span
                  className="text-xs font-medium"
                  style={{ color: complete ? "#1f9d6b" : undefined }}
                >
                  {done}/{p.actions.length} implemented
                </span>
                <span className="text-[0.65rem] uppercase tracking-[0.14em] text-fg-muted group-hover:text-[color:var(--accent)]">
                  Open →
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
