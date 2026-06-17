/**
 * POST /api/tools/menu
 *
 * Saves the Menu Margin Trap Fixer as the current-month snapshot. Gated
 * (session + active purchase). The annual margin leak is computed
 * server-side; per the hybrid $ rule, dollarsIdentified is only set when at
 * least one item has volume — otherwise null (margin-health view only).
 */

import { NextResponse } from "next/server";

import { readLeadSession } from "@/lib/auth/cookie";
import { hasActivePurchase } from "@/lib/purchases";
import {
  DEFAULT_TARGET_GP_PCT,
  computeMenu,
  type MenuItem,
} from "@/lib/tools/menu";
import { getCurrentPeriodMonth, upsertSnapshot } from "@/lib/tools/snapshots";

export const runtime = "nodejs";

function num(v: unknown): number {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function parseItems(raw: unknown): MenuItem[] | null {
  if (!Array.isArray(raw)) return null;
  // Keep only rows that have a name or any number entered.
  const items = raw.map((d) => {
    const o = (d ?? {}) as Record<string, unknown>;
    return {
      name: typeof o.name === "string" ? o.name.slice(0, 120) : "",
      cost: num(o.cost),
      labour: num(o.labour),
      overhead: num(o.overhead),
      sell: num(o.sell),
      units: num(o.units),
    };
  });
  return items.filter(
    (it) => it.name.trim() !== "" || it.cost || it.sell || it.units,
  );
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

  let body: { items?: unknown; targetGpPct?: unknown };
  try {
    body = (await req.json()) as { items?: unknown; targetGpPct?: unknown };
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request." },
      { status: 400 },
    );
  }

  const items = parseItems(body.items);
  if (!items || items.length === 0) {
    return NextResponse.json(
      { ok: false, error: "Add at least one menu item." },
      { status: 422 },
    );
  }

  const targetRaw = num(body.targetGpPct);
  const targetGpPct =
    targetRaw > 0 && targetRaw <= 100 ? targetRaw : DEFAULT_TARGET_GP_PCT;

  const { totals } = computeMenu(items, targetGpPct);
  // Hybrid rule: $ only when volume is present.
  const dollarsIdentified = totals.hasVolume ? totals.annualLeak : null;

  try {
    const snapshot = await upsertSnapshot({
      leadId: session.leadId,
      tool: "menu",
      periodMonth: getCurrentPeriodMonth(),
      payload: { items, targetGpPct },
      dollarsIdentified,
    });
    return NextResponse.json({
      ok: true,
      annualLeak: totals.annualLeak,
      hasVolume: totals.hasVolume,
      snapshotId: snapshot.id,
    });
  } catch (err) {
    console.error("[/api/tools/menu] save failed:", err);
    return NextResponse.json(
      { ok: false, error: "Could not save. Please try again." },
      { status: 500 },
    );
  }
}
