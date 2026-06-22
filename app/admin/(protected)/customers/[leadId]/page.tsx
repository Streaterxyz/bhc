import Link from "next/link";
import { notFound } from "next/navigation";

import { requireAdmin } from "@/lib/admin/auth";
import { getCustomerDetail, type SnapshotPoint } from "@/lib/admin/customer-detail";
import { LEAKS, type LeakId, type Severity } from "@/lib/tools/diagnostic";
import type { CustomerStatus } from "@/lib/admin/segments";

export const dynamic = "force-dynamic";

// ─── small presentational helpers ───────────────────────────────────────
function money(n: number | null | undefined): string {
  if (n === null || n === undefined) return "—";
  return `$${Math.round(n).toLocaleString()}`;
}
function dateLabel(ms: number | null): string {
  if (!ms) return "—";
  return new Date(ms).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
const LEAK_TITLE: Record<LeakId, string> = Object.fromEntries(
  LEAKS.map((l) => [l.id, l.title]),
) as Record<LeakId, string>;

const SEV_CLASS: Record<Severity, string> = {
  low: "bg-green-500/15 text-green-400 border-green-500/30",
  medium:
    "bg-[color:var(--accent)]/15 text-[color:var(--accent)] border-[color:var(--accent)]/30",
  high: "bg-red-500/15 text-red-400 border-red-500/30",
};
const STATUS_CLASS: Record<CustomerStatus, string> = {
  customer:
    "bg-[color:var(--accent)]/15 text-[color:var(--accent)] border-[color:var(--accent)]/30",
  lead: "bg-bg-base text-fg-tertiary border-[color:var(--border-default)]",
  refunded: "bg-red-500/10 text-red-400 border-red-500/30",
};

const MILESTONE_LABEL: Record<string, string> = {
  play: "Started",
  progress_25: "25%",
  progress_50: "50%",
  progress_75: "75%",
  complete: "Completed",
};
const MILESTONE_ORDER = ["play", "progress_25", "progress_50", "progress_75", "complete"];

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[color:var(--border-subtle)] bg-bg-elevated p-5 lg:p-6">
      <h2 className="text-[0.65rem] tracking-[0.18em] uppercase text-fg-muted font-semibold mb-4">
        {title}
      </h2>
      {children}
    </section>
  );
}

