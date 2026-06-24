/**
 * Par-Level Calculator — engine + definitions.
 *
 * Turns usage data into exact order quantities so a venue stops over-ordering
 * (and stops running out). A multi-item "par sheet": the venue keeps a list of
 * products and revisits it. Standalone tool — NOT wired to the $ Identified/
 * Recovered dashboard counters.
 *
 * The par must hold enough stock to last from one delivery until the NEXT
 * delivery lands, so cover days = delivery interval + supplier lead time, plus
 * a safety buffer. (The original mock used lead time only; this is the
 * corrected formula confirmed with the team.)
 *
 * Shared between client (live recalc as you type) and server (persisted).
 */

export type Unit = "kg" | "L" | "each";

export const UNITS: { value: Unit; label: string }[] = [
  { value: "kg", label: "kg" },
  { value: "L", label: "L" },
  { value: "each", label: "each" },
];

export type DeliveryFrequency =
  | "daily"
  | "three-weekly"
  | "twice-weekly"
  | "weekly"
  | "fortnightly";

/** Days between deliveries — drives how long a par must last. */
export const DELIVERY_FREQUENCIES: {
  value: DeliveryFrequency;
  label: string;
  intervalDays: number;
}[] = [
  { value: "daily", label: "Daily", intervalDays: 1 },
  { value: "three-weekly", label: "Three Times Weekly", intervalDays: 7 / 3 },
  { value: "twice-weekly", label: "Twice Weekly", intervalDays: 3.5 },
  { value: "weekly", label: "Weekly", intervalDays: 7 },
  { value: "fortnightly", label: "Fortnightly", intervalDays: 14 },
];

export function deliveryIntervalDays(freq: DeliveryFrequency): number {
  return (
    DELIVERY_FREQUENCIES.find((f) => f.value === freq)?.intervalDays ?? 7
  );
}

export type ParLevelInput = {
  productName: string;
  unit: Unit;
  weeklyUsage: number; // units/week
  leadTimeDays: number;
  deliveryFrequency: DeliveryFrequency;
  currentStock: number; // units on hand
  safetyBufferPct: number; // e.g. 15
  unitCost: number; // $ per unit
  imageUrl?: string | null; // resolved + cached product photo (or null = fallback)
};

export type RiskLevel = "low" | "medium" | "high";

export type ParLevelResult = {
  dailyUsage: number;
  coverDays: number; // delivery interval + lead time
  baseStock: number; // daily × coverDays
  safetyBuffer: number; // baseStock × buffer%
  targetPar: number; // baseStock + buffer (= required stock)
  recommendedOrder: number; // rounded up, floored at 0
  daysCoverCurrent: number;
  daysCoverTarget: number;
  stockAfterOrder: number;
  daysCoverAfter: number;
  risk: RiskLevel;
  // Cash
  cashLocked: number; // currentStock × unitCost
  recommendedStockValue: number; // targetPar × unitCost
  freedUp: number; // (currentStock − targetPar) × unitCost, ≥0 — only when over-stocked
  orderCost: number; // recommendedOrder × unitCost
};

/** Round up to the nearest 0.5 (matches the mock: 4.3 → 4.5). */
function roundUpHalf(n: number): number {
  return Math.ceil(n * 2) / 2;
}

export function computePar(input: ParLevelInput): ParLevelResult {
  const daily = input.weeklyUsage > 0 ? input.weeklyUsage / 7 : 0;
  const coverDays =
    deliveryIntervalDays(input.deliveryFrequency) + Math.max(0, input.leadTimeDays);
  const baseStock = daily * coverDays;
  const safetyBuffer = baseStock * (Math.max(0, input.safetyBufferPct) / 100);
  const targetPar = baseStock + safetyBuffer;
  const recommendedOrder = roundUpHalf(Math.max(0, targetPar - input.currentStock));
  const stockAfterOrder = input.currentStock + recommendedOrder;

  const cover = (stock: number) => (daily > 0 ? stock / daily : 0);
  const daysCoverCurrent = cover(input.currentStock);

  // Risk = stock-out exposure before the next delivery lands.
  let risk: RiskLevel;
  if (daysCoverCurrent >= coverDays) risk = "low";
  else if (daysCoverCurrent >= input.leadTimeDays) risk = "medium";
  else risk = "high";

  const cost = Math.max(0, input.unitCost);
  return {
    dailyUsage: daily,
    coverDays,
    baseStock,
    safetyBuffer,
    targetPar,
    recommendedOrder,
    daysCoverCurrent,
    daysCoverTarget: cover(targetPar),
    stockAfterOrder,
    daysCoverAfter: cover(stockAfterOrder),
    risk,
    cashLocked: input.currentStock * cost,
    recommendedStockValue: targetPar * cost,
    freedUp: Math.max(0, input.currentStock - targetPar) * cost,
    orderCost: recommendedOrder * cost,
  };
}

/** Totals across a whole par sheet (the cash strip). */
export function sheetTotals(inputs: ParLevelInput[]): {
  cashLocked: number;
  recommendedStockValue: number;
  freedUp: number;
} {
  return inputs.reduce(
    (acc, input) => {
      const r = computePar(input);
      acc.cashLocked += r.cashLocked;
      acc.recommendedStockValue += r.recommendedStockValue;
      acc.freedUp += r.freedUp;
      return acc;
    },
    { cashLocked: 0, recommendedStockValue: 0, freedUp: 0 },
  );
}

/** One decimal for quantities, trimming a trailing .0 → whole number. */
export function fmtQty(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}
