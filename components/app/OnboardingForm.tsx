"use client";

/**
 * Venue onboarding form. Captured once (editable later), then used to
 * pre-fill + personalise every tool. Pre-fills from an existing profile
 * when editing.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";

import { VENUE_TYPES } from "@/lib/venue-types";

type InitialProfile = {
  name: string;
  type: string;
  seatsCapacity: number | null;
  avgSpendPerHead: number | null;
  targetLabourPct: number | null;
  tradingDays: number | null;
} | null;

const TYPE_LABELS: Record<string, string> = {
  restaurant: "Restaurant",
  bar: "Bar",
  cafe: "Cafe",
  pub: "Pub",
  hotel: "Hotel",
};

export function OnboardingForm({ initial }: { initial: InitialProfile }) {
  const router = useRouter();
  const editing = Boolean(initial);

  const [name, setName] = useState(initial?.name ?? "");
  const [type, setType] = useState(initial?.type ?? "");
  const [seats, setSeats] = useState(initial?.seatsCapacity?.toString() ?? "");
  const [sph, setSph] = useState(initial?.avgSpendPerHead?.toString() ?? "");
  const [labourPct, setLabourPct] = useState(
    (initial?.targetLabourPct ?? 28).toString(),
  );
  const [tradingDays, setTradingDays] = useState(
    (initial?.tradingDays ?? 7).toString(),
  );

  const [status, setStatus] = useState<"idle" | "saving">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return setError("Please enter your venue name.");
    if (!type) return setError("Please choose your venue type.");

    setStatus("saving");
    try {
      const res = await fetch("/api/venue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          type,
          seatsCapacity: seats ? Number(seats) : null,
          avgSpendPerHead: sph ? Number(sph) : null,
          targetLabourPct: labourPct ? Number(labourPct) : 28,
          tradingDays: tradingDays ? Number(tradingDays) : 7,
        }),
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
    <form onSubmit={onSubmit} className="space-y-7">
      {/* Venue name */}
      <Field label="Venue name" htmlFor="venue-name" required>
        <input
          id="venue-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. The Corner Bistro"
          className={inputCls}
          autoFocus
        />
      </Field>

      {/* Type — segmented */}
      <Field label="Venue type" required>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {VENUE_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${
                type === t
                  ? "border-[color:var(--accent)] bg-[color:var(--accent-dim)] text-fg-primary"
                  : "border-[color:var(--border-default)] text-fg-secondary hover:border-[color:var(--border-strong)]"
              }`}
            >
              {TYPE_LABELS[t]}
            </button>
          ))}
        </div>
      </Field>

      <div className="grid gap-7 sm:grid-cols-2">
        <Field label="Seats / covers capacity" htmlFor="seats" hint="Optional">
          <input
            id="seats"
            inputMode="numeric"
            value={seats}
            onChange={(e) => setSeats(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="e.g. 120"
            className={inputCls}
          />
        </Field>
        <Field
          label="Avg spend per head ($)"
          htmlFor="sph"
          hint="Optional"
        >
          <input
            id="sph"
            inputMode="numeric"
            value={sph}
            onChange={(e) => setSph(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="e.g. 50"
            className={inputCls}
          />
        </Field>
      </div>

      <div className="grid gap-7 sm:grid-cols-2">
        <Field
          label="Target labour %"
          htmlFor="labour"
          hint="Industry default 28%"
        >
          <input
            id="labour"
            inputMode="numeric"
            value={labourPct}
            onChange={(e) =>
              setLabourPct(e.target.value.replace(/[^0-9]/g, ""))
            }
            placeholder="28"
            className={inputCls}
          />
        </Field>
        <Field label="Trading days / week" htmlFor="days">
          <input
            id="days"
            inputMode="numeric"
            value={tradingDays}
            onChange={(e) =>
              setTradingDays(e.target.value.replace(/[^0-9]/g, ""))
            }
            placeholder="7"
            className={inputCls}
          />
        </Field>
      </div>

      {error && (
        <p role="alert" className="text-sm text-[#e0533f]">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "saving"}
        className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-[color:var(--accent)] px-8 py-4 text-base font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-70 sm:w-auto"
      >
        {status === "saving"
          ? "Saving…"
          : editing
            ? "Save changes"
            : "Continue to your tools"}
        {status !== "saving" && <span aria-hidden>→</span>}
      </button>
    </form>
  );
}

const inputCls =
  "w-full rounded-xl border border-[color:var(--border-default)] bg-bg-elevated px-4 py-3 text-fg-primary placeholder:text-fg-muted focus:border-[color:var(--accent)] focus:outline-none transition-colors";

function Field({
  label,
  htmlFor,
  hint,
  required,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-2 flex items-baseline gap-2 text-sm font-medium text-fg-primary"
      >
        {label}
        {required && <span className="text-[color:var(--accent)]">*</span>}
        {hint && (
          <span className="text-xs font-normal text-fg-muted">{hint}</span>
        )}
      </label>
      {children}
    </div>
  );
}
