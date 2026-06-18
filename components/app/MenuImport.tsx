"use client";

/**
 * Scan-a-menu importer. Upload a photo or PDF → Claude extracts items →
 * the operator reviews/edits/deletes → confirmed rows are handed to the
 * Menu Margin table (name + sell price; category carried for grouping).
 *
 * Only rendered when extraction is configured server-side (ANTHROPIC_API_KEY).
 */

import { useRef, useState } from "react";

import type { ExtractedMenuItem } from "@/lib/ai/menu-extract";

type ReviewRow = {
  name: string;
  price: string; // editable string
  category: string | null;
  keep: boolean;
};

export function MenuImport({
  onImport,
}: {
  onImport: (items: ExtractedMenuItem[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<"choose" | "loading" | "review">("choose");
  const [rows, setRows] = useState<ReviewRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function reset() {
    setPhase("choose");
    setRows([]);
    setError(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function close() {
    setOpen(false);
    reset();
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhase("loading");
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/tools/menu/import", {
        method: "POST",
        body: form,
      });
      const data = (await res.json()) as {
        ok?: boolean;
        items?: ExtractedMenuItem[];
        error?: string;
      };
      if (!res.ok || !data.ok || !data.items) {
        setError(data.error ?? "Couldn't read that menu.");
        setPhase("choose");
        return;
      }
      if (data.items.length === 0) {
        setError("No items found. Try a clearer photo or a PDF.");
        setPhase("choose");
        return;
      }
      setRows(
        data.items.map((it) => ({
          name: it.name,
          price: it.price != null ? String(it.price) : "",
          category: it.category,
          keep: true,
        })),
      );
      setPhase("review");
    } catch {
      setError("Network error. Please try again.");
      setPhase("choose");
    }
  }

  function confirmImport() {
    const items: ExtractedMenuItem[] = rows
      .filter((r) => r.keep && r.name.trim() !== "")
      .map((r) => ({
        name: r.name.trim(),
        price: r.price.trim() === "" ? null : Number(r.price) || null,
        category: r.category,
      }));
    onImport(items);
    close();
  }

  const keepCount = rows.filter((r) => r.keep && r.name.trim() !== "").length;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border-default)] bg-bg-base px-4 py-2 text-sm font-medium text-fg-primary hover:border-[color:var(--accent)] transition-colors"
      >
        <span aria-hidden>⤓</span>
        <span>Scan menu</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Import menu"
        >
          <div className="w-full max-w-2xl max-h-[88vh] overflow-hidden rounded-2xl border border-[color:var(--border-default)] bg-bg-elevated flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[color:var(--border-subtle)] px-6 py-4">
              <h2 className="text-lg font-extrabold tracking-tight">
                {phase === "review" ? "Review extracted items" : "Scan your menu"}
              </h2>
              <button
                type="button"
                onClick={close}
                className="text-fg-tertiary hover:text-fg-primary text-2xl leading-none"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {phase === "choose" && (
                <div className="text-center py-8">
                  <p className="text-fg-secondary mb-1">
                    Upload a photo or PDF of your menu.
                  </p>
                  <p className="text-xs text-fg-muted mb-8">
                    We&apos;ll pull out item names + prices. You add the costs.
                  </p>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="inline-flex items-center gap-2 rounded-full bg-[color:var(--accent)] px-7 py-3.5 font-semibold text-black hover:opacity-90 transition-opacity"
                  >
                    Choose photo or PDF
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
                    capture="environment"
                    onChange={onFile}
                    className="hidden"
                  />
                  {error && (
                    <p className="mt-6 text-sm text-red-400" role="alert">
                      {error}
                    </p>
                  )}
                </div>
              )}

              {phase === "loading" && (
                <div className="text-center py-16">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-[color:var(--border-default)] border-t-[color:var(--accent)]" />
                  <p className="mt-4 text-sm text-fg-secondary">
                    Reading your menu…
                  </p>
                </div>
              )}

              {phase === "review" && (
                <div className="space-y-2">
                  <p className="text-xs text-fg-muted mb-3">
                    Edit names/prices, untick anything you don&apos;t want, then
                    add them to your table.
                  </p>
                  {rows.map((r, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${
                        r.keep
                          ? "border-[color:var(--border-default)] bg-bg-base"
                          : "border-transparent bg-bg-base/40 opacity-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={r.keep}
                        onChange={(e) =>
                          setRows((prev) => {
                            const next = prev.slice();
                            next[i] = { ...next[i], keep: e.target.checked };
                            return next;
                          })
                        }
                        className="accent-[color:var(--accent)]"
                        aria-label="Keep item"
                      />
                      <input
                        value={r.name}
                        onChange={(e) =>
                          setRows((prev) => {
                            const next = prev.slice();
                            next[i] = { ...next[i], name: e.target.value };
                            return next;
                          })
                        }
                        className="flex-1 min-w-0 rounded-md border border-[color:var(--border-subtle)] bg-bg-base px-2 py-1.5 text-sm text-fg-primary focus:border-[color:var(--accent)] focus:outline-none"
                      />
                      {r.category && (
                        <span className="hidden sm:inline shrink-0 text-[0.6rem] tracking-wide uppercase text-fg-muted">
                          {r.category}
                        </span>
                      )}
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-fg-muted text-sm">$</span>
                        <input
                          value={r.price}
                          inputMode="decimal"
                          onChange={(e) =>
                            setRows((prev) => {
                              const next = prev.slice();
                              next[i] = {
                                ...next[i],
                                price: e.target.value.replace(/[^0-9.]/g, ""),
                              };
                              return next;
                            })
                          }
                          className="w-16 rounded-md border border-[color:var(--border-subtle)] bg-bg-base px-2 py-1.5 text-sm text-fg-primary focus:border-[color:var(--accent)] focus:outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {phase === "review" && (
              <div className="flex items-center justify-between gap-4 border-t border-[color:var(--border-subtle)] px-6 py-4">
                <button
                  type="button"
                  onClick={reset}
                  className="text-sm text-fg-tertiary hover:text-fg-primary"
                >
                  ← Scan a different menu
                </button>
                <button
                  type="button"
                  onClick={confirmImport}
                  disabled={keepCount === 0}
                  className="rounded-full bg-[color:var(--accent)] px-6 py-2.5 font-semibold text-black hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  Add {keepCount} {keepCount === 1 ? "item" : "items"} to table
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
