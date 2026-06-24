/**
 * GET /api/tools/par-level/image?q=chicken+breast
 *
 * Resolves a product photo via Pexels (server-side, key never exposed).
 * Gated (session + active purchase). Returns { url: string | null } — null
 * tells the client to render the on-brand category fallback. Best-effort:
 * never throws, returns null when the key is unset or nothing matches.
 */

import { NextResponse } from "next/server";

import { readLeadSession } from "@/lib/auth/cookie";
import { hasActivePurchase } from "@/lib/purchases";
import { searchProductPhoto } from "@/lib/pexels";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const session = await readLeadSession();
  if (!session) {
    return NextResponse.json({ url: null }, { status: 401 });
  }
  if (!(await hasActivePurchase(session.leadId))) {
    return NextResponse.json({ url: null }, { status: 403 });
  }

  const q = new URL(req.url).searchParams.get("q")?.slice(0, 120) ?? "";
  if (!q.trim()) return NextResponse.json({ url: null });

  const photo = await searchProductPhoto(q);
  return NextResponse.json({
    url: photo?.url ?? null,
    credit: photo
      ? { photographer: photo.photographer, sourceUrl: photo.sourceUrl }
      : null,
  });
}
