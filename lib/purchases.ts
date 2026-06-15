/**
 * Purchase lookups. The source of truth for download entitlement is a
 * `paid` (not `refunded`) row in `purchases` for the lead.
 */

import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { purchases } from "@/lib/db/schema";

/**
 * True when the lead has at least one settled, non-refunded purchase of
 * the toolkit. Drives the post-purchase UI on /training and the /downloads
 * access gate.
 */
export async function hasActivePurchase(leadId: string): Promise<boolean> {
  const rows = await db
    .select({ id: purchases.id })
    .from(purchases)
    .where(and(eq(purchases.leadId, leadId), eq(purchases.status, "paid")))
    .limit(1);
  return rows.length > 0;
}
