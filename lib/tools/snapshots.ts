/**
 * Generic versioned snapshot helpers for every tool. One row per
 * (lead, tool, period_month); the current month is the editable draft
 * until locked. Used by the diagnostic now and every calculator later.
 */

import { and, desc, eq } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { toolSnapshots, type ToolSnapshot } from "@/lib/db/schema";

export type ToolKey =
  | "diagnostic"
  | "roster"
  | "menu"
  | "supplier"
  | "silent-upsell"
  | "playbooks";

// Playbooks aren't monthly-versioned — one evolving record per lead under
// this sentinel period.
export const PLAYBOOKS_PERIOD = "all";

/** Current period as YYYY-MM in the venue's market timezone (Sydney). */
export function getCurrentPeriodMonth(): string {
  const parts = new Intl.DateTimeFormat("en-AU", {
    timeZone: "Australia/Sydney",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date());
  const y = parts.find((p) => p.type === "year")?.value ?? "1970";
  const m = parts.find((p) => p.type === "month")?.value ?? "01";
  return `${y}-${m}`;
}

/** The snapshot for a specific month, or null. */
export async function getSnapshot(
  leadId: string,
  tool: ToolKey,
  periodMonth: string,
): Promise<ToolSnapshot | null> {
  const rows = await db
    .select()
    .from(toolSnapshots)
    .where(
      and(
        eq(toolSnapshots.leadId, leadId),
        eq(toolSnapshots.tool, tool),
        eq(toolSnapshots.periodMonth, periodMonth),
      ),
    )
    .limit(1);
  return rows[0] ?? null;
}

/** The most recent snapshot for a tool (latest month), or null. */
export async function getLatestSnapshot(
  leadId: string,
  tool: ToolKey,
): Promise<ToolSnapshot | null> {
  const rows = await db
    .select()
    .from(toolSnapshots)
    .where(and(eq(toolSnapshots.leadId, leadId), eq(toolSnapshots.tool, tool)))
    .orderBy(desc(toolSnapshots.periodMonth))
    .limit(1);
  return rows[0] ?? null;
}

/** All snapshots for a tool, newest first (for trend charts / baseline). */
export async function listSnapshots(
  leadId: string,
  tool: ToolKey,
): Promise<ToolSnapshot[]> {
  return db
    .select()
    .from(toolSnapshots)
    .where(and(eq(toolSnapshots.leadId, leadId), eq(toolSnapshots.tool, tool)))
    .orderBy(desc(toolSnapshots.periodMonth));
}

/**
 * Create or update the current-month snapshot for a tool. Upserts on the
 * unique (lead, tool, period_month). The current month stays editable
 * (lockedAt null) — monthly locking is handled by the dashboard later.
 */
export async function upsertSnapshot(args: {
  leadId: string;
  tool: ToolKey;
  periodMonth: string;
  payload: unknown;
  dollarsIdentified?: number | null;
  healthScore?: number | null;
}): Promise<ToolSnapshot> {
  const {
    leadId,
    tool,
    periodMonth,
    payload,
    dollarsIdentified = null,
    healthScore = null,
  } = args;

  const [row] = await db
    .insert(toolSnapshots)
    .values({
      leadId,
      tool,
      periodMonth,
      payload: payload as object,
      dollarsIdentified,
      healthScore,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [
        toolSnapshots.leadId,
        toolSnapshots.tool,
        toolSnapshots.periodMonth,
      ],
      set: {
        payload: payload as object,
        dollarsIdentified,
        healthScore,
        updatedAt: new Date(),
      },
    })
    .returning();

  return row;
}
