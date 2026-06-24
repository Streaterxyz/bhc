/**
 * POST /api/tools/silent-upsell
 *
 * Saves the Silent Upsell System checklist as the current-month snapshot.
 * Gated (session + active purchase). Health-only per the hybrid model: the
 * sales-health % is stored as healthScore; dollarsIdentified stays null.
 */

import { NextResponse } from "next/server";

import { readLeadSession } from "@/lib/auth/cookie";
import { hasActivePurchase } from "@/lib/purchases";
import {
  SILENT_UPSELL_SECTIONS,
  type SilentUpsellAnswers,
  type SilentUpsellSectionId,
  scoreSilentUpsell,
} from "@/lib/tools/silent-upsell";
import { getCurrentPeriodMonth, upsertSnapshot } from "@/lib/tools/snapshots";

export const runtime = "nodejs";

function parseAnswers(raw: unknown): SilentUpsellAnswers | null {
  if (typeof raw !== "object" || raw === null) return null;
  const input = raw as Record<string, unknown>;
  const out = {} as SilentUpsellAnswers;
  for (const section of SILENT_UPSELL_SECTIONS) {
    const arr = input[section.id];
    if (!Array.isArray(arr) || arr.length !== section.questions.length)
      return null;
    out[section.id as SilentUpsellSectionId] = arr.map((v) =>
      v === true ? true : v === false ? false : null,
    );
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

  const result = scoreSilentUpsell(answers);
  if (!result.isComplete) {
    return NextResponse.json(
      { ok: false, error: "Please answer every question." },
      { status: 422 },
    );
  }

  try {
    const snapshot = await upsertSnapshot({
      leadId: session.leadId,
      tool: "silent-upsell",
      periodMonth: getCurrentPeriodMonth(),
      payload: { answers, score: result.score, yesCount: result.yesCount },
      dollarsIdentified: null, // health-only
      healthScore: result.score,
    });
    return NextResponse.json({
      ok: true,
      score: result.score,
      snapshotId: snapshot.id,
    });
  } catch (err) {
    console.error("[/api/tools/silent-upsell] save failed:", err);
    return NextResponse.json(
      { ok: false, error: "Could not save. Please try again." },
      { status: 500 },
    );
  }
}
