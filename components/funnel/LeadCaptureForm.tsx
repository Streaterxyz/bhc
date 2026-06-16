"use client";

/**
 * Email capture form for /training. On success it POSTs to /api/leads
 * (which sets the session cookie server-side) then calls router.refresh()
 * so the server component re-renders /training in its authenticated state.
 *
 * Captures UTM params from the current URL so paid-traffic attribution
 * flows through to the leads table.
 */

import { useState, useRef, useCallback, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";

import { capture, identifyLead, EVENTS } from "@/lib/analytics";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
// Module-level constant so the prop identity is STABLE across re-renders —
// an inline object would re-initialise the widget mid-challenge (→ 600010).
const TURNSTILE_OPTIONS = { theme: "dark", retry: "auto" } as const;

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

export function LeadCaptureForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  // Turnstile token + a handle to reset the widget after a failed attempt
  // (tokens are single-use).
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance | null>(null);
  const turnstileEnabled = Boolean(TURNSTILE_SITE_KEY);

  // Stable handlers (empty deps) so the widget isn't re-initialised by the
  // form's re-renders / mount animation — re-init mid-challenge causes 600010.
  const onTurnstileSuccess = useCallback((token: string) => {
    setTurnstileToken(token);
    setStatus((s) => (s === "error" ? "idle" : s));
  }, []);
  const onTurnstileClear = useCallback(() => setTurnstileToken(null), []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();

    // Require a Turnstile token when the challenge is enabled.
    if (turnstileEnabled && !turnstileToken) {
      setStatus("error");
      setError("Please complete the verification challenge and try again.");
      return;
    }

    setStatus("loading");
    setError(null);

    const utm: Record<string, string> = {};
    for (const key of UTM_KEYS) {
      const v = searchParams.get(key);
      if (v) utm[key] = v;
    }

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name: name || undefined,
          source: "training",
          turnstileToken,
          utm,
          landingPage:
            typeof window !== "undefined" ? window.location.pathname : null,
          referrer:
            typeof document !== "undefined" ? document.referrer || null : null,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setStatus("error");
        setError(data.error ?? "Something went wrong. Please try again.");
        // Token is single-use — reset so a retry gets a fresh one.
        turnstileRef.current?.reset();
        setTurnstileToken(null);
        return;
      }

      // Tie this person to all subsequent analytics, then record the
      // conversion. identify creates the PostHog person profile (we use
      // identified_only profiles).
      identifyLead(email, { name: name || undefined, ...utm });
      capture(EVENTS.LEAD_CAPTURED, { source: "training" });

      // Cookie is set server-side; re-render the page into its
      // authenticated (video) state.
      router.refresh();
    } catch {
      setStatus("error");
      setError("Network error. Please check your connection and try again.");
      turnstileRef.current?.reset();
      setTurnstileToken(null);
    }
  }

  return (
    <motion.form
      onSubmit={onSubmit}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-md"
      noValidate
    >
      <div className="space-y-3">
        <div>
          <label htmlFor="name" className="sr-only">
            First name (optional)
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="First name (optional)"
            autoComplete="given-name"
            className="w-full px-5 py-4 rounded-xl bg-bg-elevated border border-[color:var(--border-default)] text-fg-primary placeholder:text-fg-muted focus:outline-none focus:border-[color:var(--accent)] transition-colors"
          />
        </div>

        <div>
          <label htmlFor="email" className="sr-only">
            Email address
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            autoComplete="email"
            aria-invalid={status === "error"}
            className="w-full px-5 py-4 rounded-xl bg-bg-elevated border border-[color:var(--border-default)] text-fg-primary placeholder:text-fg-muted focus:outline-none focus:border-[color:var(--accent)] transition-colors"
          />
        </div>
      </div>

      {/* Turnstile — only renders when the site key is configured. Themed
          dark to match the form; resets after a failed submit. */}
      {turnstileEnabled && TURNSTILE_SITE_KEY && (
        <div className="mt-4">
          <Turnstile
            ref={turnstileRef}
            siteKey={TURNSTILE_SITE_KEY}
            onSuccess={onTurnstileSuccess}
            onExpire={onTurnstileClear}
            onError={onTurnstileClear}
            options={TURNSTILE_OPTIONS}
          />
        </div>
      )}

      {error && (
        <p role="alert" className="mt-3 text-sm text-[#ff6b5e]">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="group mt-5 w-full inline-flex items-center justify-center gap-3 bg-white text-black font-semibold text-base px-7 py-4 rounded-full hover:bg-[color:var(--accent)] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === "loading" ? (
          <span>Unlocking…</span>
        ) : (
          <>
            <span>Watch the free training</span>
            <span
              aria-hidden
              className="transition-transform group-hover:translate-x-1"
            >
              →
            </span>
          </>
        )}
      </button>

      <p className="mt-4 text-xs text-fg-muted text-center">
        No spam. Unsubscribe anytime. Your email unlocks instant access.
      </p>
    </motion.form>
  );
}
