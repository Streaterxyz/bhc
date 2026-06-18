/**
 * POST /api/tools/menu/import  (multipart/form-data, field: "file")
 *
 * Reads a photo or PDF of a menu with Claude Haiku 4.5 and returns extracted
 * items (name + price + category) for the operator to review before they're
 * added to the Menu Margin table.
 *
 * Gated (session + active purchase). Soft-capped at 10 scans / rolling 24h
 * per customer to protect against runaway Anthropic API cost.
 */

import { NextResponse } from "next/server";

import { readLeadSession } from "@/lib/auth/cookie";
import { hasActivePurchase } from "@/lib/purchases";
import {
  extractMenuItems,
  isMenuExtractConfigured,
} from "@/lib/ai/menu-extract";
import { countRecentUsage, recordUsage } from "@/lib/tools/ai-usage";

export const runtime = "nodejs";

const FEATURE = "menu_import";
const DAILY_CAP = 10;
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
]);

export async function POST(req: Request) {
  if (!isMenuExtractConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Menu scanning isn't available right now." },
      { status: 503 },
    );
  }

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

  // Rate limit (cost guard).
  const used = await countRecentUsage(session.leadId, FEATURE);
  if (used >= DAILY_CAP) {
    return NextResponse.json(
      {
        ok: false,
        error: `Daily scan limit reached (${DAILY_CAP}/day). Try again tomorrow or enter items manually.`,
      },
      { status: 429 },
    );
  }

  // Read the upload.
  let file: File | null = null;
  try {
    const form = await req.formData();
    const f = form.get("file");
    if (f instanceof File) file = f;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid upload." },
      { status: 400 },
    );
  }
  if (!file) {
    return NextResponse.json(
      { ok: false, error: "No file received." },
      { status: 400 },
    );
  }

  const mediaType = file.type;
  if (!ALLOWED.has(mediaType)) {
    return NextResponse.json(
      { ok: false, error: "Upload a photo (JPG/PNG/WebP) or a PDF." },
      { status: 415 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { ok: false, error: "File is too large (max 10 MB)." },
      { status: 413 },
    );
  }

  try {
    const buf = Buffer.from(await file.arrayBuffer());
    const data = buf.toString("base64");

    const items = await extractMenuItems({ mediaType, data });

    // Record usage only after a successful extraction (don't burn the cap on
    // failed calls).
    await recordUsage(session.leadId, FEATURE);

    return NextResponse.json({
      ok: true,
      items,
      remaining: Math.max(0, DAILY_CAP - used - 1),
    });
  } catch (err) {
    console.error("[/api/tools/menu/import] extraction failed:", err);
    return NextResponse.json(
      {
        ok: false,
        error:
          "Couldn't read that menu. Try a clearer photo or a PDF, or enter items manually.",
      },
      { status: 502 },
    );
  }
}
