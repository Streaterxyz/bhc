"use client";

/**
 * Requests a magic access link. Always shows the same neutral confirmation
 * (we never reveal whether an email is on file).
 */

import { useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

export function AccessForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("to") ?? "/downloads";
  const expired = searchParams.get("error") === "expired";

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, redirectTo }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setStatus("error");
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setStatus("sent");
    } catch {
      setStatus("error");
      setError("Network error. Please try again.");
    }
  }

  if (status === "sent") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md text-center"
      >
        <div className="inline-flex items-center gap-2 text-[color:var(--accent)] font-semibold mb-3">
          <span aria-hidden>✓</span>
          <span>Check your email</span>
        </div>
        <p className="text-fg-secondary">
          If <span className="text-fg-primary">{email}</span> is on file, an
          access link is on its way. It works for 30 minutes.
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-md" noValidate>
      {expired && (
        <p className="mb-4 text-sm text-[#ff6b5e]">
          That link expired or was already used. Enter your email for a fresh
          one.
        </p>
      )}
      <label htmlFor="access-email" className="sr-only">
        Email address
      </label>
      <input
        id="access-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@email.com"
        autoComplete="email"
        className="w-full px-5 py-4 rounded-xl bg-bg-elevated border border-[color:var(--border-default)] text-fg-primary placeholder:text-fg-muted focus:outline-none focus:border-[color:var(--accent)] transition-colors"
      />
      {error && (
        <p role="alert" className="mt-3 text-sm text-[#ff6b5e]">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={status === "loading"}
        className="mt-4 w-full inline-flex items-center justify-center gap-3 bg-white text-black font-semibold text-base px-7 py-4 rounded-full hover:bg-[color:var(--accent)] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === "loading" ? "Sending…" : "Email me an access link"}
      </button>
      <p className="mt-4 text-xs text-fg-muted text-center">
        We&apos;ll email a secure one-time link — no password needed.
      </p>
    </form>
  );
}
