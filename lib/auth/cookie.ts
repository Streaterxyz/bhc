/**
 * Read/write the lead session cookie.
 *
 * Kept separate from session.ts (the JWT logic) so the JWT helpers stay
 * runtime-agnostic and unit-testable, while these helpers touch the
 * Next.js cookies() API specifically.
 */

import { cookies } from "next/headers";

import {
  signLeadSession,
  verifyLeadSession,
  SESSION_MAX_AGE_SECONDS,
  type LeadSession,
} from "./session";

export const LEAD_COOKIE = "bhc_lead";

/**
 * Sign `session` and write it as an httpOnly cookie. Call from a route
 * handler or server action (anywhere cookies() is writable).
 */
export async function setLeadCookie(session: LeadSession): Promise<void> {
  const token = await signLeadSession(session);
  const store = await cookies();
  store.set(LEAD_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

/**
 * Read + verify the current lead session from cookies. Returns null if
 * absent or invalid. Safe to call from server components.
 */
export async function readLeadSession(): Promise<LeadSession | null> {
  const store = await cookies();
  const token = store.get(LEAD_COOKIE)?.value;
  return verifyLeadSession(token);
}

/** Clear the lead cookie (logout). */
export async function clearLeadCookie(): Promise<void> {
  const store = await cookies();
  store.delete(LEAD_COOKIE);
}
