/**
 * Admin annotations — support notes + the manual "needs attention" flag.
 * These are admin-owned metadata; customer data stays read-only.
 */

import "server-only";

import { desc, eq } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { adminNotes, leads, type AdminNote } from "@/lib/db/schema";

export async function listNotes(leadId: string): Promise<AdminNote[]> {
  return db
    .select()
    .from(adminNotes)
    .where(eq(adminNotes.leadId, leadId))
    .orderBy(desc(adminNotes.createdAt));
}

export async function addNote(
  leadId: string,
  authorEmail: string,
  body: string,
): Promise<AdminNote> {
  const [row] = await db
    .insert(adminNotes)
    .values({ leadId, authorEmail, body })
    .returning();
  return row;
}

/** Toggle the manual attention flag, stamping who/when for a light audit. */
export async function setNeedsAttention(
  leadId: string,
  on: boolean,
  adminEmail: string,
): Promise<void> {
  await db
    .update(leads)
    .set({
      needsAttention: on,
      flaggedBy: on ? adminEmail : null,
      flaggedAt: on ? new Date() : null,
    })
    .where(eq(leads.id, leadId));
}
