"use client";

import { useState } from "react";

export function CopyScript({
  context,
  script,
}: {
  context: string;
  script: string;
}) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(script);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked */
    }
  }
  return (
    <div className="rounded-xl border border-[color:var(--border-subtle)] bg-bg-elevated p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-[0.65rem] tracking-[0.14em] uppercase text-fg-muted">
          {context}
        </span>
        <button
          type="button"
          onClick={copy}
          className="text-xs font-medium text-[color:var(--accent)] hover:underline"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p className="text-sm italic text-fg-secondary">&ldquo;{script}&rdquo;</p>
    </div>
  );
}
