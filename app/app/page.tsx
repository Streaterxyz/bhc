import Link from "next/link";
import { redirect } from "next/navigation";

import { readLeadSession } from "@/lib/auth/cookie";
import { getVenueProfile } from "@/lib/venue";
import { LEAK_BY_ID, type LeakId, type Severity } from "@/lib/tools/diagnostic";
import { getLatestSnapshot } from "@/lib/tools/snapshots";
import { getDashboardFigures } from "@/lib/tools/dashboard";
import { AnimatedDollar } from "@/components/app/AnimatedDollar";
import { formatMoney } from "@/lib/tools/roster";

// Which leaks have a $-producing calculator (vs health-only).
const LEAK_TO_DOLLAR_TOOL: Partial<Record<LeakId, "roster" | "menu">> = {
  "labour-modelling": "roster",
  "menu-profitability": "menu",
};

export const dynamic = "force-dynamic";

const TYPE_LABELS: Record<string, string> = {
  restaurant: "Restaurant",
  bar: "Bar",
  cafe: "Cafe",
  pub: "Pub",
  hotel: "Hotel",
};

const SEVERITY: Record<Severity, { label: string; color: string; bg: string; rank: number }> = {
  high: { label: "High", color: "#e0533f", bg: "rgba(224,83,63,0.14)", rank: 0 },
  medium: { label: "Medium", color: "#e0900b", bg: "rgba(224,144,11,0.14)", rank: 1 },
  low: { label: "Low", color: "#1f9d6b", bg: "rgba(31,157,107,0.14)", rank: 2 },
};

function healthColor(score: number): string {
  if (score >= 75) return "#1f9d6b";
  if (score >= 50) return "#e0900b";
  return "#e0533f";
}

function monthLabel(periodMonth: string): string {
  const [y, m] = periodMonth.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, 1).toLocaleDateString("en-AU", {
    month: "long",
    year: "numeric",
  });
}

type LeakResult = {
  id: LeakId;
  severity: Severity;
  gapPct: number;
  yesCount: number;
  total: number;
};

