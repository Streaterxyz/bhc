/**
 * Full per-customer picture for the admin detail view (read-only).
 * Aggregates the lead, purchases, venue profile, dashboard $ figures,
 * diagnostic results + health trend, every tool's snapshot history,
 * playbook progress, and training-video engagement.
 */

import "server-only";

import { desc, eq } from "drizzle-orm";

import { db } from "@/lib/db/client";
import {
  purchases,
  venueProfiles,
  videoEvents,
  type Lead,
  type VenueProfile,
} from "@/lib/db/schema";
import { getLeadById } from "@/lib/leads";
import { getDashboardFigures, type DashboardFigures } from "@/lib/tools/dashboard";
import { listSnapshots, PLAYBOOKS_PERIOD } from "@/lib/tools/snapshots";
import type { LeakId, Severity } from "@/lib/tools/diagnostic";
import type { CustomerStatus } from "./segments";

export type LeakSeverity = {
  id: LeakId;
  severity: Severity;
  gapPct: number;
  yesCount: number;
  total: number;
};

export type SnapshotPoint = {
  periodMonth: string;
  dollarsIdentified: number | null;
  healthScore: number | null;
  updatedAtMs: number;
};

export type PurchaseRow = {
  status: string;
  amountCents: number;
  currency: string;
  createdAtMs: number;
  paidAtMs: number | null;
  refundedAtMs: number | null;
};

export type CustomerDetail = {
  lead: Lead;
  status: CustomerStatus;
  purchases: PurchaseRow[];
  venue: VenueProfile | null;
  figures: DashboardFigures;
  diagnostic: {
    latest: {
      periodMonth: string;
      healthScore: number | null;
      results: LeakSeverity[];
    } | null;
    history: { periodMonth: string; healthScore: number | null }[];
  };
  toolHistory: {
    roster: SnapshotPoint[];
    menu: SnapshotPoint[];
    supplier: SnapshotPoint[];
  };
  playbooksImplemented: number;
  video: { milestones: string[]; lastAtMs: number | null };
};

function toPoints(
  snaps: { periodMonth: string; dollarsIdentified: number | null; healthScore: number | null; updatedAt: Date }[],
): SnapshotPoint[] {
  return snaps.map((s) => ({
    periodMonth: s.periodMonth,
    dollarsIdentified: s.dollarsIdentified,
    healthScore: s.healthScore,
    updatedAtMs: s.updatedAt.getTime(),
  }));
}

export async function getCustomerDetail(
  leadId: string,
): Promise<CustomerDetail | null> {
  const lead = await getLeadById(leadId);
  if (!lead) return null;

  const [
    purchaseRows,
    venueRows,
    figures,
    diagnosticSnaps,
    rosterSnaps,
    menuSnaps,
    supplierSnaps,
    playbook,
    videoRows,
  ] = await Promise.all([
    db
      .select()
      .from(purchases)
      .where(eq(purchases.leadId, leadId))
      .orderBy(desc(purchases.createdAt)),
    db
      .select()
      .from(venueProfiles)
      .where(eq(venueProfiles.leadId, leadId))
      .limit(1),
    getDashboardFigures(leadId),
    listSnapshots(leadId, "diagnostic"),
    listSnapshots(leadId, "roster"),
    listSnapshots(leadId, "menu"),
    listSnapshots(leadId, "supplier"),
    listSnapshots(leadId, "playbooks"),
    db.select().from(videoEvents).where(eq(videoEvents.leadId, leadId)),
  ]);

  // Derived purchase status.
  let status: CustomerStatus = "lead";
  for (const p of purchaseRows) {
    if (p.status === "paid") status = "customer";
    else if (p.status === "refunded" && status !== "customer") status = "refunded";
  }

  // Diagnostic: latest results from payload, plus a health trend (oldest→newest).
  const latestDiag = diagnosticSnaps[0] ?? null;
  const latestResults =
    latestDiag &&
    typeof latestDiag.payload === "object" &&
    latestDiag.payload !== null &&
    Array.isArray((latestDiag.payload as { results?: unknown }).results)
      ? ((latestDiag.payload as { results: LeakSeverity[] }).results)
      : [];

  const playbookEntry = playbook.find((s) => s.periodMonth === PLAYBOOKS_PERIOD);
  const implemented =
    playbookEntry &&
    typeof playbookEntry.payload === "object" &&
    playbookEntry.payload !== null &&
    Array.isArray((playbookEntry.payload as { implemented?: unknown }).implemented)
      ? ((playbookEntry.payload as { implemented: unknown[] }).implemented.length)
      : 0;

  const milestones = Array.from(new Set(videoRows.map((v) => v.eventType)));
  const lastVideoMs = videoRows.reduce<number | null>((max, v) => {
    const ms = v.createdAt.getTime();
    return max === null || ms > max ? ms : max;
  }, null);

  return {
    lead,
    status,
    purchases: purchaseRows.map((p) => ({
      status: p.status,
      amountCents: p.amountCents,
      currency: p.currency,
      createdAtMs: p.createdAt.getTime(),
      paidAtMs: p.paidAt?.getTime() ?? null,
      refundedAtMs: p.refundedAt?.getTime() ?? null,
    })),
    venue: venueRows[0] ?? null,
    figures,
    diagnostic: {
      latest: latestDiag
        ? {
            periodMonth: latestDiag.periodMonth,
            healthScore: latestDiag.healthScore,
            results: latestResults,
          }
        : null,
      history: [...diagnosticSnaps]
        .reverse()
        .map((s) => ({ periodMonth: s.periodMonth, healthScore: s.healthScore })),
    },
    toolHistory: {
      roster: toPoints(rosterSnaps),
      menu: toPoints(menuSnaps),
      supplier: toPoints(supplierSnaps),
    },
    playbooksImplemented: implemented,
    video: { milestones, lastAtMs: lastVideoMs },
  };
}
