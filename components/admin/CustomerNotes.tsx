"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import type { NoteRow } from "@/lib/admin/customer-detail";

function when(ms: number): string {
  return new Date(ms).toLocaleString("en-AU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CustomerNotes({
  leadId,
  initial,
}: {
  leadId: string;
  initial: NoteRow[];
}) {
  const router = useRouter();
  const [notes, setNotes] = useState<NoteRow[]>(initial);
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const text = body.trim();
    if (!text) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, body: text }),
      });
      const data = (await res.json()) as { ok?: boolean; note?: NoteRow };
      if (res.ok && data.note) {
        setNotes((prev) => [data.note as NoteRow, ...prev]);
        setBody("");
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <form onSubmit={onSubmit} className="mb-5">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Add a support note…"
          rows={3}
          className="w-full px-4 py-3 rounded-lg bg-bg-base border border-[color:var(--border-default)] text-fg-primary placeholder:text-fg-muted text-sm resize-y focus:outline-none focus:border-[color:var(--accent)] transition-colors"
        />
        <div className="mt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving || !body.trim()}
            className="rounded-full bg-fg-primary text-bg-base text-xs font-semibold px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving…" : "Add note"}
          </button>
        </div>
      </form>

      {notes.length === 0 ? (
        <p className="text-sm text-fg-muted">No notes yet.</p>
      ) : (
        <ul className="space-y-3">
          {notes.map((n) => (
            <li
              key={n.id}
              className="rounded-lg border border-[color:var(--border-subtle)] bg-bg-base p-3"
            >
              <p className="text-sm text-fg-secondary whitespace-pre-wrap">
                {n.body}
              </p>
              <p className="mt-2 text-[0.65rem] text-fg-muted">
                {n.authorEmail} · {when(n.createdAtMs)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
