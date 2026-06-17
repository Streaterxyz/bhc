/**
 * Magic-link tokens.
 *
 * Single-purpose, short-lived JWTs emailed to a lead so they can re-establish
 * their session on a new device / after the cookie expires — the access
 * mechanism for downloads today and the interactive tools next.
 *
 * Signed with the same SESSION_SECRET as the session cookie but a DISTINCT
 * audience ("bhc-magic"), so a magic token can never be used as a session
 * cookie or vice-versa. Short expiry (30 min) limits the blast radius if a
 * link leaks.
 */

import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const ISSUER = "bhc";
const AUDIENCE = "bhc-magic";
const MAX_AGE_SECONDS = 60 * 30; // 30 minutes

export type MagicPayload = {
  leadId: string;
  email: string;
};

function getSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is not set.");
  }
  return new TextEncoder().encode(secret);
}

export async function signMagicToken(payload: MagicPayload): Promise<string> {
  return new SignJWT({ leadId: payload.leadId, email: payload.email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(getSecret());
}

export async function verifyMagicToken(
  token: string | undefined | null,
): Promise<MagicPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    return extract(payload);
  } catch {
    return null;
  }
}

function extract(payload: JWTPayload): MagicPayload | null {
  const leadId = payload.leadId;
  const email = payload.email;
  if (typeof leadId !== "string" || typeof email !== "string") return null;
  return { leadId, email };
}
