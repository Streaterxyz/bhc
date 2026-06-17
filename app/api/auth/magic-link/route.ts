/**
 * POST /api/auth/magic-link  { email }
 *
 * Emails a short-lived magic link so a returning lead can re-establish their
 * session (new device / expired cookie) — the access path to downloads now
 * and the interactive tools next.
 *
 * Privacy: ALWAYS returns 200 "check your email" regardless of whether the
 * email maps to a lead — never reveals which addresses exist. The email only
 * actually sends when a matching lead is found.
 */

import { NextResponse } from "next/server";

import { isValidEmail, normalizeEmail, getLeadByEmail } from "@/lib/leads";
import { signMagicToken } from "@/lib/auth/magic";
import { sendEmail, isEmailConfigured } from "@/lib/email/resend";
import { magicLinkEmail } from "@/lib/email/templates";

export const runtime = "nodejs";

function siteOrigin(req: Request): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL;
  if (env) return env.replace(/\/$/, "");
  const url = new URL(req.url);
  return `${url.protocol}//${url.host}`;
}

export async function POST(req: Request) {
  let body: { email?: unknown; redirectTo?: unknown };
  try {
    body = (await req.json()) as { email?: unknown; redirectTo?: unknown };
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const rawEmail = typeof body.email === "string" ? body.email.trim() : "";
  if (!rawEmail || !isValidEmail(rawEmail)) {
    return NextResponse.json(
      { ok: false, error: "Please enter a valid email address." },
      { status: 422 },
    );
  }

  // Only allow same-site relative redirect targets.
  const redirectTo =
    typeof body.redirectTo === "string" && body.redirectTo.startsWith("/")
      ? body.redirectTo
      : "/downloads";

  const email = normalizeEmail(rawEmail);

  // Look up the lead; if found, send the link. Either way, respond identically.
  try {
    const lead = await getLeadByEmail(email);
    if (lead && isEmailConfigured()) {
      const token = await signMagicToken({ leadId: lead.id, email: lead.email });
      const link = `${siteOrigin(req)}/api/auth/verify?token=${encodeURIComponent(
        token,
      )}&to=${encodeURIComponent(redirectTo)}`;
      const { subject, html } = magicLinkEmail(link);
      await sendEmail({ to: lead.email, subject, html });
    }
  } catch (err) {
    console.error("[/api/auth/magic-link] failed:", err);
    // Still return the neutral success below — don't leak failures either.
  }

  return NextResponse.json({
    ok: true,
    message: "If that email is on file, an access link is on its way.",
  });
}
