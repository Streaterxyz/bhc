"use client";

/**
 * Par-Level Calculator — a multi-item par sheet.
 *
 * Left: enter a product's usage data. Middle: the live "how it's calculated"
 * breakdown for what you're entering. Below: your saved par sheet (every
 * product, with results + a photo) and the cash strip. The sheet autosaves.
 *
 * Standalone tool — health/$ counters untouched.
 */

import { useMemo, useState } from "react";

import {
  DELIVERY_FREQUENCIES,
  UNITS,
  computePar,
  fmtQty,
  sheetTotals,
  type DeliveryFrequency,
  type ParLevelInput,
  type RiskLevel,
  type Unit,
} from "@/lib/tools/par-level";
import { formatMoney } from "@/lib/tools/roster";

type Line = ParLevelInput & { id: string };

type Draft = {
  productName: string;
  unit: Unit;
  weeklyUsage: string;
  leadTimeDays: string;
  deliveryFrequency: DeliveryFrequency;
  currentStock: string;
  safetyBufferPct: string;
  unitCost: string;
};

const EMPTY_DRAFT: Draft = {
  productName: "",
  unit: "kg",
  weeklyUsage: "",
  leadTimeDays: "2",
  deliveryFrequency: "twice-weekly",
  currentStock: "",
  safetyBufferPct: "15",
  unitCost: "",
};

const RISK: Record<RiskLevel, { label: string; note: string; color: string; bg: string }> = {
  low: { label: "Low", note: "Well within range", color: "#1f9d6b", bg: "rgba(31,157,107,0.14)" },
  medium: { label: "Medium", note: "Watch this one", color: "#e0900b", bg: "rgba(224,144,11,0.14)" },
  high: { label: "High", note: "Stock-out risk", color: "#e0533f", bg: "rgba(224,83,63,0.14)" },
};

function draftToInput(d: Draft): ParLevelInput {
  return {
    productName: d.productName.trim(),
    unit: d.unit,
    weeklyUsage: Number(d.weeklyUsage) || 0,
    leadTimeDays: Number(d.leadTimeDays) || 0,
    deliveryFrequency: d.deliveryFrequency,
    currentStock: Number(d.currentStock) || 0,
    safetyBufferPct: Number(d.safetyBufferPct) || 0,
    unitCost: Number(d.unitCost) || 0,
  };
}

let idSeq = 0;
const newId = () => `line_${Date.now()}_${idSeq++}`;

