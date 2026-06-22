/**
 * Lead persistence helpers — the write path behind POST /api/leads.
 *
 * Upsert-on-email semantics: a returning visitor who submits the same
 * email twice updates their existing row (refreshing updated_at + any
 * newly-supplied name) rather than erroring on the unique constraint or
 * creating a duplicate. This keeps one row per human.
 */

import { eq, sql } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { leads, type Lead } from "@/lib/db/schema";

export type LeadInput = {
  email: string;
  name?: string | null;
  source?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmContent?: string | null;
  utmTerm?: string | null;
  referrer?: string | null;
  landingPage?: string | null;
  ipCountry?: string | null;
};

/** Basic RFC-5322-ish email shape check. Not exhaustive — the real
 *  validation is "can we deliver to it", which only sending proves. */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Normalise an email for storage + dedupe: trim + lowercase. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Insert a new lead or update the existing one matching the email.
 * Returns the persisted row (always includes the id).
 *
 * Only overwrites name when a non-empty value is supplied — we never
 * blank out a name the lead previously gave just because a later form
 * omitted it. Attribution fields are set on first insert and left as-is
 * on conflict (first-touch attribution).
 */
export async function upsertLead(input: LeadInput): Promise<Lead> {
  const email = normalizeEmail(input.email);

  const [row] = await db
    .insert(leads)
    .values({
      email,
      name: input.name ?? null,
      source: input.source ?? null,
      utmSource: input.utmSource ?? null,
      utmMedium: input.utmMedium ?? null,
      utmCampaign: input.utmCampaign ?? null,
      utmContent: input.utmContent ?? null,
      utmTerm: input.utmTerm ?? null,
      referrer: input.referrer ?? null,
      landingPage: input.landingPage ?? null,
      ipCountry: input.ipCountry ?? null,
    })
    .onConflictDoUpdate({
      target: leads.email,
      set: {
        updatedAt: new Date(),
        // COALESCE keeps the existing name if the new one is null/empty.
        name: sql`COALESCE(NULLIF(EXCLUDED.name, ''), ${leads.name})`,
      },
    })
    .returning();

  return row;
}

/** Fetch a lead by id. Returns null if not found. */
export async function getLeadById(id: string): Promise<Lead | null> {
  const [row] = await db.select().from(leads).where(eq(leads.id, id)).limit(1);
  return row ?? null;
}

/** Look up a lead by (normalised) email. Used by the magic-link request. */
export async function getLeadByEmail(email: string): Promise<Lead | null> {
  const [row] = await db
    .select()
    .from(leads)
    .where(eq(leads.email, normalizeEmail(email)))
    .limit(1);
  return row ?? null;
}

/**
 * Flip a lead's lifecycle status by email (active | unsubscribed | bounced).
 * Used by the Resend webhook: hard bounces → "bounced", spam complaints →
 * "unsubscribed". No-op if the email isn't a known lead. Returns the number
 * of rows updated.
 */
export async function setLeadStatusByEmail(
  email: string,
  status: "active" | "unsubscribed" | "bounced",
): Promise<number> {
  const result = await db
    .update(leads)
    .set({ status })
    .where(eq(leads.email, normalizeEmail(email)));
  return result.rowCount ?? 0;
}
