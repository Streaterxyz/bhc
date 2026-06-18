"use client";

/**
 * Menu Margin Trap Fixer — live per-item margin table with an optional
 * "units/mo" column that turns the margin gap into an annual $ leak. Plus
 * a Recipe costing companion (scratchpad) to work out an item's true cost.
 * Pre-fills from this month's snapshot. Themed light/dark.
 */

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  DEFAULT_TARGET_GP_PCT,
  computeMenu,
  computeRecipe,
  emptyMenuItems,
  emptyRecipeElements,
  type MenuItem,
  type RecipeElement,
} from "@/lib/tools/menu";
import { formatMoney } from "@/lib/tools/roster";
import type { ExtractedMenuItem } from "@/lib/ai/menu-extract";
import { MenuImport } from "./MenuImport";

// Numeric inputs are held as strings; `category` rides along (stored, not
// shown in the table — for future grouping).
type ItemRow = {
  name: string;
  cost: string;
  labour: string;
  overhead: string;
  sell: string;
  units: string;
  category?: string;
};

function toItemRows(items: MenuItem[]): ItemRow[] {
  return items.map((it) => ({
    name: it.name,
    cost: it.cost ? String(it.cost) : "",
    labour: it.labour ? String(it.labour) : "",
    overhead: it.overhead ? String(it.overhead) : "",
    sell: it.sell ? String(it.sell) : "",
    units: it.units ? String(it.units) : "",
    category: it.category,
  }));
}

function parseItemRows(rows: ItemRow[]): MenuItem[] {
  return rows.map((r) => ({
    name: r.name,
    cost: Number(r.cost) || 0,
    labour: Number(r.labour) || 0,
    overhead: Number(r.overhead) || 0,
    sell: Number(r.sell) || 0,
    units: Number(r.units) || 0,
    ...(r.category ? { category: r.category } : {}),
  }));
}

const numCls =
  "w-16 rounded-lg border border-[color:var(--border-default)] bg-bg-base px-2 py-1.5 text-fg-primary placeholder:text-fg-muted focus:border-[color:var(--accent)] focus:outline-none transition-colors";

