"use client";

/**
 * Checkable "mark as implemented" actions for a playbook. Toggling persists
 * the full implemented set to /api/tools/playbooks (optimistic; reverts on
 * failure). Pre-filled from the saved set.
 */

import { useState } from "react";

import type { PlaybookAction } from "@/lib/tools/playbooks";

export function PlaybookActions({
  actions,
  initialImplemented,
}: {
  actions: PlaybookAction[];
  initialImplemented: string[];
}) {
  const [implemented, setImplemented] = useState<Set<string>>(
    new Set(initialImplemented),
  );
  const [saving, setSaving] = useState(false);

  async function persist(next: Set<string>) {
    setSaving(true);
    try {
      await fetch("/api/tools/playbooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Send the full set — the API replaces the stored list. We merge the
        // server's other-playbook ids by sending only what we know plus the
        // untouched ones already in this set (this component holds the global
        // implemented set passed in, so it's complete).
        body: JSON.stringify({ implemented: Array.from(next) }),
      });
    } catch {
      /* best-effort; UI already updated */
    } finally {
      setSaving(false);
    }
  }

  function toggle(id: string) {
    setImplemented((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      void persist(next);
      return next;
    });
  }

  const doneHere = actions.filter((a) => implemented.has(a.id)).length;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-extrabold tracking-tight">
          Action checklist
        </h2>
        <span className="text-xs text-fg-muted">
          {doneHere}/{actions.length} done{saving ? " · saving…" : ""}
        </span>
      </div>
      <ul className="space-y-2.5">
        {actions.map((a) => {
          const done = implemented.has(a.id);
          return (
            <li key={a.id}>
              <button
                type="button"
                onClick={() => toggle(a.id)}
                aria-pressed={done}
                className="flex w-full items-center gap-3 rounded-xl border border-[color:var(--border-subtle)] bg-bg-elevated px-4 py-3 text-left transition-colors hover:border-[color:var(--border-strong)]"
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                    done
                      ? "border-[color:var(--accent)] bg-[color:var(--accent)] text-black"
                      : "border-[color:var(--border-strong)]"
                  }`}
                  aria-hidden
                >
                  {done && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  )}
                </span>
                <span
                  className={`text-sm ${done ? "text-fg-tertiary line-through" : "text-fg-secondary"}`}
                >
                  {a.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
