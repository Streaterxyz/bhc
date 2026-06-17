import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { readLeadSession } from "@/lib/auth/cookie";
import { getVenueProfile } from "@/lib/venue";
import { PLAYBOOKS, PLAYBOOK_BY_SLUG } from "@/lib/tools/playbooks";
import { PLAYBOOKS_PERIOD, getSnapshot } from "@/lib/tools/snapshots";
import { PlaybookActions } from "@/components/app/PlaybookActions";
import { CopyScript } from "@/components/app/CopyScript";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return PLAYBOOKS.map((p) => ({ slug: p.slug }));
}

export default async function PlaybookPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const playbook = PLAYBOOK_BY_SLUG[slug];
  if (!playbook) notFound();

  const session = await readLeadSession();
  const profile = session ? await getVenueProfile(session.leadId) : null;
  if (!profile) redirect("/app/onboarding");

  // Global implemented set across all playbooks (so saving preserves others).
  const snap = await getSnapshot(
    session!.leadId,
    "playbooks",
    PLAYBOOKS_PERIOD,
  );
  const implemented =
    (snap?.payload as { implemented?: string[] } | null)?.implemented ?? [];

  return (
    <main className="mx-auto max-w-3xl px-6 py-10 lg:py-14">
      <Link
        href="/app/playbooks"
        className="mb-8 inline-flex items-center gap-2 text-xs tracking-[0.16em] uppercase text-fg-tertiary hover:text-[color:var(--accent)] transition-colors"
      >
        <span aria-hidden>←</span> All playbooks
      </Link>

      <p className="mb-3 text-[0.7rem] tracking-[0.22em] uppercase text-[color:var(--accent)] font-semibold">
        Playbook
      </p>
      <h1 className="mb-4 text-3xl font-extrabold tracking-tight lg:text-4xl">
        {playbook.title}
      </h1>
      <p className="mb-12 text-lg text-fg-secondary">{playbook.intro}</p>

      {/* Sections */}
      <div className="space-y-10">
        {playbook.sections.map((s) => (
          <section key={s.heading}>
            <h2 className="mb-3 text-xl font-extrabold tracking-tight">
              {s.heading}
            </h2>
            {s.body && (
              <p className="mb-3 leading-relaxed text-fg-secondary">{s.body}</p>
            )}
            {s.bullets && (
              <ul className="space-y-1.5">
                {s.bullets.map((b, i) => (
                  <li
                    key={i}
                    className="flex gap-3 text-fg-secondary leading-relaxed"
                  >
                    <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-[color:var(--accent)]" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      {/* Scripts */}
      {playbook.scripts && playbook.scripts.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-extrabold tracking-tight">Scripts</h2>
          <div className="space-y-3">
            {playbook.scripts.map((sc) => (
              <CopyScript
                key={sc.context}
                context={sc.context}
                script={sc.script}
              />
            ))}
          </div>
        </section>
      )}

      {/* Implementation checklist */}
      <section className="mt-12 border-t border-[color:var(--border-subtle)] pt-10">
        <PlaybookActions
          actions={playbook.actions}
          initialImplemented={implemented}
        />
      </section>
    </main>
  );
}
