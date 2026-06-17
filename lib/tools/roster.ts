/**
 * Roster Waste Cheat Sheet — computation.
 *
 * Source: Tool 2 (Assets workbook). Per trading day the operator enters
 * Pax, spend-per-head, labour cost and hours; we compute revenue, average
 * hourly rate, labour %, the budgeted labour at the venue's target %, and
 * the $ labour waste (actual − budget). The annualised net weekly waste is
 * the leak figure that feeds the dashboard's $ Identified / $ Recovered.
 *
 * Pure functions — shared between the client (live recompute) and the
 * server (authoritative $ on save).
 */

export const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export type DayInput = {
  pax: number;
  sph: number;
  labourCost: number;
  hours: number;
};

export type DayComputed = DayInput & {
  revenue: number;
  ahr: number; // average hourly rate
  labourPct: number;
  budget: number; // budgeted labour $ at target %
  waste: number; // labourCost − budget (positive = overspend)
};

export type RosterTotals = {
  totalRevenue: number;
  totalLabour: number;
  totalHours: number;
  avgLabourPct: number;
  totalBudget: number;
  weeklyWaste: number; // net (over − under) across the week
  annualWaste: number; // weeklyWaste × 52, rounded
};

export function computeDay(d: DayInput, targetPct: number): DayComputed {
  const revenue = d.pax * d.sph;
  const ahr = d.hours > 0 ? d.labourCost / d.hours : 0;
  const labourPct = revenue > 0 ? (d.labourCost / revenue) * 100 : 0;
  const budget = revenue * (targetPct / 100);
  const waste = d.labourCost - budget;
  return { ...d, revenue, ahr, labourPct, budget, waste };
}

export function computeRoster(
  days: DayInput[],
  targetPct: number,
): { rows: DayComputed[]; totals: RosterTotals } {
  const rows = days.map((d) => computeDay(d, targetPct));
  const totalRevenue = rows.reduce((s, r) => s + r.revenue, 0);
  const totalLabour = rows.reduce((s, r) => s + r.labourCost, 0);
  const totalHours = rows.reduce((s, r) => s + r.hours, 0);
  const totalBudget = rows.reduce((s, r) => s + r.budget, 0);
  const weeklyWaste = totalLabour - totalBudget;
  return {
    rows,
    totals: {
      totalRevenue,
      totalLabour,
      totalHours,
      avgLabourPct: totalRevenue > 0 ? (totalLabour / totalRevenue) * 100 : 0,
      totalBudget,
      weeklyWaste,
      annualWaste: Math.round(weeklyWaste * 52),
    },
  };
}

/** Seven empty trading days, seeded with the venue's spend-per-head. */
export function emptyDays(sphDefault: number): DayInput[] {
  return DAYS.map(() => ({
    pax: 0,
    sph: sphDefault || 0,
    labourCost: 0,
    hours: 0,
  }));
}

/** Whole-dollar money format, e.g. $12,480. Negative shown as −$1,200. */
export function formatMoney(n: number): string {
  const rounded = Math.round(n);
  const sign = rounded < 0 ? "−" : "";
  return `${sign}$${Math.abs(rounded).toLocaleString("en-AU")}`;
}
