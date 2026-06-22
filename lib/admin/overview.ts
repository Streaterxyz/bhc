/**
 * Admin overview metrics — aggregate funnel + commercial + product health,
 * computed from a fixed set of batch queries reduced in memory.
 *
 * Metrics (in the order the dashboard renders them): funnel conversion,
 * onboard completion, revenue over time, aggregate $ identified/recovered,
 * health-score distribution, refunds, cohort retention.
 */

import "server-only";

import { db } from "@/lib/db/client";
import {
  leads,
  purchases,
  venueProfiles,
  toolSnapshots,
  videoEvents,
} from "@/lib/db/schema";

export type FunnelStage = { label: string; count: number };
export type MonthPoint = { month: string; value: number };
export type HealthBucket = { label: string; count: number };
export type Cohort = {
  month: string;
  leads: number;
  customers: number;
  onboarded: number;
  ranTool: number;
};

export type Overview = {
  totals: {
    leads: number;
    customers: number;
    onboarded: number;
    revenueCents: number; // net currently held (paid only)
    refunds: number;
    refundedCents: number;
    refundRatePct: number;
    identified: number;
    recovered: number;
  };
  funnel: FunnelStage[];
  onboardCompletionPct: number;
  revenueByMonth: MonthPoint[];
  healthDistribution: HealthBucket[];
  cohorts: Cohort[];
};

/** YYYY-MM in the venue market timezone (matches tool period months). */
function monthOf(d: Date): string {
  const parts = new Intl.DateTimeFormat("en-AU", {
    timeZone: "Australia/Sydney",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(d);
  const y = parts.find((p) => p.type === "year")?.value ?? "1970";
  const m = parts.find((p) => p.type === "month")?.value ?? "01";
  return `${y}-${m}`;
}

const HEALTH_BUCKETS = [
  { label: "0–20", min: 0, max: 20 },
  { label: "21–40", min: 21, max: 40 },
  { label: "41–60", min: 41, max: 60 },
  { label: "61–80", min: 61, max: 80 },
  { label: "81–100", min: 81, max: 100 },
];

export async function getOverview(): Promise<Overview> {
  const [allLeads, allPurchases, allProfiles, allSnaps, allVideo] =
    await Promise.all([
      db.select().from(leads),
      db.select().from(purchases),
      db.select().from(venueProfiles),
      db.select().from(toolSnapshots),
      db.select().from(videoEvents),
    ]);

  // Onboarding set.
  const onboardedSet = new Set(allProfiles.map((v) => v.leadId));

  // Purchases → customers, revenue, refunds.
  const customers = new Set<string>();
  let revenueCents = 0;
  let refundedCents = 0;
  let refunds = 0;
  const revByMonth = new Map<string, number>();
  for (const p of allPurchases) {
    if (p.status === "paid") {
      customers.add(p.leadId);
      revenueCents += p.amountCents;
      const m = monthOf(p.paidAt ?? p.createdAt);
      revByMonth.set(m, (revByMonth.get(m) ?? 0) + p.amountCents);
    } else if (p.status === "refunded") {
      refunds += 1;
      refundedCents += p.amountCents;
    }
  }
  const refundRatePct =
    customers.size + refunds > 0
      ? Math.round((refunds / (customers.size + refunds)) * 100)
      : 0;

  // Video → watched / completed (distinct leads).
  const watched = new Set<string>();
  const completed = new Set<string>();
  for (const v of allVideo) {
    if (v.eventType === "play") watched.add(v.leadId);
    if (v.eventType === "complete") completed.add(v.leadId);
  }

  // Tool snapshots → diagnostic/calculator usage, latest health, $ agg.
  const hasDiagnostic = new Set<string>();
  const hasCalculator = new Set<string>();
  const latestHealth = new Map<string, number>(); // leadId → latest diagnostic
  const latestHealthMonth = new Map<string, string>();
  // per (lead|tool) latest + baseline dollarsIdentified
  const dollar = new Map<
    string,
    { latest: number; latestM: string; baseline: number; baselineM: string }
  >();

  for (const s of allSnaps) {
    if (s.tool === "diagnostic") {
      hasDiagnostic.add(s.leadId);
      const prevM = latestHealthMonth.get(s.leadId);
      if ((!prevM || s.periodMonth > prevM) && s.healthScore != null) {
        latestHealth.set(s.leadId, s.healthScore);
        latestHealthMonth.set(s.leadId, s.periodMonth);
      }
    }
    if (s.tool === "roster" || s.tool === "menu" || s.tool === "supplier") {
      hasCalculator.add(s.leadId);
    }
    if (s.tool === "roster" || s.tool === "menu") {
      const k = `${s.leadId}|${s.tool}`;
      const v = s.dollarsIdentified ?? 0;
      const e = dollar.get(k);
      if (!e) {
        dollar.set(k, {
          latest: v,
          latestM: s.periodMonth,
          baseline: v,
          baselineM: s.periodMonth,
        });
      } else {
        if (s.periodMonth > e.latestM) {
          e.latest = v;
          e.latestM = s.periodMonth;
        }
        if (s.periodMonth < e.baselineM) {
          e.baseline = v;
          e.baselineM = s.periodMonth;
        }
      }
    }
  }

  let identified = 0;
  let recovered = 0;
  for (const e of dollar.values()) {
    identified += Math.max(0, e.latest);
    recovered += Math.max(0, e.baseline - e.latest);
  }

  // Health distribution over latest diagnostics.
  const healthValues = Array.from(latestHealth.values());
  const healthDistribution: HealthBucket[] = HEALTH_BUCKETS.map((b) => ({
    label: b.label,
    count: healthValues.filter((h) => h >= b.min && h <= b.max).length,
  }));

  // Cohorts by signup month.
  const cohortMap = new Map<string, Cohort>();
  for (const l of allLeads) {
    const m = monthOf(l.createdAt);
    const c =
      cohortMap.get(m) ??
      { month: m, leads: 0, customers: 0, onboarded: 0, ranTool: 0 };
    c.leads += 1;
    if (customers.has(l.id)) c.customers += 1;
    if (onboardedSet.has(l.id)) c.onboarded += 1;
    if (hasCalculator.has(l.id)) c.ranTool += 1;
    cohortMap.set(m, c);
  }
  const cohorts = Array.from(cohortMap.values()).sort((a, b) =>
    a.month < b.month ? 1 : -1,
  );

  const revenueByMonth: MonthPoint[] = Array.from(revByMonth.entries())
    .map(([month, value]) => ({ month, value }))
    .sort((a, b) => (a.month < b.month ? -1 : 1));

  return {
    totals: {
      leads: allLeads.length,
      customers: customers.size,
      onboarded: onboardedSet.size,
      revenueCents,
      refunds,
      refundedCents,
      refundRatePct,
      identified,
      recovered,
    },
    funnel: [
      { label: "Leads", count: allLeads.length },
      { label: "Watched training", count: watched.size },
      { label: "Completed training", count: completed.size },
      { label: "Purchased", count: customers.size },
      { label: "Onboarded", count: onboardedSet.size },
      { label: "Ran diagnostic", count: hasDiagnostic.size },
      { label: "Used a tool", count: hasCalculator.size },
    ],
    onboardCompletionPct:
      customers.size > 0
        ? Math.round((onboardedSet.size / customers.size) * 100)
        : 0,
    revenueByMonth,
    healthDistribution,
    cohorts,
  };
}
