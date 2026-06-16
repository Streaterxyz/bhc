/**
 * Typed analytics helpers. Components call these instead of importing
 * posthog directly, so event names stay consistent and every call is a
 * safe no-op when PostHog isn't configured/loaded (e.g. local dev without
 * the key, or before init).
 */

import posthog from "posthog-js";

/** Canonical event names — single source of truth, avoids typos. */
export const EVENTS = {
  LEAD_CAPTURED: "lead_captured",
  VIDEO_PLAY: "training_video_play",
  VIDEO_25: "training_video_25",
  VIDEO_50: "training_video_50",
  VIDEO_75: "training_video_75",
  VIDEO_COMPLETE: "training_video_complete",
  BEGIN_CHECKOUT: "begin_checkout",
  PURCHASE_COMPLETE: "purchase_complete",
  PIN_CLICK: "pin_click",
  BOOK_CALL_OPEN: "book_call_open",
} as const;

export type AnalyticsEvent = (typeof EVENTS)[keyof typeof EVENTS];

function ready(): boolean {
  return (
    typeof window !== "undefined" &&
    // __loaded is set true by posthog.init(); false/undefined when unconfigured.
    Boolean((posthog as unknown as { __loaded?: boolean }).__loaded)
  );
}

/** Capture a product-analytics event. No-op when PostHog isn't loaded. */
export function capture(
  event: AnalyticsEvent,
  properties?: Record<string, unknown>,
): void {
  if (!ready()) return;
  posthog.capture(event, properties);
}

/** Tie subsequent events to a person (called on lead capture). */
export function identifyLead(
  email: string,
  properties?: Record<string, unknown>,
): void {
  if (!ready()) return;
  posthog.identify(email, { email, ...properties });
}
