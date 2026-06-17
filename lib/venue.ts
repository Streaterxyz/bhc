/**
 * Venue profile lookups + upsert. One venue per customer (single-venue v1),
 * keyed to the lead. Captured at onboarding, then used to pre-fill and
 * personalise every tool.
 */

import { eq } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { venueProfiles, type VenueProfile } from "@/lib/db/schema";

export const VENUE_TYPES = [
  "restaurant",
  "bar",
  "cafe",
  "pub",
  "hotel",
] as const;
export type VenueType = (typeof VENUE_TYPES)[number];

export type VenueInput = {
  name: string;
  type: VenueType;
  seatsCapacity?: number | null;
  avgSpendPerHead?: number | null;
  targetLabourPct?: number | null;
  tradingDays?: number | null;
};

export async function getVenueProfile(
  leadId: string,
): Promise<VenueProfile | null> {
  const rows = await db
    .select()
    .from(venueProfiles)
    .where(eq(venueProfiles.leadId, leadId))
    .limit(1);
  return rows[0] ?? null;
}

/**
 * Create or update the lead's single venue profile. Upserts on the unique
 * lead_id so onboarding and later edits both flow through here.
 */
export async function upsertVenueProfile(
  leadId: string,
  input: VenueInput,
): Promise<VenueProfile> {
  const values = {
    leadId,
    name: input.name,
    type: input.type,
    seatsCapacity: input.seatsCapacity ?? null,
    avgSpendPerHead: input.avgSpendPerHead ?? null,
    targetLabourPct: input.targetLabourPct ?? 28,
    tradingDays: input.tradingDays ?? 7,
    updatedAt: new Date(),
  };

  const [row] = await db
    .insert(venueProfiles)
    .values(values)
    .onConflictDoUpdate({
      target: venueProfiles.leadId,
      set: {
        name: values.name,
        type: values.type,
        seatsCapacity: values.seatsCapacity,
        avgSpendPerHead: values.avgSpendPerHead,
        targetLabourPct: values.targetLabourPct,
        tradingDays: values.tradingDays,
        updatedAt: values.updatedAt,
      },
    })
    .returning();

  return row;
}
