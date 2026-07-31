/**
 * Meta (Facebook) Conversions API — server-side event client.
 *
 * Mirrors lib/loops.ts: env-gated + best-effort. Every call is a no-op when
 * META_PIXEL_ID / META_CAPI_ACCESS_TOKEN are unset and never throws — ad
 * attribution must never break the funnel.
 *
 * The browser pixel (components/analytics/MetaPixel.tsx) fires the same
 * events with a shared event id, so Meta dedups browser + server and keeps
 * whichever arrives with better match quality. Server events carry a
 * SHA-256-hashed email plus the _fbp/_fbc cookies and client IP/UA read off
 * the originating request via metaRequestContext().
 *
 * Optional META_TEST_EVENT_CODE routes events to Events Manager's "Test
 * events" tab during setup verification.
 */

import "server-only";
import { createHash } from "crypto";

const API_VERSION = "v23.0";

export function isMetaCapiConfigured(): boolean {
  return Boolean(
    process.env.META_PIXEL_ID && process.env.META_CAPI_ACCESS_TOKEN,
  );
}

function sha256(value: string): string {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

export type MetaRequestContext = {
  fbp: string | null;
  fbc: string | null;
  clientIp: string | null;
  userAgent: string | null;
};

/**
 * Read the Meta browser cookies + client hints off an incoming API request
 * so the server-side event matches the same browser identity Meta's pixel
 * sees. Safe on any Request; missing pieces are simply omitted.
 */
export function metaRequestContext(req: Request): MetaRequestContext {
  const cookieHeader = req.headers.get("cookie") ?? "";
  const cookie = (name: string): string | null => {
    const m = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
    return m ? decodeURIComponent(m[1]) : null;
  };
  return {
    fbp: cookie("_fbp"),
    fbc: cookie("_fbc"),
    clientIp:
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    userAgent: req.headers.get("user-agent"),
  };
}

type MetaEventInput = {
  /** Standard (Lead, InitiateCheckout, Purchase) or custom event name. */
  eventName: string;
  /** Shared with the browser pixel's eventID for dedup; must be stable on retries. */
  eventId: string;
  email?: string | null;
  sourceUrl?: string | null;
  value?: number;
  currency?: string;
  fbp?: string | null;
  fbc?: string | null;
  clientIp?: string | null;
  userAgent?: string | null;
};

/** Send one event to the Conversions API. Best-effort; returns success. */
export async function sendMetaEvent(input: MetaEventInput): Promise<boolean> {
  const pixelId = process.env.META_PIXEL_ID;
  const token = process.env.META_CAPI_ACCESS_TOKEN;
  if (!pixelId || !token) return false;

  const userData: Record<string, unknown> = {};
  if (input.email) userData.em = [sha256(input.email)];
  if (input.fbp) userData.fbp = input.fbp;
  if (input.fbc) userData.fbc = input.fbc;
  if (input.clientIp) userData.client_ip_address = input.clientIp;
  if (input.userAgent) userData.client_user_agent = input.userAgent;

  const customData: Record<string, unknown> = {};
  if (typeof input.value === "number") customData.value = input.value;
  if (input.currency) customData.currency = input.currency.toUpperCase();

  const testEventCode = process.env.META_TEST_EVENT_CODE;

  try {
    const res = await fetch(
      `https://graph.facebook.com/${API_VERSION}/${pixelId}/events?access_token=${encodeURIComponent(token)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: [
            {
              event_name: input.eventName,
              event_time: Math.floor(Date.now() / 1000),
              event_id: input.eventId,
              action_source: "website",
              ...(input.sourceUrl ? { event_source_url: input.sourceUrl } : {}),
              user_data: userData,
              ...(Object.keys(customData).length
                ? { custom_data: customData }
                : {}),
            },
          ],
          ...(testEventCode ? { test_event_code: testEventCode } : {}),
        }),
      },
    );
    if (!res.ok) {
      console.error(
        `[meta] ${input.eventName} → ${res.status}`,
        await res.text().catch(() => ""),
      );
      return false;
    }
    return true;
  } catch (err) {
    console.error(`[meta] ${input.eventName} threw:`, err);
    return false;
  }
}
