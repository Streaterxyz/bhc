/**
 * POST /api/admin/flag — toggle a customer's manual "needs attention" flag.
 * Admin-gated; stamps the acting admin via setNeedsAttention.
 */

import { NextResponse } from "next/server";

import { readAdminSession } from "@/lib/admin/auth";
import { setNeedsAttention } from "@/lib/admin/notes";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const admin = await readAdminSession();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Unauthorised." }, { status: 401 });
  }

  let leadId: string | null = null;
  let on = false;
  try {
    const json = (await req.json()) as { leadId?: unknown; on?: unknown };
    if (typeof json.leadId === "string") leadId = json.leadId;
    on = json.on === true;
  } catch {
    /* handled below */
  }

  if (!leadId) {
    return NextResponse.json(
      { ok: false, error: "leadId is required." },
      { status: 422 },
    );
  }

  try {
    await setNeedsAttention(leadId, on, admin.email);
    return NextResponse.json({ ok: true, needsAttention: on });
  } catch (err) {
    console.error("[/api/admin/flag] failed:", err);
    return NextResponse.json(
      { ok: false, error: "Could not update the flag." },
      { status: 500 },
    );
  }
}
