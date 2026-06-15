/**
 * Lead session JWTs.
 *
 * We don't use a full auth provider (Clerk / Supabase Auth) — the funnel
 * only needs to remember "this browser belongs to lead X" so /training and
 * (later) /downloads can recognise a returning visitor without a password.
 *
 * A signed JWT in an httpOnly cookie is exactly enough: the payload carries
 * the lead id + email, it's tamper-proof (HMAC-signed with SESSION_SECRET),
 * and it expires after 30 days. No server-side session store needed.
 *
 * Uses `jose` because it's Web-Crypto based and runs in both the Node and
 * Edge runtimes — important since middleware / route handlers may run on
 * either.
 */

import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const ISSUER = "bhc";
const AUDIENCE = "bhc-lead";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

export type LeadSession = {
  leadId: string;
  email: string;
};

function getSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "SESSION_SECRET is not set. Add it to .env.local (and Vercel env).",
    );
  }
  return new TextEncoder().encode(secret);
}

/** Sign a lead session into a compact JWT string. */
export async function signLeadSession(session: LeadSession): Promise<string> {
  return new SignJWT({ leadId: session.leadId, email: session.email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(getSecret());
}

/**
 * Verify + decode a lead session JWT. Returns null on any failure
 * (expired, tampered, wrong issuer/audience) so callers can treat
 * "no valid session" uniformly.
 */
export async function verifyLeadSession(
  token: string | undefined | null,
): Promise<LeadSession | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    return extractSession(payload);
  } catch {
    return null;
  }
}

function extractSession(payload: JWTPayload): LeadSession | null {
  const leadId = payload.leadId;
  const email = payload.email;
  if (typeof leadId !== "string" || typeof email !== "string") return null;
  return { leadId, email };
}

export const SESSION_MAX_AGE_SECONDS = MAX_AGE_SECONDS;
