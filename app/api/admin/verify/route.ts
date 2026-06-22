/**
 * GET /api/admin/verify?token=…
 *
 * Consumes an admin magic-link token: verifies it, re-checks the allowlist,
 * sets the admin session cookie, and redirects into the portal. Any failure
 * redirects back to the login page with a generic error.
 */

import { NextResponse } from "next/server";

import {
  verifyAdminMagicToken,
  isAdminEmail,
  setAdminCookie,
} from "@/lib/admin/auth";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token");

  const email = await verifyAdminMagicToken(token);
  if (!email || !isAdminEmail(email)) {
    // Same-origin redirect — go back to wherever the request came in on.
    return NextResponse.redirect(new URL("/admin/login?error=invalid", req.url));
  }

  await setAdminCookie(email);
  return NextResponse.redirect(new URL("/admin", req.url));
}
