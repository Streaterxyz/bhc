/**
 * Top 5 Leaks Diagnostic — definitions + scoring.
 *
 * Source: Tool 1 (Top 5 Leaks Checklist). Questions are reframed as
 * best-practice checks so the answer maps consistently: **Yes = good
 * practice, No = a gap (leak indicator).** Severity per leak = % of "No";
 * Venue Health Score weights each of the 5 leaks equally (20 pts each).
 *
 * Shared between client (live scoring as you answer) and server (persisted
 * to tool_snapshots).
 */

export type LeakId =
  | "revenue-capping"
  | "labour-modelling"
  | "staff-pos"
  | "stock-accountability"
  | "menu-profitability";

export type Leak = {
  id: LeakId;
  number: number;
  title: string;
  /** One-line framing shown under the title. */
  intro: string;
  /** Where a high-severity result routes the operator next. */
  routesTo: { label: string; href: string | null };
  /** Best-practice checks. Yes = good, No = gap. */
  questions: string[];
};

export const LEAKS: Leak[] = [
  {
    id: "revenue-capping",
    number: 1,
    title: "Revenue Capping",
    intro: "Are you limiting how much revenue you can generate?",
    routesTo: {
      label: "Maximising Covers playbook",
      href: "/app/playbooks/maximising-covers",
    },
    questions: [
      "Do you know your maximum cover capacity per service?",
      "Do you achieve at least 90% of that capacity weekly?",
      "Do you track average spend per cover weekly?",
      "Do you track table turn times weekly?",
      "Are tables reseated within 10 minutes during peak periods?",
      "Do you maintain an active waitlist during peak periods?",
      "Do you measure staff upselling performance?",
      "Have you increased booking caps in the last 12 months?",
      "Can your team handle 10% more covers today?",
      "Have you tested your true operational capacity in the last 90 days?",
    ],
  },
  {
    id: "labour-modelling",
    number: 2,
    title: "Labour Modelling",
    intro: "Are you staffing in a way that reflects service needs and demand?",
    routesTo: { label: "Roster Waste Calculator", href: "/app/roster" },
    questions: [
      "Do you have a flexible mix of full-time and casual staff?",
      "Can you scale staffing down when trade is light?",
      "Do you monitor covers-per-staff ratios regularly?",
      "Are staggered shifts being used effectively?",
    ],
  },
  {
    id: "staff-pos",
    number: 3,
    title: "Staff Training & POS Efficiency",
    intro: "Is your team trained to use the tools that drive revenue?",
    routesTo: {
      label: "Staff Training playbook",
      href: "/app/playbooks/staff-training",
    },
    questions: [
      "Can all staff efficiently navigate the POS?",
      "Is service free of delays caused by tech inefficiencies?",
      "Are staff allocation decisions based on capability rather than guesswork?",
      "Are new staff trained on both customer service and POS fluency?",
      "Do you have error-reduction protocols in place?",
    ],
  },
  {
    id: "stock-accountability",
    number: 4,
    title: "Stock Accountability",
    intro: "Are you in control of your stock from delivery to pour?",
    routesTo: { label: "Supplier Cost Leak Detector", href: "/app/supplier" },
    questions: [
      "Have you conducted a full stocktake in the past 30 days?",
      "Are you tracking stock variances weekly (or at least monthly)?",
      "Do you record over-pouring, breakage, and misplacement?",
      "Are your storage locations efficient and secure?",
    ],
  },
  {
    id: "menu-profitability",
    number: 5,
    title: "Menu Profitability",
    intro: "Are your most popular items also your most profitable?",
    routesTo: { label: "Menu Margin Trap Fixer", href: "/app/menu" },
    questions: [
      "Do you know the GP% on every dish and drink?",
      "Are you promoting high-margin items across FOH and digital?",
      "Are you confident your signature items aren't bleeding margin?",
      "Have you done a recent menu costing & engineering review?",
    ],
  },
];

export const LEAK_BY_ID: Record<LeakId, Leak> = Object.fromEntries(
  LEAKS.map((l) => [l.id, l]),
) as Record<LeakId, Leak>;

export const TOTAL_QUESTIONS = LEAKS.reduce(
  (n, l) => n + l.questions.length,
  0,
);

// ─── Answers + scoring ──────────────────────────────────────────────
// Per leak: an array aligned to `questions`, each true (Yes) / false (No)
// / null (unanswered). null counts as a gap for the live score, but a
// snapshot can only be saved once every question is answered.
export type DiagnosticAnswers = Record<LeakId, (boolean | null)[]>;

export type Severity = "low" | "medium" | "high";

export type LeakResult = {
  id: LeakId;
  yesCount: number;
  total: number;
  /** % of questions flagged as a gap (No or unanswered). */
  gapPct: number;
  severity: Severity;
  /** Contribution to the /100 health score (each leak worth 20). */
  points: number;
};

export function emptyAnswers(): DiagnosticAnswers {
  return Object.fromEntries(
    LEAKS.map((l) => [l.id, l.questions.map(() => null)]),
  ) as DiagnosticAnswers;
}

export function severityBand(gapPct: number): Severity {
  if (gapPct <= 33) return "low";
  if (gapPct <= 66) return "medium";
  return "high";
}

export function scoreLeak(id: LeakId, answers: (boolean | null)[]): LeakResult {
  const total = answers.length;
  const yesCount = answers.filter((a) => a === true).length;
  const gapPct = total === 0 ? 0 : Math.round(((total - yesCount) / total) * 100);
  const points = total === 0 ? 0 : (yesCount / total) * 20;
  return {
    id,
    yesCount,
    total,
    gapPct,
    severity: severityBand(gapPct),
    points,
  };
}

export function scoreAll(answers: DiagnosticAnswers): LeakResult[] {
  return LEAKS.map((l) => scoreLeak(l.id, answers[l.id] ?? []));
}

/** Venue Health Score /100 — each leak weighted equally (20 pts). */
export function computeHealthScore(answers: DiagnosticAnswers): number {
  const total = scoreAll(answers).reduce((sum, r) => sum + r.points, 0);
  return Math.round(total);
}

/** True once every question across every leak has a yes/no answer. */
export function isComplete(answers: DiagnosticAnswers): boolean {
  return LEAKS.every((l) =>
    (answers[l.id] ?? []).every((a) => a === true || a === false),
  );
}

export function answeredCount(answers: DiagnosticAnswers): number {
  return LEAKS.reduce(
    (n, l) =>
      n + (answers[l.id] ?? []).filter((a) => a === true || a === false).length,
    0,
  );
}
