"use client";

/**
 * Playbook action checklist + interactive worksheets.
 *
 * Simple actions are checkboxes ("mark as implemented"). Actions with
 * `fields` become a workbook — the customer writes their venue's own answers
 * into one input per field, autosaved (debounced) to their account.
 *
 * The component holds the GLOBAL implemented set + entries map (passed from
 * the page) so each save preserves other playbooks' progress.
 */

import { useRef, useState } from "react";

import type { PlaybookAction } from "@/lib/tools/playbooks";

type Entries = Record<string, string[]>;

export function PlaybookActions({
  actions,
  initialImplemented,
  initialEntries,
}: {
  actions: PlaybookAction[];
  initialImplemented: string[];
  initialEntries: Entries;
}) {
  const [implemented, setImplemented] = useState<Set<string>>(
    new Set(initialImplemented),
  );
  const [entries, setEntries] = useState<Entries>(initialEntries);
  const [saving, setSaving] = useState(false);
  const debounce = useRef<number | null>(null);

  async function persist(nextImpl: Set<string>, nextEntries: Entries) {
    setSaving(true);
    try {
      await fetch("/api/tools/playbooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          implemented: Array.from(nextImpl),
          entries: nextEntries,
        }),
      });
    } catch {
      /* best-effort; UI already updated */
    } finally {
      setSaving(false);
    }
  }

  function persistDebounced(nextImpl: Set<string>, nextEntries: Entries) {
    if (debounce.current) window.clearTimeout(debounce.current);
    debounce.current = window.setTimeout(() => {
      void persist(nextImpl, nextEntries);
    }, 700);
  }

  function toggle(id: string) {
    setImplemented((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      void persist(next, entries); // immediate for checkbox
      return next;
    });
  }

  function setField(actionId: string, idx: number, value: string, count: number) {
    setEntries((prev) => {
      const arr = (prev[actionId] ?? new Array(count).fill("")).slice();
      arr[idx] = value;
      const next = { ...prev, [actionId]: arr };
      persistDebounced(implemented, next); // debounced for typing
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
          const hasFields = !!a.fields && a.fields.length > 0;
          return (
            <li
              key={a.id}
              className="overflow-hidden rounded-xl border border-[color:var(--border-subtle)] bg-bg-elevated transition-colors hover:border-[color:var(--border-strong)]"
            >
              <button
                type="button"
                onClick={() => toggle(a.id)}
                aria-pressed={done}
                className="flex w-full items-center gap-3 px-4 py-3 text-left"
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
                <span className="min-w-0">
                  <span
                    className={`block text-sm ${done ? "text-fg-tertiary line-through" : "text-fg-secondary"}`}
                  >
                    {a.label}
                  </span>
                  {a.detail && (
                    <span className="mt-0.5 block text-xs text-fg-muted">
                      {a.detail}
                    </span>
                  )}
                </span>
              </button>

              {hasFields && (
                <div className="space-y-2 border-t border-[color:var(--border-subtle)] bg-bg-base/40 px-4 py-3 pl-12">
                  {a.fields!.map((label, i) => (
                    <div key={i}>
                      <label className="mb-1 block text-[0.65rem] tracking-[0.12em] uppercase text-fg-muted">
                        {label}
                      </label>
                      <textarea
                        rows={1}
                        value={entries[a.id]?.[i] ?? ""}
                        onChange={(e) =>
                          setField(a.id, i, e.target.value, a.fields!.length)
                        }
                        placeholder="Write your venue's answer…"
                        className="w-full resize-y rounded-lg border border-[color:var(--border-subtle)] bg-bg-base px-3 py-2 text-sm text-fg-primary placeholder:text-fg-muted focus:border-[color:var(--accent)] focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
