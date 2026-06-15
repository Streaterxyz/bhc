/**
 * POST /api/video-events
 *
 * Records training-video player progress. Called (throttled) from the
 * TrainingVideo client component. Cookie-gated: only an authenticated
 * lead can write events, and they can only write events for themselves
 * (the lead id comes from the verified session, never from the body).
 *
 * Powers the admin drop-off curve in a later phase ("where does the
 * training lose people?").
 */

import { NextResponse, type NextRequest } from "next/server";

import { db } from "@/lib/db/client";
import { videoEvents } from "@/lib/db/schema";
import { readLeadSession, clearLeadCookie } from "@/lib/auth/cookie";

export const runtime = "nodejs";

const ALLOWED_EVENTS = new Set([
  "play",
  "pause",
  "progress",
  "progress_25",
  "progress_50",
  "progress_75",
  "complete",
]);

type Body = {
  eventType?: unknown;
  watchedSeconds?: unknown;
  durationSeconds?: unknown;
};

function asInt(v: unknown): number | null {
  if (typeof v !== "number" || !Number.isFinite(v)) return null;
  return Math.max(0, Math.round(v));
}

/**
 * Postgres foreign-key violation. Surfaces when the cookie holds a leadId
 * that no longer exists in `leads` (DB reset in dev, lead deleted for GDPR
 * in prod). The Drizzle error nests the pg error under `.cause`.
 */
function isForeignKeyViolation(err: unknown): boolean {
  const code = (err as { cause?: { code?: string }; code?: string })?.cause
    ?.code ?? (err as { code?: string })?.code;
  return code === "23503";
}

export async function POST(req: NextRequest) {
  const session = await readLeadSession();
  if (!session) {
    // No valid lead session → silently accept so the client doesn't retry
    // loudly, but record nothing. 204 = "noted, nothing to return".
    return new NextResponse(null, { status: 204 });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const eventType =
    typeof body.eventType === "string" ? body.eventType : null;
  if (!eventType || !ALLOWED_EVENTS.has(eventType)) {
    return NextResponse.json(
      { ok: false, error: "Unknown event type." },
      { status: 422 },
    );
  }

  try {
    await db.insert(videoEvents).values({
      leadId: session.leadId,
      eventType,
      watchedSeconds: asInt(body.watchedSeconds),
      durationSeconds: asInt(body.durationSeconds),
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    // Stale cookie: leadId no longer exists in `leads`. Clear the cookie so
    // the visitor is cleanly re-gated on their next /training visit, and
    // treat as a no-op rather than an error.
    if (isForeignKeyViolation(err)) {
      await clearLeadCookie();
      return new NextResponse(null, { status: 204 });
    }
    // Genuine, unexpected failure. Telemetry is best-effort and the client
    // is fire-and-forget, so don't surface a hard 500 — log it server-side
    // for visibility and acknowledge with 202.
    console.error("[/api/video-events] insert failed:", err);
    return new NextResponse(null, { status: 202 });
  }
}
