/**
 * POST /api/tools/diagnostic
 *
 * Saves the Top 5 Leaks diagnostic as the current-month snapshot. Gated:
 * magic-link session + active purchase. The score is computed server-side
 * from the submitted answers (never trusted from the client), then stored
 * with the per-leak severities for the dashboard.
 */

import { NextResponse } from "next/server";

import { readLeadSession } from "@/lib/auth/cookie";
import { hasActivePurchase } from "@/lib/purchases";
import {
  LEAKS,
  type DiagnosticAnswers,
  type LeakId,
  computeHealthScore,
  isComplete,
  scoreAll,
} from "@/lib/tools/diagnostic";
import { getCurrentPeriodMonth, upsertSnapshot } from "@/lib/tools/snapshots";

export const runtime = "nodejs";

/** Coerce the request body into a clean DiagnosticAnswers, ignoring junk. */
function parseAnswers(raw: unknown): DiagnosticAnswers | null {
  if (typeof raw !== "object" || raw === null) return null;
  const input = raw as Record<string, unknown>;
  const out = {} as DiagnosticAnswers;
  for (const leak of LEAKS) {
    const arr = input[leak.id];
    if (!Array.isArray(arr) || arr.length !== leak.questions.length) return null;
    const cleaned = arr.map((v) =>
      v === true ? true : v === false ? false : null,
    );
    out[leak.id as LeakId] = cleaned;
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

  let body: { answers?: unknown };
  try {
    body = (await req.json()) as { answers?: unknown };
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request." },
      { status: 400 },
    );
  }

  const answers = parseAnswers(body.answers);
  if (!answers) {
    return NextResponse.json(
      { ok: false, error: "Malformed answers." },
      { status: 422 },
    );
  }
  if (!isComplete(answers)) {
    return NextResponse.json(
      { ok: false, error: "Please answer every question." },
      { status: 422 },
    );
  }

  // Score server-side — the source of truth.
  const healthScore = computeHealthScore(answers);
  const results = scoreAll(answers).map((r) => ({
    id: r.id,
    severity: r.severity,
    gapPct: r.gapPct,
    yesCount: r.yesCount,
    total: r.total,
  }));

  try {
    const snapshot = await upsertSnapshot({
      leadId: session.leadId,
      tool: "diagnostic",
      periodMonth: getCurrentPeriodMonth(),
      payload: { answers, results },
      healthScore,
    });
    return NextResponse.json({ ok: true, healthScore, snapshotId: snapshot.id });
  } catch (err) {
    console.error("[/api/tools/diagnostic] save failed:", err);
    return NextResponse.json(
      { ok: false, error: "Could not save. Please try again." },
      { status: 500 },
    );
  }
}
