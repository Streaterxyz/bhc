/**
 * POST /api/download  { key: string }
 *
 * Issues a short-lived presigned R2 download URL for a purchased file.
 * Triple-gated, all server-side (never trusts the client):
 *   1. Valid lead session cookie.
 *   2. That lead has a `paid` (non-refunded) purchase — re-checked here on
 *      every request, so a refund instantly revokes downloads.
 *   3. The requested `key` is in the KIT_FILES allow-list — prevents
 *      requesting arbitrary R2 objects.
 *
 * On success: logs the download (audit/abuse detection) and returns a
 * presigned URL the client redirects to. The browser downloads the file
 * (Content-Disposition: attachment) and the URL expires in 15 minutes.
 */

import { NextResponse, type NextRequest } from "next/server";

import { db } from "@/lib/db/client";
import { downloads } from "@/lib/db/schema";
import { readLeadSession } from "@/lib/auth/cookie";
import { getActivePurchaseId } from "@/lib/purchases";
import { getKitFile } from "@/lib/downloads";
import { getSignedDownloadUrl, isR2Configured } from "@/lib/r2";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  // 1. Authenticated lead.
  const session = await readLeadSession();
  if (!session) {
    return NextResponse.json(
      { ok: false, error: "Please access your training first." },
      { status: 401 },
    );
  }

  // 2. Paid, non-refunded purchase (re-verified every request).
  const purchaseId = await getActivePurchaseId(session.leadId);
  if (!purchaseId) {
    return NextResponse.json(
      { ok: false, error: "No active purchase found for this account." },
      { status: 403 },
    );
  }

  // Parse + validate the requested key against the allow-list.
  let body: { key?: unknown };
  try {
    body = (await req.json()) as { key?: unknown };
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request." },
      { status: 400 },
    );
  }
  const key = typeof body.key === "string" ? body.key : null;
  const file = key ? getKitFile(key) : undefined;
  if (!file) {
    // Unknown key — never sign something outside the manifest.
    return NextResponse.json(
      { ok: false, error: "Unknown file." },
      { status: 404 },
    );
  }

  // R2 not configured yet → graceful "coming soon".
  if (!isR2Configured()) {
    return NextResponse.json(
      { ok: false, error: "Your downloads are being prepared." },
      { status: 503 },
    );
  }

  try {
    const url = await getSignedDownloadUrl(file.key, file.filename);
    if (!url) {
      return NextResponse.json(
        { ok: false, error: "Your downloads are being prepared." },
        { status: 503 },
      );
    }

    // 3. Audit log — one row per download click (analytics + abuse signal).
    await db.insert(downloads).values({
      purchaseId,
      fileKey: file.key,
      ipAddress:
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
      userAgent: req.headers.get("user-agent") ?? null,
    });

    return NextResponse.json({ ok: true, url });
  } catch (err) {
    console.error("[/api/download] failed:", err);
    return NextResponse.json(
      { ok: false, error: "Could not generate the download. Please retry." },
      { status: 500 },
    );
  }
}
