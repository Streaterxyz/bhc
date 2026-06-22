"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import {
  SEGMENTS,
  type CustomerRow,
  type CustomerStatus,
} from "@/lib/admin/segments";

type StatusFilter = "all" | CustomerStatus;

const STATUS_FILTERS: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "lead", label: "Leads" },
  { id: "customer", label: "Customers" },
  { id: "refunded", label: "Refunded" },
];

function money(n: number | null): string {
  if (n === null) return "—";
  return `$${Math.round(n).toLocaleString()}`;
}

function relativeTime(ms: number): string {
  const diff = Date.now() - ms;
  const d = Math.floor(diff / 86_400_000);
  if (d <= 0) return "today";
  if (d === 1) return "1d ago";
  if (d < 30) return `${d}d ago`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo}mo ago`;
  return `${Math.floor(mo / 12)}y ago`;
}

function StatusBadge({ status }: { status: CustomerStatus }) {
  const map: Record<CustomerStatus, string> = {
    customer:
      "bg-[color:var(--accent)]/15 text-[color:var(--accent)] border-[color:var(--accent)]/30",
    lead: "bg-bg-base text-fg-tertiary border-[color:var(--border-default)]",
    refunded: "bg-red-500/10 text-red-400 border-red-500/30",
  };
  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide ${map[status]}`}
    >
      {status}
    </span>
  );
}

function HealthDot({ score }: { score: number | null }) {
  if (score === null) return <span className="text-fg-muted">—</span>;
  const color =
    score >= 67 ? "text-green-400" : score >= 34 ? "text-[color:var(--accent)]" : "text-red-400";
  return <span className={`font-semibold tabular-nums ${color}`}>{score}</span>;
}

export function CustomersTable({ rows }: { rows: CustomerRow[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [segment, setSegment] = useState<string | null>(null);
  const [attentionOnly, setAttentionOnly] = useState(false);

  const attentionCount = useMemo(
    () => rows.filter((r) => r.needsAttention).length,
    [rows],
  );

  // Pre-compute segment counts over the full set.
  const segmentCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of SEGMENTS) counts[s.id] = rows.filter(s.predicate).length;
    return counts;
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const seg = segment ? SEGMENTS.find((s) => s.id === segment) : null;
    return rows.filter((r) => {
      if (attentionOnly && !r.needsAttention) return false;
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (seg && !seg.predicate(r)) return false;
      if (q) {
        const hay = `${r.email} ${r.name ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [rows, search, statusFilter, segment, attentionOnly]);

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col gap-4 mb-5">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name or email…"
          className="w-full max-w-sm px-4 py-2.5 rounded-lg bg-bg-elevated border border-[color:var(--border-default)] text-fg-primary placeholder:text-fg-muted text-sm focus:outline-none focus:border-[color:var(--accent)] transition-colors"
        />

        <div className="flex flex-wrap items-center gap-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setStatusFilter(f.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === f.id
                  ? "bg-fg-primary text-bg-base"
                  : "bg-bg-elevated text-fg-tertiary hover:text-fg-secondary border border-[color:var(--border-default)]"
              }`}
            >
              {f.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setAttentionOnly((v) => !v)}
            aria-pressed={attentionOnly}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors border ${
              attentionOnly
                ? "bg-red-500/15 border-red-500/40 text-red-400"
                : "bg-bg-elevated border-[color:var(--border-default)] text-fg-tertiary hover:text-fg-secondary"
            }`}
          >
            ★ Needs attention
            <span className="ml-1.5 opacity-70">{attentionCount}</span>
          </button>
        </div>

        {/* Segment chips */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[0.65rem] tracking-[0.16em] uppercase text-fg-muted mr-1">
            Segments
          </span>
          {SEGMENTS.map((s) => {
            const active = segment === s.id;
            return (
              <button
                key={s.id}
                type="button"
                title={s.description}
                onClick={() => setSegment(active ? null : s.id)}
                className={`rounded-full px-3 py-1.5 text-xs transition-colors border ${
                  active
                    ? "bg-[color:var(--accent)]/15 border-[color:var(--accent)]/40 text-[color:var(--accent)] font-semibold"
                    : "bg-bg-elevated border-[color:var(--border-default)] text-fg-tertiary hover:text-fg-secondary"
                }`}
              >
                {s.label}
                <span className="ml-1.5 opacity-70">{segmentCounts[s.id]}</span>
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-fg-muted mb-3">
        {filtered.length} of {rows.length}
      </p>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-[color:var(--border-subtle)]">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-[color:var(--border-subtle)] bg-bg-elevated text-left">
              <th className="px-4 py-3 font-semibold text-fg-tertiary">Customer</th>
              <th className="px-4 py-3 font-semibold text-fg-tertiary">Status</th>
              <th className="px-4 py-3 font-semibold text-fg-tertiary">Progress</th>
              <th className="px-4 py-3 font-semibold text-fg-tertiary text-right">Health</th>
              <th className="px-4 py-3 font-semibold text-fg-tertiary text-right">$ Identified</th>
              <th className="px-4 py-3 font-semibold text-fg-tertiary text-right">Last active</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr
                key={r.leadId}
                className="border-b border-[color:var(--border-subtle)] last:border-0 hover:bg-bg-elevated/50 transition-colors"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/customers/${r.leadId}`}
                    className="block group"
                  >
                    <span className="block font-medium text-fg-primary group-hover:text-[color:var(--accent)] transition-colors">
                      {r.needsAttention && (
                        <span
                          className="text-red-400 mr-1"
                          title="Needs attention"
                          aria-label="Needs attention"
                        >
                          ★
                        </span>
                      )}
                      {r.name || "—"}
                    </span>
                    <span className="block text-xs text-fg-muted">{r.email}</span>
                    {r.emailStatus !== "active" && (
                      <span className="text-[0.6rem] uppercase tracking-wide text-red-400">
                        {r.emailStatus}
                      </span>
                    )}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={r.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    <Step on={r.onboarded} label="Onboarded" short="O" />
                    <Step on={r.hasDiagnostic} label="Diagnostic" short="D" />
                    <Step on={r.hasCalculator} label="Calculator" short="C" />
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <HealthDot score={r.healthScore} />
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-fg-secondary">
                  {money(r.dollarsIdentified)}
                </td>
                <td className="px-4 py-3 text-right text-xs text-fg-muted whitespace-nowrap">
                  {relativeTime(r.lastActivityMs)}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/customers/${r.leadId}`}
                    className="text-fg-muted hover:text-[color:var(--accent)] transition-colors"
                    aria-label={`Open ${r.email}`}
                  >
                    →
                  </Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-fg-muted">
                  No customers match.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Step({ on, label, short }: { on: boolean; label: string; short: string }) {
  return (
    <span
      title={`${label}: ${on ? "yes" : "no"}`}
      className={`inline-flex h-5 w-5 items-center justify-center rounded text-[0.6rem] font-bold ${
        on
          ? "bg-[color:var(--accent)]/20 text-[color:var(--accent)]"
          : "bg-bg-base text-fg-muted border border-[color:var(--border-subtle)]"
      }`}
    >
      {short}
    </span>
  );
}
