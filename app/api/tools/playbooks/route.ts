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
import { ALL_ACTION_IDS, ACTION_FIELD_COUNTS } from "@/lib/tools/playbooks";
import { PLAYBOOKS_PERIOD, upsertSnapshot } from "@/lib/tools/snapshots";

export const runtime = "nodejs";

const MAX_FIELD_CHARS = 600;

/**
 * Validate the written worksheet entries: keep only known worksheet action
 * ids, cap each entry to that action's field count, coerce to strings capped
 * at MAX_FIELD_CHARS. Anything unexpected is dropped.
 */
function cleanEntries(raw: unknown): Record<string, string[]> {
  if (!raw || typeof raw !== "object") return {};
  const out: Record<string, string[]> = {};
  for (const [actionId, vals] of Object.entries(
    raw as Record<string, unknown>,
  )) {
    const count = ACTION_FIELD_COUNTS[actionId];
    if (!count || !Array.isArray(vals)) continue;
    out[actionId] = vals
      .slice(0, count)
      .map((v) => (typeof v === "string" ? v.slice(0, MAX_FIELD_CHARS) : ""));
  }
  return out;
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

  let body: { implemented?: unknown; entries?: unknown };
  try {
    body = (await req.json()) as { implemented?: unknown; entries?: unknown };
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

  const entries = cleanEntries(body.entries);

  try {
    await upsertSnapshot({
      leadId: session.leadId,
      tool: "playbooks",
      periodMonth: PLAYBOOKS_PERIOD,
      payload: { implemented, entries },
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
