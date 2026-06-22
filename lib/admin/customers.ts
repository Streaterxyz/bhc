/**
 * Admin customer aggregation — batch-loads every lead and derives the
 * support-relevant picture (purchase status, onboarding, tool usage, health
 * score, $ identified, last activity) with a fixed number of queries
 * (4 total), reducing in memory. Fine for the current scale; paginate /
 * push more into SQL if the list grows into the thousands.
 */

import "server-only";

import { desc } from "drizzle-orm";

import { db } from "@/lib/db/client";
import {
  leads,
  purchases,
  venueProfiles,
  toolSnapshots,
} from "@/lib/db/schema";
import type { CustomerRow, CustomerStatus, EmailStatus } from "./segments";

// $-producing tools (match lib/tools/dashboard.ts); supplier is health-only.
const DOLLAR_TOOLS = new Set(["roster", "menu"]);
const CALCULATOR_TOOLS = new Set(["roster", "menu", "supplier"]);

export async function listCustomers(): Promise<CustomerRow[]> {
  const [allLeads, allPurchases, allProfiles, allSnaps] = await Promise.all([
    db.select().from(leads),
    db.select().from(purchases),
    db.select().from(venueProfiles),
    // Latest period first → first row seen per (lead, tool) is the latest.
    db.select().from(toolSnapshots).orderBy(desc(toolSnapshots.periodMonth)),
  ]);

  // Purchase status + last purchase activity per lead.
  const purchaseStatus = new Map<string, CustomerStatus>();
  const purchaseMs = new Map<string, number>();
  for (const p of allPurchases) {
    const cur = purchaseStatus.get(p.leadId);
    if (p.status === "paid") {
      purchaseStatus.set(p.leadId, "customer");
    } else if (p.status === "refunded" && cur !== "customer") {
      purchaseStatus.set(p.leadId, "refunded");
    }
    const ts = (p.paidAt ?? p.refundedAt ?? p.createdAt)?.getTime() ?? 0;
    if (ts > (purchaseMs.get(p.leadId) ?? 0)) purchaseMs.set(p.leadId, ts);
  }

  // Onboarding (venue profile) per lead → updatedAt ms.
  const onboardedMs = new Map<string, number>();
  for (const v of allProfiles) onboardedMs.set(v.leadId, v.updatedAt.getTime());

  // Tool-snapshot aggregation per lead.
  type Agg = {
    hasDiagnostic: boolean;
    hasCalculator: boolean;
    healthScore: number | null;
    dollarByTool: Map<string, number>;
    lastMs: number;
  };
  const agg = new Map<string, Agg>();
  for (const s of allSnaps) {
    let a = agg.get(s.leadId);
    if (!a) {
      a = {
        hasDiagnostic: false,
        hasCalculator: false,
        healthScore: null,
        dollarByTool: new Map(),
        lastMs: 0,
      };
      agg.set(s.leadId, a);
    }
    if (s.tool === "diagnostic") {
      a.hasDiagnostic = true;
      // First diagnostic seen = latest period → its health score.
      if (a.healthScore === null && s.healthScore != null) {
        a.healthScore = s.healthScore;
      }
    }
    if (CALCULATOR_TOOLS.has(s.tool)) a.hasCalculator = true;
    if (DOLLAR_TOOLS.has(s.tool) && !a.dollarByTool.has(s.tool)) {
      a.dollarByTool.set(s.tool, Math.max(0, s.dollarsIdentified ?? 0));
    }
    const ms = s.updatedAt.getTime();
    if (ms > a.lastMs) a.lastMs = ms;
  }

  const rows: CustomerRow[] = allLeads.map((l) => {
    const a = agg.get(l.id);
    const createdAtMs = l.createdAt.getTime();
    const dollarsIdentified =
      a && a.dollarByTool.size > 0
        ? Array.from(a.dollarByTool.values()).reduce((sum, v) => sum + v, 0)
        : null;
    const lastActivityMs = Math.max(
      createdAtMs,
      purchaseMs.get(l.id) ?? 0,
      onboardedMs.get(l.id) ?? 0,
      a?.lastMs ?? 0,
    );
    return {
      leadId: l.id,
      email: l.email,
      name: l.name ?? null,
      status: purchaseStatus.get(l.id) ?? "lead",
      emailStatus: (l.status as EmailStatus) ?? "active",
      onboarded: onboardedMs.has(l.id),
      hasDiagnostic: a?.hasDiagnostic ?? false,
      hasCalculator: a?.hasCalculator ?? false,
      healthScore: a?.healthScore ?? null,
      dollarsIdentified,
      needsAttention: l.needsAttention,
      source: l.source ?? null,
      createdAtMs,
      lastActivityMs,
    };
  });

  rows.sort((x, y) => y.lastActivityMs - x.lastActivityMs);
  return rows;
}
