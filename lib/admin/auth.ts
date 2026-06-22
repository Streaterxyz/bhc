/**
 * Admin authentication — separate from the customer (lead) auth.
 *
 * Access model: an email allowlist (ADMIN_EMAILS) + magic link. An admin
 * proves ownership of an allowlisted inbox by clicking a short-lived signed
 * link; that sets a distinct admin session cookie (`bhc_admin`). The session
 * re-checks the allowlist on every read, so removing someone from
 * ADMIN_EMAILS revokes them immediately.
 *
 * Signed with the same SESSION_SECRET as the customer tokens, but with
 * distinct audiences so an admin token can never be used as a customer
 * session (or vice-versa) and a magic token can never be used as a session.
 */

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ISSUER = "bhc";
const MAGIC_AUDIENCE = "bhc-admin-magic";
const SESSION_AUDIENCE = "bhc-admin-session";
const MAGIC_MAX_AGE = 60 * 30; // 30 minutes
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export const ADMIN_COOKIE = "bhc_admin";

function getSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set.");
  return new TextEncoder().encode(secret);
}

/** Allowlisted admin emails, normalised (lowercased, trimmed). */
export function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminConfigured(): boolean {
  return getAdminEmails().length > 0;
}

export function isAdminEmail(email: string): boolean {
  return getAdminEmails().includes(email.trim().toLowerCase());
}

export type AdminSession = { email: string };

// ─── Magic link (30 min, single-purpose) ────────────────────────────────
export async function signAdminMagicToken(email: string): Promise<string> {
  return new SignJWT({ email: email.toLowerCase() })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer(ISSUER)
    .setAudience(MAGIC_AUDIENCE)
    .setExpirationTime(`${MAGIC_MAX_AGE}s`)
    .sign(getSecret());
}

export async function verifyAdminMagicToken(
  token: string | undefined | null,
): Promise<string | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      issuer: ISSUER,
      audience: MAGIC_AUDIENCE,
    });
    return typeof payload.email === "string" ? payload.email : null;
  } catch {
    return null;
  }
}

// ─── Session cookie (7 days) ─────────────────────────────────────────────
async function signAdminSession(email: string): Promise<string> {
  return new SignJWT({ email: email.toLowerCase() })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer(ISSUER)
    .setAudience(SESSION_AUDIENCE)
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecret());
}

export async function setAdminCookie(email: string): Promise<void> {
  const token = await signAdminSession(email);
  const store = await cookies();
  store.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

/** Read + verify the admin session. Re-checks the allowlist so a revoked
 *  admin loses access on their next request. Returns null if absent/invalid. */
export async function readAdminSession(): Promise<AdminSession | null> {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      issuer: ISSUER,
      audience: SESSION_AUDIENCE,
    });
    const email = payload.email;
    if (typeof email !== "string" || !isAdminEmail(email)) return null;
    return { email };
  } catch {
    return null;
  }
}

export async function clearAdminCookie(): Promise<void> {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
}

/** Server-component guard: returns the admin session or redirects to login. */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await readAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}
