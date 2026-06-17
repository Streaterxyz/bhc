/**
 * POST /api/tools/roster
 *
 * Saves the Roster Waste calculator as the current-month snapshot. Gated
 * (session + active purchase). The $ leak figure (annualised net weekly
 * waste) is computed server-side against the venue's target labour % —
 * never trusted from the client.
 */

import { NextResponse } from "next/server";

import { readLeadSession } from "@/lib/auth/cookie";
import { hasActivePurchase } from "@/lib/purchases";
import { getVenueProfile } from "@/lib/venue";
import { DAYS, computeRoster, type DayInput } from "@/lib/tools/roster";
import { getCurrentPeriodMonth, upsertSnapshot } from "@/lib/tools/snapshots";

export const runtime = "nodejs";

function num(v: unknown): number {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function parseDays(raw: unknown): DayInput[] | null {
  if (!Array.isArray(raw) || raw.length !== DAYS.length) return null;
  return raw.map((d) => {
    const o = (d ?? {}) as Record<string, unknown>;
    return {
      pax: num(o.pax),
      sph: num(o.sph),
      labourCost: num(o.labourCost),
      hours: num(o.hours),
    };
  });
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

  const profile = await getVenueProfile(session.leadId);
  if (!profile) {
    return NextResponse.json(
      { ok: false, error: "Set up your venue first." },
      { status: 409 },
    );
  }

  let body: { days?: unknown };
  try {
    body = (await req.json()) as { days?: unknown };
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request." },
      { status: 400 },
    );
  }

  const days = parseDays(body.days);
  if (!days) {
    return NextResponse.json(
      { ok: false, error: "Please complete all seven days." },
      { status: 422 },
    );
  }

  const targetPct = profile.targetLabourPct ?? 28;
  const { totals } = computeRoster(days, targetPct);

  try {
    const snapshot = await upsertSnapshot({
      leadId: session.leadId,
      tool: "roster",
      periodMonth: getCurrentPeriodMonth(),
      payload: { days, targetPct },
      dollarsIdentified: totals.annualWaste,
    });
    return NextResponse.json({
      ok: true,
      annualWaste: totals.annualWaste,
      snapshotId: snapshot.id,
    });
  } catch (err) {
    console.error("[/api/tools/roster] save failed:", err);
    return NextResponse.json(
      { ok: false, error: "Could not save. Please try again." },
      { status: 500 },
    );
  }
}
