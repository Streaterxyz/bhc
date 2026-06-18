/**
 * AI usage tracking for soft per-customer rate limits (cost protection).
 * Uses a rolling 24h window rather than a calendar day — simpler, no
 * timezone math, and a slightly stricter abuse guard.
 */

import "server-only";

import { and, eq, gte } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { aiUsage } from "@/lib/db/schema";

/** Count a lead's uses of a feature in the last `hours` (default 24). */
export async function countRecentUsage(
  leadId: string,
  feature: string,
  hours = 24,
): Promise<number> {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);
  const rows = await db
    .select({ id: aiUsage.id })
    .from(aiUsage)
    .where(
      and(
        eq(aiUsage.leadId, leadId),
        eq(aiUsage.feature, feature),
        gte(aiUsage.createdAt, since),
      ),
    );
  return rows.length;
}

/** Log one use of a feature. */
export async function recordUsage(
  leadId: string,
  feature: string,
): Promise<void> {
  await db.insert(aiUsage).values({ leadId, feature });
}
