"use client";

/**
 * Top 5 Leaks Diagnostic — interactive form with a live Venue Health Score
 * and per-leak severity that update as you answer. Pre-fills from the
 * current month's saved snapshot (re-runnable). On submit, persists and
 * returns to the dashboard.
 */

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  LEAKS,
  type DiagnosticAnswers,
  type LeakId,
  type Severity,
  answeredCount,
  computeHealthScore,
  emptyAnswers,
  isComplete,
  scoreLeak,
  TOTAL_QUESTIONS,
} from "@/lib/tools/diagnostic";

const SEVERITY: Record<Severity, { label: string; color: string; bg: string }> =
  {
    low: { label: "Low", color: "#1f9d6b", bg: "rgba(31,157,107,0.14)" },
    medium: { label: "Medium", color: "#e0900b", bg: "rgba(224,144,11,0.14)" },
    high: { label: "High", color: "#e0533f", bg: "rgba(224,83,63,0.14)" },
  };

function healthColor(score: number): string {
  if (score >= 75) return "#1f9d6b";
  if (score >= 50) return "#e0900b";
  return "#e0533f";
}

export function DiagnosticForm({
  initial,
}: {
  initial: DiagnosticAnswers | null;
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<DiagnosticAnswers>(
    initial ?? emptyAnswers(),
  );
  const [status, setStatus] = useState<"idle" | "saving">("idle");
  const [error, setError] = useState<string | null>(null);

  const health = useMemo(() => computeHealthScore(answers), [answers]);
  const answered = useMemo(() => answeredCount(answers), [answers]);
  const complete = useMemo(() => isComplete(answers), [answers]);

  function setAnswer(leak: LeakId, idx: number, value: boolean) {
    setAnswers((prev) => {
      const next = { ...prev, [leak]: [...prev[leak]] };
      next[leak][idx] = value;
      return next;
    });
  }

  async function onSubmit() {
    if (!complete) {
      setError("Please answer every question before saving.");
      return;
    }
    setStatus("saving");
    setError(null);
    try {
      const res = await fetch("/api/tools/diagnostic", {
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
      {/* Questions */}
      <div className="space-y-12">
        {LEAKS.map((leak) => {
          const result = scoreLeak(leak.id, answers[leak.id]);
          const sev = SEVERITY[result.severity];
          const leakAnswered = answers[leak.id].every((a) => a !== null);
          return (
            <section key={leak.id} aria-labelledby={`leak-${leak.id}`}>
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <div className="mb-1 flex items-center gap-2 text-[0.7rem] tracking-[0.18em] uppercase text-fg-muted">
                    <span className="text-[color:var(--accent)] font-semibold">
                      Leak {leak.number}
                    </span>
                  </div>
                  <h2
                    id={`leak-${leak.id}`}
                    className="text-xl font-extrabold tracking-tight lg:text-2xl"
                  >
                    {leak.title}
                  </h2>
                  <p className="mt-1 text-sm text-fg-tertiary">{leak.intro}</p>
                </div>
                {leakAnswered && (
                  <span
                    className="shrink-0 rounded-full px-3 py-1 text-xs font-semibold"
                    style={{ color: sev.color, backgroundColor: sev.bg }}
                  >
                    {sev.label}
                  </span>
                )}
              </div>

              <ul className="space-y-2.5">
                {leak.questions.map((q, idx) => (
                  <li
                    key={idx}
                    className="flex flex-col gap-3 rounded-xl border border-[color:var(--border-subtle)] bg-bg-elevated px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <span className="text-sm text-fg-secondary">{q}</span>
                    <YesNo
                      value={answers[leak.id][idx]}
                      onChange={(v) => setAnswer(leak.id, idx, v)}
                    />
                  </li>
                ))}
              </ul>
            </section>
          );
        })}

        {error && (
          <p role="alert" className="text-sm text-[#e0533f]">
            {error}
          </p>
        )}

        <div className="lg:hidden">
          <SubmitBlock
            health={health}
            answered={answered}
            complete={complete}
            status={status}
            onSubmit={onSubmit}
          />
        </div>
      </div>

      {/* Live score rail (desktop) */}
      <aside className="hidden lg:block">
        <div className="sticky top-24">
          <ScoreCard health={health} answered={answered} />
          <button
            type="button"
            onClick={onSubmit}
            disabled={!complete || status === "saving"}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[color:var(--accent)] px-6 py-3.5 text-base font-semibold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === "saving" ? "Saving…" : "Save & see my dashboard"}
          </button>
          {!complete && (
            <p className="mt-3 text-center text-xs text-fg-muted">
              {TOTAL_QUESTIONS - answered} question
              {TOTAL_QUESTIONS - answered === 1 ? "" : "s"} left
            </p>
          )}
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

function ScoreCard({ health, answered }: { health: number; answered: number }) {
  const color = healthColor(health);
  const pct = Math.round((answered / TOTAL_QUESTIONS) * 100);
  return (
    <div className="rounded-2xl border border-[color:var(--border-subtle)] bg-bg-elevated p-6 text-center">
      <p className="mb-3 text-[0.7rem] tracking-[0.18em] uppercase text-fg-muted">
        Venue Health Score
      </p>
      <div className="mb-1 flex items-end justify-center gap-1">
        <span
          className="text-6xl font-extrabold leading-none tabular-nums"
          style={{ color }}
        >
          {health}
        </span>
        <span className="mb-1 text-lg text-fg-tertiary">/100</span>
      </div>
      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-bg-subtle">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${health}%`, backgroundColor: color }}
        />
      </div>
      <p className="mt-4 text-xs text-fg-muted">{pct}% answered</p>
    </div>
  );
}

function SubmitBlock({
  health,
  answered,
  complete,
  status,
  onSubmit,
}: {
  health: number;
  answered: number;
  complete: boolean;
  status: "idle" | "saving";
  onSubmit: () => void;
}) {
  return (
    <div className="space-y-5">
      <ScoreCard health={health} answered={answered} />
      <button
        type="button"
        onClick={onSubmit}
        disabled={!complete || status === "saving"}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[color:var(--accent)] px-6 py-4 text-base font-semibold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === "saving" ? "Saving…" : "Save & see my dashboard"}
      </button>
    </div>
  );
}