export function ParLevelCalculator({ initial }: { initial: Line[] }) {
  const [lines, setLines] = useState<Line[]>(initial);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const draftInput = useMemo(() => draftToInput(draft), [draft]);
  const preview = useMemo(() => computePar(draftInput), [draftInput]);
  const totals = useMemo(() => sheetTotals(lines), [lines]);
  const canAdd = draftInput.productName.length > 0 && draftInput.weeklyUsage > 0;

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  async function persist(next: Line[]) {
    setSaving(true);
    try {
      await fetch("/api/tools/par-level", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines: next.map((l) => ({
            productName: l.productName,
            unit: l.unit,
            weeklyUsage: l.weeklyUsage,
            leadTimeDays: l.leadTimeDays,
            deliveryFrequency: l.deliveryFrequency,
            currentStock: l.currentStock,
            safetyBufferPct: l.safetyBufferPct,
            unitCost: l.unitCost,
            imageUrl: l.imageUrl ?? null,
          })),
        }),
      });
    } catch {
      /* best-effort; UI already updated */
    } finally {
      setSaving(false);
    }
  }

  async function fetchImage(id: string, query: string) {
    try {
      const res = await fetch(
        `/api/tools/par-level/image?q=${encodeURIComponent(query)}`,
      );
      const data = (await res.json()) as { url?: string | null };
      if (!data.url) return;
      setLines((prev) => {
        const next = prev.map((l) =>
          l.id === id ? { ...l, imageUrl: data.url ?? null } : l,
        );
        void persist(next);
        return next;
      });
    } catch {
      /* keep the fallback tile */
    }
  }

  function addOrUpdate() {
    if (!canAdd) return;
    if (editingId) {
      const next = lines.map((l) =>
        l.id === editingId ? { ...l, ...draftInput } : l,
      );
      setLines(next);
      void persist(next);
      // Re-fetch image if the name changed enough; cheap to just refresh.
      void fetchImage(editingId, draftInput.productName);
    } else {
      const line: Line = { ...draftInput, id: newId(), imageUrl: null };
      const next = [...lines, line];
      setLines(next);
      void persist(next);
      void fetchImage(line.id, line.productName);
    }
    setDraft(EMPTY_DRAFT);
    setEditingId(null);
  }

  function editLine(line: Line) {
    setEditingId(line.id);
    setDraft({
      productName: line.productName,
      unit: line.unit,
      weeklyUsage: String(line.weeklyUsage || ""),
      leadTimeDays: String(line.leadTimeDays || ""),
      deliveryFrequency: line.deliveryFrequency,
      currentStock: String(line.currentStock || ""),
      safetyBufferPct: String(line.safetyBufferPct || ""),
      unitCost: String(line.unitCost || ""),
    });
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function removeLine(id: string) {
    const next = lines.filter((l) => l.id !== id);
    setLines(next);
    void persist(next);
    if (editingId === id) {
      setEditingId(null);
      setDraft(EMPTY_DRAFT);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      {/* 1. Enter Your Data */}
      <section className="rounded-2xl border border-[color:var(--border-subtle)] bg-bg-elevated p-6">
        <Header n="1" title="Enter Your Data" sub="Fill in the fields. We'll do the maths." />
        <div className="mt-6 space-y-4">
          <Field label="Product Name">
            <input
              value={draft.productName}
              onChange={(e) => set("productName", e.target.value)}
              placeholder="e.g. Chicken Breast"
              className={inputCls}
            />
          </Field>

          <div className="grid grid-cols-[1fr_88px] gap-3">
            <Field label="Average Weekly Usage">
              <input
                inputMode="decimal"
                value={draft.weeklyUsage}
                onChange={(e) => set("weeklyUsage", e.target.value)}
                placeholder="120"
                className={inputCls}
              />
            </Field>
            <Field label="Unit">
              <select
                value={draft.unit}
                onChange={(e) => set("unit", e.target.value as Unit)}
                className={inputCls}
              >
                {UNITS.map((u) => (
                  <option key={u.value} value={u.value}>{u.label}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Supplier Lead Time (days)">
            <input
              inputMode="decimal"
              value={draft.leadTimeDays}
              onChange={(e) => set("leadTimeDays", e.target.value)}
              placeholder="2"
              className={inputCls}
            />
          </Field>

          <Field label="Delivery Frequency">
            <select
              value={draft.deliveryFrequency}
              onChange={(e) => set("deliveryFrequency", e.target.value as DeliveryFrequency)}
              className={inputCls}
            >
              {DELIVERY_FREQUENCIES.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </Field>

          <Field label={`Current Stock On Hand (${draft.unit})`}>
            <input
              inputMode="decimal"
              value={draft.currentStock}
              onChange={(e) => set("currentStock", e.target.value)}
              placeholder="35"
              className={inputCls}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Safety Buffer (%)" hint="Recommended: 10–20%">
              <input
                inputMode="decimal"
                value={draft.safetyBufferPct}
                onChange={(e) => set("safetyBufferPct", e.target.value)}
                placeholder="15"
                className={inputCls}
              />
            </Field>
            <Field label={`Unit Cost ($/${draft.unit})`}>
              <input
                inputMode="decimal"
                value={draft.unitCost}
                onChange={(e) => set("unitCost", e.target.value)}
                placeholder="9.29"
                className={inputCls}
              />
            </Field>
          </div>

          <button
            type="button"
            onClick={addOrUpdate}
            disabled={!canAdd}
            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[color:var(--accent)] px-6 py-3.5 text-base font-semibold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {editingId ? "Update product" : "Add to par sheet"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => { setEditingId(null); setDraft(EMPTY_DRAFT); }}
              className="w-full text-center text-xs text-fg-tertiary hover:text-fg-primary"
            >
              Cancel edit
            </button>
          )}
        </div>
      </section>

      <div className="space-y-6">
        {/* 2. How It's Calculated */}
        <section className="rounded-2xl border border-[color:var(--border-subtle)] bg-bg-elevated p-6">
          <Header n="2" title="How It's Calculated" sub="The steps behind the recommended order." />
          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StepCard
              n="1"
              title="Daily Usage"
              formula="Weekly Usage ÷ 7"
              working={`${fmtQty(draftInput.weeklyUsage)} ÷ 7`}
              result={`${fmtQty(round1(preview.dailyUsage))} ${draftInput.unit}/day`}
            />
            <StepCard
              n="2"
              title="Cover Required"
              formula="Daily × (delivery + lead time)"
              working={`${fmtQty(round1(preview.dailyUsage))} × ${fmtQty(round1(preview.coverDays))}d`}
              result={`${fmtQty(round1(preview.baseStock))} ${draftInput.unit}`}
            />
            <StepCard
              n="3"
              title="Add Safety Buffer"
              formula={`+ ${fmtQty(draftInput.safetyBufferPct)}%`}
              working={`+ ${fmtQty(round1(preview.safetyBuffer))} ${draftInput.unit}`}
              result={`Par = ${fmtQty(round1(preview.targetPar))} ${draftInput.unit}`}
              good
            />
            <StepCard
              n="4"
              title="Order Quantity"
              formula="Par − Current Stock"
              working={`${fmtQty(round1(preview.targetPar))} − ${fmtQty(draftInput.currentStock)}`}
              result={`Order ≈ ${fmtQty(preview.recommendedOrder)} ${draftInput.unit}`}
              good
            />
          </div>
        </section>

        {/* 3. Your par sheet */}
        <section className="rounded-2xl border border-[color:var(--border-subtle)] bg-bg-elevated p-6">
          <div className="flex items-center justify-between">
            <Header n="3" title="Your Par Sheet" sub="Everything you should order to stay in the sweet spot." />
            <span className="text-xs text-fg-muted">{saving ? "Saving…" : `${lines.length} product${lines.length === 1 ? "" : "s"}`}</span>
          </div>

          {lines.length === 0 ? (
            <p className="mt-6 rounded-xl border border-dashed border-[color:var(--border-default)] px-4 py-8 text-center text-sm text-fg-muted">
              Add your first product on the left to build your par sheet.
            </p>
          ) : (
            <div className="mt-6 space-y-3">
              {lines.map((line) => {
                const r = computePar(line);
                const risk = RISK[r.risk];
                return (
                  <div
                    key={line.id}
                    className="grid grid-cols-2 items-center gap-4 rounded-xl border border-[color:var(--border-subtle)] bg-bg-base/40 p-4 sm:grid-cols-[auto_1fr_auto_auto_auto_auto]"
                  >
                    <Thumb url={line.imageUrl} name={line.productName} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">{line.productName}</p>
                      <p className="text-xs text-fg-muted">
                        {fmtQty(line.currentStock)} {line.unit} on hand · {r.daysCoverCurrent.toFixed(1)}d cover
                      </p>
                    </div>
                    <Stat label="Target par" value={`${fmtQty(round1(r.targetPar))} ${line.unit}`} />
                    <Stat label="Order now" value={`${fmtQty(r.recommendedOrder)} ${line.unit}`} good={r.recommendedOrder > 0} />
                    <div className="text-center">
                      <span
                        className="inline-block rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold"
                        style={{ color: risk.color, backgroundColor: risk.bg }}
                      >
                        {risk.label}
                      </span>
                      <p className="mt-1 text-[0.6rem] text-fg-muted">{risk.note}</p>
                    </div>
                    <div className="flex justify-end gap-2 text-xs">
                      <button type="button" onClick={() => editLine(line)} className="text-fg-tertiary hover:text-[color:var(--accent)]">Edit</button>
                      <button type="button" onClick={() => removeLine(line.id)} className="text-fg-tertiary hover:text-[#e0533f]">Remove</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Cash strip */}
          {lines.length > 0 && (
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <Cash label="Cash Locked In Current Stock" value={formatMoney(totals.cashLocked)} />
              <Cash label="Recommended Stock Value" value={formatMoney(totals.recommendedStockValue)} />
              <Cash
                label="Cash That Could Be Freed Up"
                value={formatMoney(totals.freedUp)}
                good
                note={totals.freedUp > 0 ? "From over-stocked lines" : "You're lean — nothing to free up"}
              />
            </div>
          )}
        </section>

        <p className="rounded-xl border border-[color:var(--accent)]/30 bg-[color:var(--accent)]/5 px-4 py-3 text-sm text-fg-secondary">
          <span className="font-semibold text-[color:var(--accent)]">Profit Patch Tip:</span>{" "}
          Review par levels at least once a month, or whenever your sales change by more than 10%.
        </p>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-[color:var(--border-default)] bg-bg-base px-3 py-2.5 text-sm text-fg-primary placeholder:text-fg-muted focus:border-[color:var(--accent)] focus:outline-none";

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function Header({ n, title, sub }: { n: string; title: string; sub: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[color:var(--accent)]/15 text-sm font-bold text-[color:var(--accent)]">
        {n}
      </span>
      <div>
        <h2 className="text-lg font-extrabold tracking-tight">{title}</h2>
        <p className="text-xs text-fg-tertiary">{sub}</p>
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[0.7rem] font-medium tracking-[0.04em] text-fg-tertiary">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[0.65rem] text-fg-muted">{hint}</span>}
    </label>
  );
}

function StepCard({ n, title, formula, working, result, good }: {
  n: string; title: string; formula: string; working: string; result: string; good?: boolean;
}) {
  return (
    <div className="rounded-xl border border-[color:var(--border-subtle)] bg-bg-base/40 p-4 text-center">
      <span className="mx-auto mb-2 flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--accent)] text-xs font-bold text-black">
        {n}
      </span>
      <p className="text-sm font-bold">{title}</p>
      <p className="mt-1 text-[0.7rem] text-fg-muted">{formula}</p>
      <p className="text-[0.7rem] text-fg-tertiary">{working}</p>
      <p className="mt-1 text-sm font-extrabold" style={{ color: good ? "#1f9d6b" : undefined }}>
        {result}
      </p>
    </div>
  );
}

function Stat({ label, value, good }: { label: string; value: string; good?: boolean }) {
  return (
    <div className="text-center">
      <p className="text-[0.6rem] uppercase tracking-[0.1em] text-fg-muted">{label}</p>
      <p className="text-sm font-extrabold" style={{ color: good ? "#1f9d6b" : undefined }}>{value}</p>
    </div>
  );
}

function Cash({ label, value, good, note }: { label: string; value: string; good?: boolean; note?: string }) {
  return (
    <div className="rounded-xl border border-[color:var(--border-subtle)] bg-bg-base/40 p-4">
      <p className="text-xs text-fg-muted">{label}</p>
      <p className="mt-1 text-2xl font-extrabold tabular-nums" style={{ color: good ? "#1f9d6b" : undefined }}>
        {value}
      </p>
      {note && <p className="mt-0.5 text-[0.65rem] text-fg-muted">{note}</p>}
    </div>
  );
}

function Thumb({ url, name }: { url: string | null | undefined; name: string }) {
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={url}
        alt={name}
        className="h-12 w-12 shrink-0 rounded-lg object-cover"
        loading="lazy"
      />
    );
  }
  return (
    <div
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[color:var(--accent)]/12 text-sm font-bold text-[color:var(--accent)]"
      aria-hidden
    >
      {name.trim().charAt(0).toUpperCase() || "?"}
    </div>
  );
}
