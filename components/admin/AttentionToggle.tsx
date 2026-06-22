"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AttentionToggle({
  leadId,
  initial,
}: {
  leadId: string;
  initial: boolean;
}) {
  const router = useRouter();
  const [on, setOn] = useState(initial);
  const [saving, setSaving] = useState(false);

  async function toggle() {
    const next = !on;
    setOn(next); // optimistic
    setSaving(true);
    try {
      const res = await fetch("/api/admin/flag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, on: next }),
      });
      if (!res.ok) setOn(!next); // revert on failure
      else router.refresh();
    } catch {
      setOn(!next);
    } finally {
      setSaving(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={saving}
      aria-pressed={on}
      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors disabled:opacity-60 ${
        on
          ? "border-red-500/40 bg-red-500/15 text-red-400"
          : "border-[color:var(--border-default)] bg-bg-elevated text-fg-tertiary hover:text-fg-secondary"
      }`}
    >
      <span aria-hidden>{on ? "★" : "☆"}</span>
      {on ? "Needs attention" : "Flag attention"}
    </button>
  );
}