function SnapshotTable({ points }: { points: SnapshotPoint[] }) {
  if (points.length === 0)
    return <p className="text-sm text-fg-muted">No runs yet.</p>;
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-fg-muted text-xs">
          <th className="pb-2 font-medium">Month</th>
          <th className="pb-2 font-medium text-right">$ Identified</th>
          <th className="pb-2 font-medium text-right">Health</th>
        </tr>
      </thead>
      <tbody>
        {points.map((p) => (
          <tr key={p.periodMonth} className="border-t border-[color:var(--border-subtle)]">
            <td className="py-2 text-fg-secondary">{p.periodMonth}</td>
            <td className="py-2 text-right tabular-nums text-fg-secondary">
              {money(p.dollarsIdentified)}
            </td>
            <td className="py-2 text-right tabular-nums text-fg-secondary">
              {p.healthScore ?? "—"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ leadId: string }>;
}) {
  await requireAdmin();
  const { leadId } = await params;
  const detail = await getCustomerDetail(leadId);
  if (!detail) notFound();

  const { lead, status, purchases, venue, figures, diagnostic, toolHistory, playbooksImplemented, video } = detail;

  return (
    <div className="max-w-[1100px] mx-auto">
      <Link
        href="/admin/customers"
        className="inline-flex items-center gap-2 text-xs tracking-[0.16em] uppercase text-fg-tertiary hover:text-[color:var(--accent)] transition-colors mb-6"
      >
        <span aria-hidden>←</span> All customers
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-fg-primary">
              {lead.name || lead.email}
            </h1>
            <span
              className={`rounded-full border px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide ${STATUS_CLASS[status]}`}
            >
              {status}
            </span>
          </div>
          <p className="text-fg-tertiary">{lead.email}</p>
          <p className="text-xs text-fg-muted mt-1">
            Signed up {dateLabel(lead.createdAt.getTime())}
            {lead.source ? ` · via ${lead.source}` : ""}
            {lead.status !== "active" ? ` · ${lead.status}` : ""}
          </p>
        </div>
      </div>

      {/* Key figures */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-2xl border border-[color:var(--border-subtle)] bg-bg-elevated p-5">
          <p className="text-[0.6rem] tracking-[0.18em] uppercase text-fg-muted mb-2">$ Identified</p>
          <p className="text-2xl lg:text-3xl font-extrabold text-fg-primary tabular-nums">{money(figures.identified)}</p>
        </div>
        <div className="rounded-2xl border border-[color:var(--border-subtle)] bg-bg-elevated p-5">
          <p className="text-[0.6rem] tracking-[0.18em] uppercase text-fg-muted mb-2">$ Recovered</p>
          <p className="text-2xl lg:text-3xl font-extrabold text-[color:var(--accent)] tabular-nums">{money(figures.recovered)}</p>
        </div>
        <div className="rounded-2xl border border-[color:var(--border-subtle)] bg-bg-elevated p-5">
          <p className="text-[0.6rem] tracking-[0.18em] uppercase text-fg-muted mb-2">Health Score</p>
          <p className="text-2xl lg:text-3xl font-extrabold text-fg-primary tabular-nums">
            {diagnostic.latest?.healthScore ?? "—"}
            {diagnostic.latest?.healthScore != null && (
              <span className="text-base text-fg-muted">/100</span>
            )}
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Venue profile */}
        <Card title="Venue profile">
          {venue ? (
            <dl className="grid grid-cols-2 gap-y-3 text-sm">
              <Meta label="Name" value={venue.name} />
              <Meta label="Type" value={venue.type} />
              <Meta label="Seats" value={venue.seatsCapacity?.toString() ?? "—"} />
              <Meta label="Avg spend/head" value={venue.avgSpendPerHead ? `$${venue.avgSpendPerHead}` : "—"} />
              <Meta label="Target labour %" value={`${venue.targetLabourPct}%`} />
              <Meta label="Trading days" value={venue.tradingDays?.toString() ?? "—"} />
            </dl>
          ) : (
            <p className="text-sm text-fg-muted">Not onboarded yet.</p>
          )}
        </Card>

        {/* Training engagement */}
        <Card title="Training engagement">
          {video.milestones.length === 0 ? (
            <p className="text-sm text-fg-muted">No video activity.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {MILESTONE_ORDER.map((m) => {
                const reached = video.milestones.includes(m);
                return (
                  <span
                    key={m}
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      reached
                        ? "bg-[color:var(--accent)]/15 text-[color:var(--accent)]"
                        : "bg-bg-base text-fg-muted border border-[color:var(--border-subtle)]"
                    }`}
                  >
                    {MILESTONE_LABEL[m] ?? m}
                  </span>
                );
              })}
            </div>
          )}
          {video.lastAtMs && (
            <p className="text-xs text-fg-muted mt-3">Last watched {dateLabel(video.lastAtMs)}</p>
          )}
        </Card>

        {/* Diagnostic */}
        <Card title="Leak diagnostic">
          {diagnostic.latest && diagnostic.latest.results.length > 0 ? (
            <ul className="space-y-2">
              {diagnostic.latest.results.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3">
                  <span className="text-sm text-fg-secondary">
                    {LEAK_TITLE[r.id] ?? r.id}
                  </span>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide ${SEV_CLASS[r.severity]}`}
                  >
                    {r.severity} · {r.gapPct}% gap
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-fg-muted">Diagnostic not run yet.</p>
          )}
        </Card>

        {/* Playbooks + purchases */}
        <Card title="Playbooks & orders">
          <p className="text-sm text-fg-secondary mb-4">
            <span className="font-semibold text-fg-primary">{playbooksImplemented}</span> playbook actions implemented
          </p>
          <div className="border-t border-[color:var(--border-subtle)] pt-4">
            {purchases.length === 0 ? (
              <p className="text-sm text-fg-muted">No orders.</p>
            ) : (
              <ul className="space-y-2">
                {purchases.map((p, i) => (
                  <li key={i} className="flex items-center justify-between text-sm">
                    <span className="text-fg-secondary capitalize">{p.status}</span>
                    <span className="text-fg-muted">
                      {money(p.amountCents / 100)} {p.currency} ·{" "}
                      {dateLabel(p.paidAtMs ?? p.createdAtMs)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      </div>

      {/* Tool history (versioning) */}
      <div className="grid gap-4 lg:grid-cols-3 mt-4">
        <Card title="Roster Waste — runs">
          <SnapshotTable points={toolHistory.roster} />
        </Card>
        <Card title="Menu Margin — runs">
          <SnapshotTable points={toolHistory.menu} />
        </Card>
        <Card title="Supplier — runs">
          <SnapshotTable points={toolHistory.supplier} />
        </Card>
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[0.6rem] tracking-[0.16em] uppercase text-fg-muted mb-0.5">
        {label}
      </dt>
      <dd className="text-fg-primary capitalize">{value}</dd>
    </div>
  );
}
