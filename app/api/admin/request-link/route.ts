/**
 * POST /api/admin/request-link
 *
 * Emails a magic sign-in link IF the submitted email is on the admin
 * allowlist. The response is identical whether or not the email is an admin
 * (no user enumeration) — we never reveal who has admin access.
 */

import { NextResponse } from "next/server";

import {
  isAdminEmail,
  signAdminMagicToken,
} from "@/lib/admin/auth";
import { sendEmail } from "@/lib/email/resend";
import { adminMagicLinkEmail } from "@/lib/email/templates";

export const runtime = "nodejs";

function siteOrigin(req: Request): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL;
  if (env) return env.replace(/\/$/, "");
  const url = new URL(req.url);
  return `${url.protocol}//${url.host}`;
}

export async function POST(req: Request) {
  let email: string | null = null;
  try {
    const body = (await req.json()) as { email?: unknown };
    if (typeof body.email === "string") email = body.email.trim().toLowerCase();
  } catch {
    /* fall through to generic response */
  }

  // Only send for allowlisted admins — but always return the same generic
  // result so the endpoint can't be used to discover who's an admin.
  if (email && isAdminEmail(email)) {
    try {
      const token = await signAdminMagicToken(email);
      const link = `${siteOrigin(req)}/api/admin/verify?token=${encodeURIComponent(token)}`;
      const { subject, html } = adminMagicLinkEmail(link);
      await sendEmail({ to: email, subject, html });
    } catch (err) {
      console.error("[/api/admin/request-link] failed:", err);
      // Still return generic success — don't leak failure either.
    }
  }

  return NextResponse.json({
    ok: true,
    message: "If that's an admin email, a sign-in link is on its way.",
  });
}
