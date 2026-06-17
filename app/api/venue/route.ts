/**
 * POST /api/venue
 *
 * Create/update the authenticated customer's venue profile (onboarding +
 * later edits). Double-gated: must be an identified lead (magic-link
 * session) AND hold an active paid purchase — the tools are post-purchase
 * only. The venue is always tied to the lead from the verified session.
 */

import { NextResponse } from "next/server";

import { readLeadSession } from "@/lib/auth/cookie";
import { hasActivePurchase } from "@/lib/purchases";
import { upsertVenueProfile, VENUE_TYPES, type VenueType } from "@/lib/venue";

export const runtime = "nodejs";

type Body = {
  name?: unknown;
  type?: unknown;
  seatsCapacity?: unknown;
  avgSpendPerHead?: unknown;
  targetLabourPct?: unknown;
  tradingDays?: unknown;
};

function asInt(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return Math.round(v);
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    if (Number.isFinite(n)) return Math.round(n);
  }
  return null;
}

export async function POST(req: Request) {
  const session = await readLeadSession();
  if (!session) {
    return NextResponse.json(
      { ok: false, error: "Please sign in to continue." },
      { status: 401 },
    );
  }
  if (!(await hasActivePurchase(session.leadId))) {
    return NextResponse.json(
      { ok: false, error: "The tools require an active purchase." },
      { status: 403 },
    );
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request." },
      { status: 400 },
    );
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const type = typeof body.type === "string" ? body.type : "";

  if (!name) {
    return NextResponse.json(
      { ok: false, error: "Venue name is required." },
      { status: 422 },
    );
  }
  if (!VENUE_TYPES.includes(type as VenueType)) {
    return NextResponse.json(
      { ok: false, error: "Please choose a valid venue type." },
      { status: 422 },
    );
  }

  try {
    const profile = await upsertVenueProfile(session.leadId, {
      name,
      type: type as VenueType,
      seatsCapacity: asInt(body.seatsCapacity),
      avgSpendPerHead: asInt(body.avgSpendPerHead),
      targetLabourPct: asInt(body.targetLabourPct) ?? 28,
      tradingDays: asInt(body.tradingDays) ?? 7,
    });
    return NextResponse.json({ ok: true, profileId: profile.id });
  } catch (err) {
    console.error("[/api/venue] upsert failed:", err);
    return NextResponse.json(
      { ok: false, error: "Could not save your venue. Please try again." },
      { status: 500 },
    );
  }
}