export default async function AppHome() {
  const session = await readLeadSession();
  const profile = session ? await getVenueProfile(session.leadId) : null;
  if (!profile) redirect("/app/onboarding");

  const diagnostic = await getLatestSnapshot(session!.leadId, "diagnostic");
  // Forced front door: no diagnostic yet → run it first.
  if (!diagnostic) redirect("/app/diagnostic");

  const figures = await getDashboardFigures(session!.leadId);
  // Supplier is health-only (not a $-tool) — surface its reviewed state.
  const supplierSnap = await getLatestSnapshot(session!.leadId, "supplier");
  const supplierScore = supplierSnap?.healthScore ?? null;

  const health = diagnostic.healthScore ?? 0;
  const results = (
    (diagnostic.payload as { results?: LeakResult[] } | null)?.results ?? []
  )
    .slice()
    .sort(
      (a, b) =>
        SEVERITY[a.severity].rank - SEVERITY[b.severity].rank ||
        b.gapPct - a.gapPct,
    );

  return (
    <main className="mx-auto max-w-5xl px-6 py-10 lg:py-14">
      {/* Venue header */}
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

      {/* Health score + $ recovered (counters land with the calculators) */}
      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[color:var(--border-subtle)] bg-bg-elevated p-6">
          <p className="mb-3 text-[0.7rem] tracking-[0.18em] uppercase text-fg-muted">
            Venue Health Score
          </p>
          <div className="flex items-end gap-1">
            <span
              className="text-5xl font-extrabold leading-none tabular-nums"
              style={{ color: healthColor(health) }}
            >
              {health}
            </span>
            <span className="mb-1 text-base text-fg-tertiary">/100</span>
          </div>
          <p className="mt-3 text-xs text-fg-muted">
            Last run {monthLabel(diagnostic.periodMonth)} ·{" "}
            <Link
              href="/app/diagnostic"
              className="text-fg-tertiary underline hover:text-[color:var(--accent)]"
            >
              Re-take
            </Link>
          </p>
        </div>

        <div className="rounded-2xl border border-[color:var(--border-subtle)] bg-bg-elevated p-6">
          <p className="mb-3 text-[0.7rem] tracking-[0.18em] uppercase text-fg-muted">
            $ Recovered
          </p>
          <div
            className="text-5xl font-extrabold leading-none tabular-nums"
            style={{ color: figures.recovered > 0 ? "#1f9d6b" : undefined }}
          >
            <AnimatedDollar value={figures.recovered} />
          </div>
          <p className="mt-3 text-xs text-fg-muted">
            {figures.recovered > 0
              ? "Measured vs your first run"
              : "Re-run a tool next month to recover"}
          </p>
        </div>

        <div className="rounded-2xl border border-[color:var(--border-subtle)] bg-bg-elevated p-6">
          <p className="mb-3 text-[0.7rem] tracking-[0.18em] uppercase text-fg-muted">
            $ Identified
          </p>
          <div
            className="text-5xl font-extrabold leading-none tabular-nums"
            style={{ color: figures.identified > 0 ? "#e0533f" : undefined }}
          >
            <AnimatedDollar value={figures.identified} />
          </div>
          <p className="mt-3 text-xs text-fg-muted">
            {figures.identified > 0
              ? "Still on the table — go plug it"
              : "Run the calculators to quantify"}
          </p>
        </div>
      </div>

      {/* Personalised leak cards — worst first */}
      <div className="mb-5 flex items-baseline justify-between">
        <h2 className="text-xl font-extrabold tracking-tight">
          Your leaks, worst first
        </h2>
        <span className="text-xs text-fg-muted">
          from your {monthLabel(diagnostic.periodMonth)} diagnostic
        </span>
      </div>

      <div className="grid gap-3">
        {results.map((r) => {
          const leak = LEAK_BY_ID[r.id];
          const sev = SEVERITY[r.severity];
          const hasTool = Boolean(leak.routesTo.href);
          const dollarTool = LEAK_TO_DOLLAR_TOOL[r.id];
          const fig = dollarTool ? figures.perTool[dollarTool] : undefined;
          const quantified = fig?.hasData ?? false;
          const supplierReviewed =
            r.id === "stock-accountability" && supplierScore !== null;
          // Status label for the right rail.
          const statusLabel = !hasTool
            ? "Coming soon"
            : quantified
              ? fig!.recovered > 0
                ? "Recovering"
                : "Quantified"
              : supplierReviewed
                ? "Reviewed"
                : "Open →";
          const Card = (
            <div className="flex items-center justify-between gap-4 rounded-xl border border-[color:var(--border-subtle)] bg-bg-elevated px-5 py-4 transition-colors hover:border-[color:var(--border-strong)]">
              <div className="min-w-0">
                <div className="mb-1 flex items-center gap-2.5">
                  <span
                    className="rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold"
                    style={{ color: sev.color, backgroundColor: sev.bg }}
                  >
                    {sev.label}
                  </span>
                  <span className="text-[0.65rem] tracking-[0.14em] uppercase text-fg-muted">
                    Leak {leak.number}
                  </span>
                </div>
                <h3 className="truncate text-base font-bold">{leak.title}</h3>
                {quantified ? (
                  <p className="mt-0.5 text-sm">
                    <span
                      className="font-semibold"
                      style={{
                        color: fig!.current > 0 ? "#e0533f" : "#1f9d6b",
                      }}
                    >
                      {formatMoney(Math.max(0, fig!.current))}/yr
                    </span>{" "}
                    <span className="text-fg-tertiary">identified</span>
                    {fig!.recovered > 0 && (
                      <span className="text-fg-tertiary">
                        {" · "}
                        <span className="font-semibold text-[#1f9d6b]">
                          {formatMoney(fig!.recovered)}
                        </span>{" "}
                        recovered
                      </span>
                    )}
                  </p>
                ) : supplierReviewed ? (
                  <p className="mt-0.5 text-sm">
                    <span
                      className="font-semibold"
                      style={{ color: supplierScore! >= 75 ? "#1f9d6b" : "#e0900b" }}
                    >
                      {supplierScore}/100
                    </span>{" "}
                    <span className="text-fg-tertiary">supplier health</span>
                  </p>
                ) : (
                  <p className="mt-0.5 text-sm text-fg-tertiary">
                    {r.yesCount}/{r.total} best practices in place
                  </p>
                )}
              </div>
              <div className="shrink-0 text-right">
                <span className="text-xs font-medium text-fg-secondary">
                  {leak.routesTo.label}
                </span>
                <div className="text-[0.65rem] uppercase tracking-[0.14em] text-fg-muted">
                  {statusLabel}
                </div>
              </div>
            </div>
          );
          return hasTool ? (
            <Link key={r.id} href={leak.routesTo.href!}>
              {Card}
            </Link>
          ) : (
            <div key={r.id}>{Card}</div>
          );
        })}
      </div>

      {/* Playbooks entry point */}
      <Link
        href="/app/playbooks"
        className="mt-4 flex items-center justify-between rounded-xl border border-dashed border-[color:var(--border-default)] px-5 py-4 transition-colors hover:border-[color:var(--accent)]"
      >
        <div>
          <h3 className="text-base font-bold">The strategy playbooks</h3>
          <p className="mt-0.5 text-sm text-fg-tertiary">
            Menu psychology, seasonality, staff scripts & table presentation
          </p>
        </div>
        <span className="text-[0.65rem] uppercase tracking-[0.14em] text-fg-muted">
          Browse →
        </span>
      </Link>
    </main>
  );
}
