/**
 * GET /api/auth/verify?token=…&to=/downloads
 *
 * Consumes a magic-link token: verifies it, confirms the lead still exists,
 * sets the lead session cookie, and redirects to the (same-site) destination.
 * Invalid/expired tokens redirect to /access with an error flag.
 */

import { NextResponse, type NextRequest } from "next/server";

import { verifyMagicToken } from "@/lib/auth/magic";
import { getLeadById } from "@/lib/leads";
import { setLeadCookie } from "@/lib/auth/cookie";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const toParam = req.nextUrl.searchParams.get("to");
  // Only honour same-site relative destinations.
  const dest = toParam && toParam.startsWith("/") ? toParam : "/app";

  const payload = await verifyMagicToken(token);
  if (!payload) {
    return NextResponse.redirect(new URL("/access?error=expired", req.url));
  }

  const lead = await getLeadById(payload.leadId);
  if (!lead) {
    return NextResponse.redirect(new URL("/access?error=expired", req.url));
  }

  // Establish the session, then redirect into the app.
  await setLeadCookie({ leadId: lead.id, email: lead.email });
  return NextResponse.redirect(new URL(dest, req.url));
}
