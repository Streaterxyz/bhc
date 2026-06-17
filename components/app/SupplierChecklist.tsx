"use client";

/**
 * Supplier Cost Detector — interactive checklist (Invoice Audit + Seasonal
 * Adjustment) with a live supplier-health %, plus copy-able negotiation
 * scripts. Health-only (no $). Pre-fills from this month's snapshot.
 */

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  NEGOTIATION_SCRIPTS,
  SUPPLIER_SECTIONS,
  SUPPLIER_TOTAL_QUESTIONS,
  type SupplierAnswers,
  type SupplierSectionId,
  emptySupplierAnswers,
  scoreSupplier,
} from "@/lib/tools/supplier";

function healthColor(score: number): string {
  if (score >= 75) return "#1f9d6b";
  if (score >= 50) return "#e0900b";
  return "#e0533f";
}

export function SupplierChecklist({
  initial,
}: {
  initial: SupplierAnswers | null;
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<SupplierAnswers>(
    initial ?? emptySupplierAnswers(),
  );
  const [status, setStatus] = useState<"idle" | "saving">("idle");
  const [error, setError] = useState<string | null>(null);

  const result = useMemo(() => scoreSupplier(answers), [answers]);

  function setAnswer(section: SupplierSectionId, idx: number, value: boolean) {
    setAnswers((prev) => {
      const next = { ...prev, [section]: [...prev[section]] };
      next[section][idx] = value;
      return next;
    });
  }

  async function onSave() {
    if (!result.isComplete) {
      setError("Please answer every question before saving.");
      return;
    }
    setStatus("saving");
    setError(null);
    try {
      const res = await fetch("/api/tools/supplier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Could not save. Please try again.");
        setStatus("idle");
        return;
      }
      router.push("/app");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setStatus("idle");
    }
  }

  return (
    <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-12">
      <div className="space-y-12">
        {SUPPLIER_SECTIONS.map((section) => (
          <section key={section.id}>
            <h2 className="text-xl font-extrabold tracking-tight lg:text-2xl">
              {section.title}
            </h2>
            <p className="mb-5 mt-1 text-sm text-fg-tertiary">
              {section.intro}
            </p>
            <ul className="space-y-2.5">
              {section.questions.map((q, idx) => (
                <li
                  key={idx}
                  className="flex flex-col gap-3 rounded-xl border border-[color:var(--border-subtle)] bg-bg-elevated px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="text-sm text-fg-secondary">{q}</span>
                  <YesNo
                    value={answers[section.id][idx]}
                    onChange={(v) => setAnswer(section.id, idx, v)}
                  />
                </li>
              ))}
            </ul>
          </section>
        ))}

        {/* Negotiation scripts */}
        <section>
          <h2 className="text-xl font-extrabold tracking-tight lg:text-2xl">
            Negotiation scripts
          </h2>
          <p className="mb-5 mt-1 text-sm text-fg-tertiary">
            Tested lines to get better pricing without awkward conversations.
            Good suppliers respect operators who know their numbers.
          </p>
          <div className="space-y-3">
            {NEGOTIATION_SCRIPTS.map((s) => (
              <ScriptCard key={s.context} context={s.context} script={s.script} />
            ))}
          </div>
        </section>

        {/* Par-level note (deferred) */}
        <p className="rounded-xl border border-dashed border-[color:var(--border-default)] px-4 py-3 text-sm text-fg-muted">
          Par-Level Calculator — coming soon. It&apos;ll turn your usage data
          into exact order quantities so you stop over-ordering.
        </p>

        {error && (
          <p role="alert" className="text-sm text-[#e0533f]">
            {error}
          </p>
        )}

        <div className="lg:hidden">
          <ScoreCard result={result} />
          <SaveButton
            complete={result.isComplete}
            status={status}
            onSave={onSave}
          />
        </div>
      </div>

      <aside className="hidden lg:block">
        <div className="sticky top-24">
          <ScoreCard result={result} />
          <div className="mt-6">
            <SaveButton
              complete={result.isComplete}
              status={status}
              onSave={onSave}
            />
          </div>
        </div>
      </aside>
    </div>
  );
}

function YesNo({
  value,
  onChange,
}: {
  value: boolean | null;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="inline-flex shrink-0 rounded-full border border-[color:var(--border-default)] p-0.5">
      {[
        { label: "Yes", v: true },
        { label: "No", v: false },
      ].map((opt) => {
        const active = value === opt.v;
        return (
          <button
            key={opt.label}
            type="button"
            onClick={() => onChange(opt.v)}
            aria-pressed={active}
            className={`min-w-[56px] rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              active
                ? opt.v
                  ? "bg-[color:var(--accent)] text-black"
                  : "bg-bg-subtle text-fg-primary"
                : "text-fg-tertiary hover:text-fg-primary"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function ScriptCard({ context, script }: { context: string; script: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(script);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked — no-op */
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

function ScoreCard({
  result,
}: {
  result: { score: number; isComplete: boolean; yesCount: number };
}) {
  const color = healthColor(result.score);
  return (
    <div className="rounded-2xl border border-[color:var(--border-subtle)] bg-bg-elevated p-6 text-center">
      <p className="mb-3 text-[0.7rem] tracking-[0.18em] uppercase text-fg-muted">
        Supplier Health
      </p>
      <div className="mb-1 flex items-end justify-center gap-1">
        <span
          className="text-6xl font-extrabold leading-none tabular-nums"
          style={{ color }}
        >
          {result.score}
        </span>
        <span className="mb-1 text-lg text-fg-tertiary">/100</span>
      </div>
      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-bg-subtle">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${result.score}%`, backgroundColor: color }}
        />
      </div>
      <p className="mt-4 text-xs text-fg-muted">
        {result.yesCount}/{SUPPLIER_TOTAL_QUESTIONS} best practices in place
      </p>
    </div>
  );
}

function SaveButton({
  complete,
  status,
  onSave,
}: {
  complete: boolean;
  status: "idle" | "saving";
  onSave: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSave}
      disabled={!complete || status === "saving"}
      className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[color:var(--accent)] px-6 py-3.5 text-base font-semibold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 lg:mt-0"
    >
      {status === "saving" ? "Saving…" : "Save to my dashboard"}
    </button>
  );
}
