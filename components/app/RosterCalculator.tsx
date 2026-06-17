"use client";

/**
 * Roster Waste calculator — a live 7-day table. Operator enters Pax, SPH,
 * Labour $ and Hours per day; revenue, AHR, labour %, $ budget and $ waste
 * compute live, with a headline annualised-waste figure. Pre-fills from the
 * current month's snapshot (re-run/edit). Themed via tokens (light + dark).
 */

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  DAYS,
  computeRoster,
  emptyDays,
  formatMoney,
  type DayInput,
} from "@/lib/tools/roster";

type Row = { pax: string; sph: string; labourCost: string; hours: string };

function toRows(days: DayInput[]): Row[] {
  return days.map((d) => ({
    pax: d.pax ? String(d.pax) : "",
    sph: d.sph ? String(d.sph) : "",
    labourCost: d.labourCost ? String(d.labourCost) : "",
    hours: d.hours ? String(d.hours) : "",
  }));
}

function parseRows(rows: Row[]): DayInput[] {
  return rows.map((r) => ({
    pax: Number(r.pax) || 0,
    sph: Number(r.sph) || 0,
    labourCost: Number(r.labourCost) || 0,
    hours: Number(r.hours) || 0,
  }));
}

export function RosterCalculator({
  initialDays,
  targetPct,
}: {
  initialDays: DayInput[];
  targetPct: number;
}) {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>(toRows(initialDays));
  const [status, setStatus] = useState<"idle" | "saving">("idle");
  const [error, setError] = useState<string | null>(null);

  const { computed, totals } = useMemo(() => {
    const days = parseRows(rows);
    const { rows: c, totals: t } = computeRoster(days, targetPct);
    return { computed: c, totals: t };
  }, [rows, targetPct]);

  function update(i: number, field: keyof Row, value: string) {
    const clean = value.replace(/[^0-9.]/g, "");
    setRows((prev) => {
      const next = prev.slice();
      next[i] = { ...next[i], [field]: clean };
      return next;
    });
  }

  async function onSave() {
    setStatus("saving");
    setError(null);
    try {
      const res = await fetch("/api/tools/roster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days: parseRows(rows) }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Could not save. Please try again.");
        setStatus("idle");
        return;
      }
      router.push("/app");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setStatus("idle");
    }
  }

  const wasteColor =
    totals.annualWaste > 0 ? "#e0533f" : totals.annualWaste < 0 ? "#1f9d6b" : undefined;

  return (
    <div>
      {/* Headline */}
      <div className="mb-8 rounded-2xl border border-[color:var(--border-subtle)] bg-bg-elevated p-6 lg:p-8">
        <p className="mb-2 text-[0.7rem] tracking-[0.18em] uppercase text-fg-muted">
          Annual labour waste vs your {targetPct}% target
        </p>
        <div
          className="text-4xl font-extrabold leading-none tabular-nums lg:text-5xl"
          style={{ color: wasteColor }}
        >
          {formatMoney(totals.annualWaste)}
          <span className="ml-2 text-base font-medium text-fg-tertiary">
            / year
          </span>
        </div>
        <p className="mt-3 text-sm text-fg-tertiary">
          {formatMoney(totals.weeklyWaste)}/week ·{" "}
          {totals.avgLabourPct.toFixed(1)}% labour ·{" "}
          {formatMoney(totals.totalRevenue)} weekly revenue
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-[color:var(--border-subtle)]">
        <table className="w-full min-w-[760px] border-collapse text-sm">
          <thead>
            <tr className="bg-bg-subtle text-left text-[0.65rem] uppercase tracking-[0.12em] text-fg-muted">
              <th className="px-4 py-3 font-medium">Day</th>
              <th className="px-3 py-3 font-medium">Pax</th>
              <th className="px-3 py-3 font-medium">SPH $</th>
              <th className="px-3 py-3 font-medium">Revenue</th>
              <th className="px-3 py-3 font-medium">Labour $</th>
              <th className="px-3 py-3 font-medium">Hours</th>
              <th className="px-3 py-3 font-medium">Labour %</th>
              <th className="px-3 py-3 font-medium text-right">$ Waste</th>
            </tr>
          </thead>
          <tbody>
            {DAYS.map((day, i) => {
              const c = computed[i];
              return (
                <tr
                  key={day}
                  className="border-t border-[color:var(--border-subtle)]"
                >
                  <td className="px-4 py-2 font-medium text-fg-secondary">
                    {day.slice(0, 3)}
                  </td>
                  <td className="px-2 py-2">
                    <Cell
                      value={rows[i].pax}
                      onChange={(v) => update(i, "pax", v)}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <Cell
                      value={rows[i].sph}
                      onChange={(v) => update(i, "sph", v)}
                    />
                  </td>
                  <td className="px-3 py-2 tabular-nums text-fg-tertiary">
                    {formatMoney(c.revenue)}
                  </td>
                  <td className="px-2 py-2">
                    <Cell
                      value={rows[i].labourCost}
                      onChange={(v) => update(i, "labourCost", v)}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <Cell
                      value={rows[i].hours}
                      onChange={(v) => update(i, "hours", v)}
                    />
                  </td>
                  <td className="px-3 py-2 tabular-nums text-fg-tertiary">
                    {c.labourPct ? `${c.labourPct.toFixed(1)}%` : "—"}
                  </td>
                  <td
                    className="px-3 py-2 text-right font-semibold tabular-nums"
                    style={{
                      color:
                        c.waste > 0.5
                          ? "#e0533f"
                          : c.waste < -0.5
                            ? "#1f9d6b"
                            : undefined,
                    }}
                  >
                    {formatMoney(c.waste)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-[color:var(--border-default)] bg-bg-subtle font-semibold">
              <td className="px-4 py-3">Week</td>
              <td className="px-3 py-3" />
              <td className="px-3 py-3" />
              <td className="px-3 py-3 tabular-nums">
                {formatMoney(totals.totalRevenue)}
              </td>
              <td className="px-3 py-3 tabular-nums">
                {formatMoney(totals.totalLabour)}
              </td>
              <td className="px-3 py-3 tabular-nums">{totals.totalHours}</td>
              <td className="px-3 py-3 tabular-nums">
                {totals.avgLabourPct.toFixed(1)}%
              </td>
              <td
                className="px-3 py-3 text-right tabular-nums"
                style={{ color: wasteColor }}
              >
                {formatMoney(totals.weeklyWaste)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {error && (
        <p role="alert" className="mt-5 text-sm text-[#e0533f]">
          {error}
        </p>
      )}

      <div className="mt-8 flex items-center gap-4">
        <button
          type="button"
          onClick={onSave}
          disabled={status === "saving"}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[color:var(--accent)] px-7 py-3.5 text-base font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {status === "saving" ? "Saving…" : "Save to my dashboard"}
        </button>
        <span className="text-xs text-fg-muted">
          Saved as this month&apos;s snapshot — re-run next month to track
          recovery.
        </span>
      </div>
    </div>
  );
}

function Cell({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      inputMode="decimal"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="0"
      className="w-20 rounded-lg border border-[color:var(--border-default)] bg-bg-base px-2.5 py-1.5 text-fg-primary placeholder:text-fg-muted focus:border-[color:var(--accent)] focus:outline-none transition-colors"
    />
  );
}
