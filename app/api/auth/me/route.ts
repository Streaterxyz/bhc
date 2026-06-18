/**
 * GET /api/auth/me
 *
 * Lightweight auth-state probe for the header's account link. Returns
 * `{ authed }` where authed = the visitor has a valid session AND an active
 * (paid, non-refunded) purchase — i.e. a real dashboard to return to.
 *
 * Cost: reads the signed cookie first (no DB). Only when a session is present
 * does it run the indexed purchase lookup — so anonymous marketing traffic
 * incurs zero database cost.
 */

import { NextResponse } from "next/server";

import { readLeadSession } from "@/lib/auth/cookie";
import { hasActivePurchase } from "@/lib/purchases";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await readLeadSession();
  if (!session) {
    return NextResponse.json({ authed: false });
  }
  const authed = await hasActivePurchase(session.leadId);
  return NextResponse.json({ authed });
}
