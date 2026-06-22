"use client";

import { useState, type FormEvent } from "react";

export function AdminLoginForm({ hadError }: { hadError?: boolean }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent">("idle");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      await fetch("/api/admin/request-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch {
      /* generic success either way */
    }
    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <div className="text-center">
        <p className="text-lg font-semibold text-fg-primary mb-2">
          Check your inbox.
        </p>
        <p className="text-sm text-fg-tertiary">
          If that&apos;s an admin email, a sign-in link is on its way. It
          expires in 30 minutes.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="w-full">
      {hadError && (
        <p className="mb-4 text-sm text-[#ff6b5e]" role="alert">
          That link was invalid or expired. Request a new one below.
        </p>
      )}
      <label htmlFor="admin-email" className="sr-only">
        Admin email
      </label>
      <input
        id="admin-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@brendonhill.co"
        autoComplete="email"
        className="w-full px-5 py-4 rounded-xl bg-bg-elevated border border-[color:var(--border-default)] text-fg-primary placeholder:text-fg-muted focus:outline-none focus:border-[color:var(--accent)] transition-colors"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-white text-black font-semibold px-6 py-4 rounded-full hover:bg-[color:var(--accent)] transition-colors disabled:opacity-70 disabled:cursor-wait"
      >
        {status === "loading" ? "Sending…" : "Email me a sign-in link"}
      </button>
    </form>
  );
}