export function MenuCalculator({
  initialItems,
  initialTargetGpPct,
  importEnabled = false,
}: {
  initialItems: MenuItem[];
  initialTargetGpPct: number;
  importEnabled?: boolean;
}) {
  const router = useRouter();
  const [rows, setRows] = useState<ItemRow[]>(toItemRows(initialItems));
  const [target, setTarget] = useState(String(initialTargetGpPct));
  const [status, setStatus] = useState<"idle" | "saving">("idle");
  const [error, setError] = useState<string | null>(null);

  const targetGpPct = Number(target) || DEFAULT_TARGET_GP_PCT;
  const { computed, totals } = useMemo(() => {
    const items = parseItemRows(rows);
    const { rows: c, totals: t } = computeMenu(items, targetGpPct);
    return { computed: c, totals: t };
  }, [rows, targetGpPct]);

  function update(i: number, field: keyof ItemRow, value: string) {
    setRows((prev) => {
      const next = prev.slice();
      const clean =
        field === "name" ? value : value.replace(/[^0-9.]/g, "");
      next[i] = { ...next[i], [field]: clean };
      return next;
    });
  }

  function addRow() {
    setRows((prev) => [...prev, toItemRows(emptyMenuItems(1))[0]]);
  }

  // Imported menu items: prefill name + sell (+ category). Drop any blank
  // starter rows first so a fresh table isn't left with empty leading rows.
  function importItems(items: ExtractedMenuItem[]) {
    if (items.length === 0) return;
    const imported: ItemRow[] = items.map((it) => ({
      name: it.name,
      cost: "",
      labour: "",
      overhead: "",
      sell: it.price != null ? String(it.price) : "",
      units: "",
      category: it.category ?? undefined,
    }));
    setRows((prev) => {
      const nonEmpty = prev.filter(
        (r) => r.name.trim() !== "" || r.sell || r.cost,
      );
      return [...nonEmpty, ...imported];
    });
  }
  function removeRow(i: number) {
    setRows((prev) => (prev.length > 1 ? prev.filter((_, j) => j !== i) : prev));
  }

  async function onSave() {
    setStatus("saving");
    setError(null);
    try {
      const res = await fetch("/api/tools/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: parseItemRows(rows), targetGpPct }),
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

  return (
    <div>
      {/* Headline + target */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-6 rounded-2xl border border-[color:var(--border-subtle)] bg-bg-elevated p-6 lg:p-8">
        <div>
          <p className="mb-2 text-[0.7rem] tracking-[0.18em] uppercase text-fg-muted">
            {totals.hasVolume
              ? "Annual margin left on the table"
              : "Menu margin health"}
          </p>
          {totals.hasVolume ? (
            <div
              className="text-4xl font-extrabold leading-none tabular-nums lg:text-5xl"
              style={{ color: totals.annualLeak > 0 ? "#e0533f" : "#1f9d6b" }}
            >
              {formatMoney(totals.annualLeak)}
              <span className="ml-2 text-base font-medium text-fg-tertiary">
                / year
              </span>
            </div>
          ) : (
            <div className="text-3xl font-extrabold leading-none tabular-nums lg:text-4xl">
              {totals.avgGpPct.toFixed(1)}%
              <span className="ml-2 text-base font-medium text-fg-tertiary">
                avg GP
              </span>
            </div>
          )}
          <p className="mt-3 text-sm text-fg-tertiary">
            {totals.itemsBelowTarget} of {totals.pricedItems} priced items below
            your {targetGpPct}% target
            {!totals.hasVolume && " · add units/mo to see the $ leak"}
          </p>
        </div>
        <label className="text-sm">
          <span className="mb-1.5 block text-fg-secondary">Target GP %</span>
          <input
            inputMode="decimal"
            value={target}
            onChange={(e) =>
              setTarget(e.target.value.replace(/[^0-9.]/g, ""))
            }
            className="w-24 rounded-lg border border-[color:var(--border-default)] bg-bg-base px-3 py-2 text-fg-primary focus:border-[color:var(--accent)] focus:outline-none"
          />
        </label>
      </div>

      {/* Toolbar: scan/import */}
      {importEnabled && (
        <div className="mb-4 flex items-center justify-between gap-4">
          <p className="text-sm text-fg-tertiary">
            Type items in, or scan a photo/PDF of your menu to fill names + prices.
          </p>
          <MenuImport onImport={importItems} />
        </div>
      )}

      {/* Item table */}
      <div className="overflow-x-auto rounded-2xl border border-[color:var(--border-subtle)]">
        <table className="w-full min-w-[820px] border-collapse text-sm">
          <thead>
            <tr className="bg-bg-subtle text-left text-[0.65rem] uppercase tracking-[0.12em] text-fg-muted">
              <th className="px-4 py-3 font-medium">Item</th>
              <th className="px-2 py-3 font-medium">Cost $</th>
              <th className="px-2 py-3 font-medium">Labour $</th>
              <th className="px-2 py-3 font-medium">O/head $</th>
              <th className="px-2 py-3 font-medium">Sell $</th>
              <th className="px-2 py-3 font-medium">GP %</th>
              <th className="px-2 py-3 font-medium">Units/mo</th>
              <th className="px-3 py-3 font-medium text-right">$ Leak/yr</th>
              <th className="px-2 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const c = computed[i];
              return (
                <tr
                  key={i}
                  className="border-t border-[color:var(--border-subtle)]"
                >
                  <td className="px-3 py-2">
                    <input
                      value={r.name}
                      onChange={(e) => update(i, "name", e.target.value)}
                      placeholder="Dish name"
                      className="w-32 rounded-lg border border-[color:var(--border-default)] bg-bg-base px-2.5 py-1.5 text-fg-primary placeholder:text-fg-muted focus:border-[color:var(--accent)] focus:outline-none"
                    />
                  </td>
                  {(["cost", "labour", "overhead", "sell"] as const).map((f) => (
                    <td key={f} className="px-2 py-2">
                      <input
                        inputMode="decimal"
                        value={r[f]}
                        onChange={(e) => update(i, f, e.target.value)}
                        placeholder="0"
                        className={numCls}
                      />
                    </td>
                  ))}
                  <td
                    className="px-2 py-2 tabular-nums"
                    style={{
                      color: c.belowTarget
                        ? "#e0533f"
                        : c.sell > 0
                          ? "#1f9d6b"
                          : undefined,
                    }}
                  >
                    {c.sell > 0 ? `${c.gpPct.toFixed(0)}%` : "—"}
                  </td>
                  <td className="px-2 py-2">
                    <input
                      inputMode="decimal"
                      value={r.units}
                      onChange={(e) => update(i, "units", e.target.value)}
                      placeholder="0"
                      className={numCls}
                    />
                  </td>
                  <td
                    className="px-3 py-2 text-right font-semibold tabular-nums"
                    style={{ color: c.annualLeak > 0 ? "#e0533f" : undefined }}
                  >
                    {c.annualLeak > 0 ? formatMoney(c.annualLeak) : "—"}
                  </td>
                  <td className="px-2 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => removeRow(i)}
                      aria-label="Remove item"
                      className="text-fg-muted hover:text-[#e0533f] transition-colors"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={addRow}
        className="mt-3 text-sm font-medium text-[color:var(--accent)] hover:underline"
      >
        + Add item
      </button>

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
          Add units/mo to quantify the $ leak — re-run next month to track
          recovery.
        </span>
      </div>

      <RecipeHelper />
    </div>
  );
}

/** Companion scratchpad: cost a single dish from its ingredients. */
function RecipeHelper() {
  const [els, setEls] = useState(() =>
    emptyRecipeElements(4).map((e) => ({
      name: e.name,
      packCost: "",
      packSize: "",
      qty: "",
    })),
  );
  const [sell, setSell] = useState("");

  const parsed: RecipeElement[] = els.map((e) => ({
    name: e.name,
    packCost: Number(e.packCost) || 0,
    packSize: Number(e.packSize) || 0,
    qty: Number(e.qty) || 0,
  }));
  const { totalCost, gpPct } = computeRecipe(parsed, Number(sell) || 0);

  function set(i: number, field: string, value: string) {
    setEls((prev) => {
      const next = prev.slice();
      const clean = field === "name" ? value : value.replace(/[^0-9.]/g, "");
      next[i] = { ...next[i], [field]: clean };
      return next;
    });
  }

  return (
    <details className="mt-12 rounded-2xl border border-[color:var(--border-subtle)] bg-bg-elevated p-6">
      <summary className="cursor-pointer text-sm font-semibold text-fg-primary">
        Recipe costing helper — work out a dish&apos;s true cost from
        ingredients
      </summary>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr className="text-left text-[0.65rem] uppercase tracking-[0.12em] text-fg-muted">
              <th className="py-2 pr-3 font-medium">Ingredient</th>
              <th className="px-2 py-2 font-medium">Pack $</th>
              <th className="px-2 py-2 font-medium">Pack size</th>
              <th className="px-2 py-2 font-medium">Qty in dish</th>
              <th className="px-2 py-2 font-medium text-right">Cost</th>
            </tr>
          </thead>
          <tbody>
            {els.map((e, i) => {
              const cost =
                (Number(e.packCost) || 0) && (Number(e.packSize) || 0)
                  ? ((Number(e.packCost) || 0) / (Number(e.packSize) || 1)) *
                    (Number(e.qty) || 0)
                  : 0;
              return (
                <tr
                  key={i}
                  className="border-t border-[color:var(--border-subtle)]"
                >
                  <td className="py-2 pr-3">
                    <input
                      value={e.name}
                      onChange={(ev) => set(i, "name", ev.target.value)}
                      placeholder="e.g. Bacon"
                      className="w-28 rounded-lg border border-[color:var(--border-default)] bg-bg-base px-2.5 py-1.5 text-fg-primary placeholder:text-fg-muted focus:border-[color:var(--accent)] focus:outline-none"
                    />
                  </td>
                  {(["packCost", "packSize", "qty"] as const).map((f) => (
                    <td key={f} className="px-2 py-2">
                      <input
                        inputMode="decimal"
                        value={e[f]}
                        onChange={(ev) => set(i, f, ev.target.value)}
                        placeholder="0"
                        className={numCls}
                      />
                    </td>
                  ))}
                  <td className="px-2 py-2 text-right tabular-nums text-fg-tertiary">
                    {formatMoney(cost)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-6">
        <label className="text-sm">
          <span className="mb-1.5 block text-fg-secondary">Sell price $</span>
          <input
            inputMode="decimal"
            value={sell}
            onChange={(e) => setSell(e.target.value.replace(/[^0-9.]/g, ""))}
            placeholder="0"
            className="w-24 rounded-lg border border-[color:var(--border-default)] bg-bg-base px-3 py-2 text-fg-primary focus:border-[color:var(--accent)] focus:outline-none"
          />
        </label>
        <div className="text-sm">
          <span className="text-fg-muted">Total cost </span>
          <span className="font-semibold">{formatMoney(totalCost)}</span>
        </div>
        <div className="text-sm">
          <span className="text-fg-muted">GP </span>
          <span
            className="font-semibold"
            style={{ color: gpPct >= 70 ? "#1f9d6b" : "#e0900b" }}
          >
            {Number(sell) > 0 ? `${gpPct.toFixed(0)}%` : "—"}
          </span>
        </div>
      </div>
    </details>
  );
}
