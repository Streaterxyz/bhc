"use client";

/**
 * Header account link. Probes /api/auth/me on mount:
 *   - paid customer with a live session → "Dashboard" → /app
 *   - everyone else (anonymous, or a lead without a purchase) → "Login" → /access
 *
 * Defaults to the "Login" state so anonymous visitors (the majority) see a
 * stable button immediately with no layout shift; only returning customers
 * get a brief swap to "Dashboard".
 */

import Link from "next/link";
import { useEffect, useState } from "react";

type Variant = "default" | "compact";

export function AccountNavLink({
  variant = "default",
  className = "",
}: {
  variant?: Variant;
  className?: string;
}) {
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d: { authed?: boolean }) => {
        if (alive) setAuthed(Boolean(d?.authed));
      })
      .catch(() => {
        if (alive) setAuthed(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const href = authed ? "/app" : "/access";
  const label = authed ? "Dashboard" : "Login";

  const base =
    "inline-flex items-center justify-center rounded-full border border-[color:var(--border-default)] text-fg-secondary hover:text-fg-primary hover:border-fg-primary transition-colors";
  const size =
    variant === "compact" ? "text-xs px-4 py-1.5" : "text-sm px-5 py-2";

  return (
    <Link href={href} className={`${base} ${size} ${className}`}>
      {label}
    </Link>
  );
}
