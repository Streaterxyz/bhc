/**
 * POST /api/webhooks/resend
 *
 * Keeps the lead list clean by reacting to delivery failures:
 *   email.bounced    → status "bounced"      (hard-undeliverable)
 *   email.complained → status "unsubscribed" (marked us as spam)
 *
 * Both stop marketing being sent to that address and flag it in the DB.
 *
 * Security: Resend signs webhooks with Svix. We verify the signature
 * manually (HMAC-SHA256) against RESEND_WEBHOOK_SECRET — no svix dep. When
 * the secret isn't configured we skip verification (so it works before
 * setup) but log a warning; set the secret in prod.
 *
 * Needs the raw body for signature verification, so we read req.text().
 */

import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";

import { setLeadStatusByEmail } from "@/lib/leads";

export const runtime = "nodejs";

/** Verify a Svix-signed payload. Returns true when valid (or when no secret
 *  is configured — caller logs that case). */
function verifySignature(
  rawBody: string,
  headers: Headers,
  secret: string | undefined,
): boolean {
  if (!secret) return true; // unconfigured → skip (logged by caller)

  const id = headers.get("svix-id");
  const timestamp = headers.get("svix-timestamp");
  const signatureHeader = headers.get("svix-signature");
  if (!id || !timestamp || !signatureHeader) return false;

  // Secret is "whsec_<base64>"; the HMAC key is the decoded base64 part.
  const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const signedContent = `${id}.${timestamp}.${rawBody}`;
  const expected = createHmac("sha256", key)
    .update(signedContent)
    .digest("base64");

  // Header is a space-separated list of "v1,<sig>" — accept any match.
  for (const part of signatureHeader.split(" ")) {
    const sig = part.split(",")[1];
    if (!sig) continue;
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length === b.length && timingSafeEqual(a, b)) return true;
  }
  return false;
}

type ResendEvent = {
  type?: string;
  data?: { to?: string | string[] };
};

function recipients(data: ResendEvent["data"]): string[] {
  if (!data?.to) return [];
  return Array.isArray(data.to) ? data.to : [data.to];
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const secret = process.env.RESEND_WEBHOOK_SECRET;

  if (!secret) {
    console.warn(
      "[resend webhook] RESEND_WEBHOOK_SECRET not set — processing without signature verification.",
    );
  }

  if (!verifySignature(rawBody, req.headers, secret)) {
    return NextResponse.json(
      { ok: false, error: "Invalid signature." },
      { status: 400 },
    );
  }

  let event: ResendEvent;
  try {
    event = JSON.parse(rawBody) as ResendEvent;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON." },
      { status: 400 },
    );
  }

  try {
    const status =
      event.type === "email.bounced"
        ? "bounced"
        : event.type === "email.complained"
          ? "unsubscribed"
          : null;

    if (status) {
      for (const email of recipients(event.data)) {
        await setLeadStatusByEmail(email, status);
      }
    }
    // Acknowledge everything (including unhandled types) so Resend stops
    // retrying.
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error(`[resend webhook] handler error for ${event.type}:`, err);
    return NextResponse.json(
      { ok: false, error: "Handler error." },
      { status: 500 },
    );
  }
}
