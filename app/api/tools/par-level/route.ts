/**
 * POST /api/tools/par-level
 *
 * Saves the venue's par sheet (a list of products) as a single evolving
 * snapshot (tool="par-level", period="all"). Gated (session + active
 * purchase). Standalone tool — does NOT touch the $ Identified/Recovered
 * dashboard model, so dollarsIdentified/healthScore stay null.
 */

import { NextResponse } from "next/server";

import { readLeadSession } from "@/lib/auth/cookie";
import { hasActivePurchase } from "@/lib/purchases";
import { upsertSnapshot } from "@/lib/tools/snapshots";
import {
  DELIVERY_FREQUENCIES,
  UNITS,
  type DeliveryFrequency,
  type ParLevelInput,
  type Unit,
} from "@/lib/tools/par-level";

export const runtime = "nodejs";

const PAR_LEVEL_PERIOD = "all"; // single evolving sheet, not monthly-versioned
const MAX_LINES = 100;

const UNIT_SET = new Set<Unit>(UNITS.map((u) => u.value));
const FREQ_SET = new Set<DeliveryFrequency>(
  DELIVERY_FREQUENCIES.map((f) => f.value),
);

function num(v: unknown, max = 1_000_000): number {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(n, max);
}

function parseLines(raw: unknown): ParLevelInput[] | null {
  if (!Array.isArray(raw)) return null;
  if (raw.length > MAX_LINES) return null;
  const out: ParLevelInput[] = [];
  for (const item of raw) {
    if (typeof item !== "object" || item === null) return null;
    const o = item as Record<string, unknown>;
    const name = typeof o.productName === "string" ? o.productName.trim().slice(0, 120) : "";
    if (!name) return null;
    const unit = (o.unit as Unit) ?? "kg";
    if (!UNIT_SET.has(unit)) return null;
    const freq = (o.deliveryFrequency as DeliveryFrequency) ?? "weekly";
    if (!FREQ_SET.has(freq)) return null;
    const imageUrl =
      typeof o.imageUrl === "string" && o.imageUrl.startsWith("https://")
        ? o.imageUrl.slice(0, 500)
        : null;
    out.push({
      productName: name,
      unit,
      weeklyUsage: num(o.weeklyUsage),
      leadTimeDays: num(o.leadTimeDays, 365),
      deliveryFrequency: freq,
      currentStock: num(o.currentStock),
      safetyBufferPct: num(o.safetyBufferPct, 100),
      unitCost: num(o.unitCost),
      imageUrl,
    });
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

  let body: { lines?: unknown };
  try {
    body = (await req.json()) as { lines?: unknown };
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const lines = parseLines(body.lines);
  if (!lines) {
    return NextResponse.json(
      { ok: false, error: "Malformed par sheet." },
      { status: 422 },
    );
  }

  try {
    await upsertSnapshot({
      leadId: session.leadId,
      tool: "par-level",
      periodMonth: PAR_LEVEL_PERIOD,
      payload: { lines },
      dollarsIdentified: null,
      healthScore: null,
    });
    return NextResponse.json({ ok: true, count: lines.length });
  } catch (err) {
    console.error("[/api/tools/par-level] save failed:", err);
    return NextResponse.json(
      { ok: false, error: "Could not save. Please try again." },
      { status: 500 },
    );
  }
}
