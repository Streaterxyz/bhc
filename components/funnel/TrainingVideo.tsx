"use client";

/**
 * The training video player.
 *
 * Env-gated: when NEXT_PUBLIC_STREAM_VIDEO_ID is unset (today), it renders
 * the original cinematic placeholder so the page composition is unchanged.
 * Once the Cloudflare Stream video UID + customer subdomain code are added
 * as env vars and the site is redeployed, the real player renders — no code
 * change required.
 *
 * Progress telemetry: play / 25% / 50% / 75% / complete milestones are
 * POSTed (fire-and-forget, keepalive) to /api/video-events, which gates on
 * the lead session cookie server-side. These feed the future admin
 * drop-off curve. Milestones fire at most once per mount.
 *
 * NEXT_PUBLIC_ vars are inlined at build time, so adding them in Vercel and
 * redeploying is what activates the player — expected for an env swap.
 */

import { useCallback, useRef } from "react";
import { Stream, type StreamPlayerApi } from "@cloudflare/stream-react";

const VIDEO_ID = process.env.NEXT_PUBLIC_STREAM_VIDEO_ID;
const CUSTOMER_CODE = process.env.NEXT_PUBLIC_STREAM_CUSTOMER_CODE;

type EventPayload = {
  eventType:
    | "play"
    | "pause"
    | "progress_25"
    | "progress_50"
    | "progress_75"
    | "complete";
  watchedSeconds?: number;
  durationSeconds?: number;
};

function sendEvent(payload: EventPayload) {
  // Fire-and-forget. keepalive lets the request survive a tab close /
  // navigation (important for the `complete` and `pause` events).
  try {
    fetch("/api/video-events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* never let telemetry break playback */
  }
}

type TrainingVideoProps = {
  /** Reports max watch fraction (0–1) so the parent can progressively
   *  reveal the offer (sticky CTA at 30%, emphasis at completion). */
  onProgress?: (fraction: number) => void;
};

export function TrainingVideo({ onProgress }: TrainingVideoProps = {}) {
  const playerRef = useRef<StreamPlayerApi | undefined>(undefined);
  const fired = useRef<Set<string>>(new Set());
  const maxFraction = useRef(0);

  const fireOnce = useCallback((key: string, payload: EventPayload) => {
    if (fired.current.has(key)) return;
    fired.current.add(key);
    sendEvent(payload);
  }, []);

  const handlePlay = useCallback(() => {
    const p = playerRef.current;
    fireOnce("play", {
      eventType: "play",
      watchedSeconds: p?.currentTime ? Math.round(p.currentTime) : 0,
      durationSeconds: p?.duration ? Math.round(p.duration) : undefined,
    });
  }, [fireOnce]);

  const handleTimeUpdate = useCallback(() => {
    const p = playerRef.current;
    if (!p || !p.duration || !Number.isFinite(p.duration)) return;
    const pct = p.currentTime / p.duration;

    // Report monotonic max progress to the parent for the offer reveal.
    if (pct > maxFraction.current) {
      maxFraction.current = pct;
      onProgress?.(pct);
    }

    const base = {
      watchedSeconds: Math.round(p.currentTime),
      durationSeconds: Math.round(p.duration),
    };
    if (pct >= 0.25)
      fireOnce("p25", { eventType: "progress_25", ...base });
    if (pct >= 0.5) fireOnce("p50", { eventType: "progress_50", ...base });
    if (pct >= 0.75)
      fireOnce("p75", { eventType: "progress_75", ...base });
  }, [fireOnce, onProgress]);

  const handleEnded = useCallback(() => {
    const p = playerRef.current;
    maxFraction.current = 1;
    onProgress?.(1);
    fireOnce("complete", {
      eventType: "complete",
      watchedSeconds: p?.duration ? Math.round(p.duration) : undefined,
      durationSeconds: p?.duration ? Math.round(p.duration) : undefined,
    });
  }, [fireOnce, onProgress]);

  // ── Placeholder (no video configured yet) ───────────────────────────
  if (!VIDEO_ID) {
    return (
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-[color:var(--border-strong)] bg-black">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(at 50% 40%, rgba(244,194,28,0.12), transparent 60%), linear-gradient(150deg, #161616 0%, #050505 70%)",
          }}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
          <div className="w-20 h-20 rounded-full border border-[color:var(--border-strong)] bg-black/40 backdrop-blur-sm flex items-center justify-center">
            <svg width="22" height="26" viewBox="0 0 22 26" fill="none" aria-hidden>
              <path
                d="M21 13L0.75 25.124L0.75 0.876L21 13Z"
                fill="currentColor"
                className="text-[color:var(--accent)]"
              />
            </svg>
          </div>
          <p className="text-xs tracking-[0.2em] uppercase text-fg-tertiary">
            Training video — coming online shortly
          </p>
        </div>
      </div>
    );
  }

  // ── Live Cloudflare Stream player ───────────────────────────────────
  // @cloudflare/stream-react's `responsive` wrapper only sets
  // `position: relative` (no padding-top aspect hack), and absolutely
  // positions the iframe inside it — so the height MUST come from this
  // outer wrapper. We give it the 16:9 ratio via `aspect-video` and force
  // the Stream component's intermediate <div> to fill it (`[&>div]:absolute
  // [&>div]:inset-0`). Without that, the middle div sits in normal flow at
  // 0 height and the player collapses / renders in the corner.
  return (
    <div className="training-video-frame relative aspect-video w-full overflow-hidden rounded-2xl border border-[color:var(--border-strong)] bg-black">
      <Stream
        controls
        src={VIDEO_ID}
        customerCode={CUSTOMER_CODE}
        streamRef={playerRef}
        onPlay={handlePlay}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        responsive
      />
    </div>
  );
}
