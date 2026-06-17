/**
 * POST /api/tools/playbooks
 *
 * Persists which playbook action items the customer has marked implemented.
 * Gated (session + active purchase). Stored as a single non-versioned
 * snapshot (tool="playbooks", period="all"). Health/$ untouched — this is a
 * stickiness/implementation tracker.
 */

import { NextResponse } from "next/server";

import { readLeadSession } from "@/lib/auth/cookie";
import { hasActivePurchase } from "@/lib/purchases";
import { ALL_ACTION_IDS } from "@/lib/tools/playbooks";
import { PLAYBOOKS_PERIOD, upsertSnapshot } from "@/lib/tools/snapshots";

export const runtime = "nodejs";

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

  let body: { implemented?: unknown };
  try {
    body = (await req.json()) as { implemented?: unknown };
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request." },
      { status: 400 },
    );
  }

  // Only keep known action ids — ignore anything unexpected.
  const allowed = new Set(ALL_ACTION_IDS);
  const implemented = Array.isArray(body.implemented)
    ? Array.from(
        new Set(
          body.implemented.filter(
            (id): id is string => typeof id === "string" && allowed.has(id),
          ),
        ),
      )
    : [];

  try {
    await upsertSnapshot({
      leadId: session.leadId,
      tool: "playbooks",
      periodMonth: PLAYBOOKS_PERIOD,
      payload: { implemented },
    });
    return NextResponse.json({ ok: true, count: implemented.length });
  } catch (err) {
    console.error("[/api/tools/playbooks] save failed:", err);
    return NextResponse.json(
      { ok: false, error: "Could not save. Please try again." },
      { status: 500 },
    );
  }
}
