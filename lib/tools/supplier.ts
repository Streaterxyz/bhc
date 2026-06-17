/**
 * Supplier Cost Leak Detector — definitions + scoring.
 *
 * Source: Tool 4. A checklist tool (Invoice Audit + Seasonal Adjustment)
 * plus copy-able Negotiation Scripts. Per the hybrid $ model this is
 * health-only — it produces a supplier-health % (share of best practices
 * in place), not a dollar figure. The Par-Level Calculator described in the
 * source is deferred.
 *
 * Checklist questions are framed so Yes = good practice, No = a gap.
 */

export type SupplierSectionId = "invoice-audit" | "seasonal-adjustment";

export type SupplierSection = {
  id: SupplierSectionId;
  title: string;
  intro: string;
  questions: string[];
};

export const SUPPLIER_SECTIONS: SupplierSection[] = [
  {
    id: "invoice-audit",
    title: "Invoice Audit",
    intro: "Find the hidden leaks buried in your supplier invoices.",
    questions: [
      "Do you review invoices line-by-line for items you don't need or didn't request?",
      "Have you eliminated paying for pre-prep (pre-cut veg, marinated meats) you could do in-house?",
      "Have you challenged supplier minimum-order quantities?",
      "Do you check invoices for freight or admin fees creeping in?",
      "Do you verify deliveries against what was actually ordered?",
      "Do you hold regular (monthly/seasonal) pricing reviews with suppliers?",
    ],
  },
  {
    id: "seasonal-adjustment",
    title: "Seasonal Adjustment",
    intro: "Prevent over-ordering and waste during low-volume periods.",
    questions: [
      "Do you adjust ingredient orders for seasonal menu changes?",
      "Do you adjust stock levels for weather-driven trade?",
      "Are major events (public holidays, finals) built into your forecasting?",
      "Have you pre-negotiated flexible volumes with suppliers for slow periods?",
    ],
  },
];

export const SUPPLIER_TOTAL_QUESTIONS = SUPPLIER_SECTIONS.reduce(
  (n, s) => n + s.questions.length,
  0,
);

export const NEGOTIATION_SCRIPTS: { context: string; script: string }[] = [
  {
    context: "Consolidating spend for a better rate",
    script:
      "We'd love to consolidate more of our ordering with you — but we need sharper pricing on [item] to make that happen.",
  },
  {
    context: "Pushing back on a price creep",
    script:
      "This price has crept up — we need it back to [amount] or we'll need to explore alternatives.",
  },
  {
    context: "Trading commitment for terms",
    script:
      "Can we look at moving this to a weekly standing order in exchange for better terms?",
  },
];

export type SupplierAnswers = Record<SupplierSectionId, (boolean | null)[]>;

export function emptySupplierAnswers(): SupplierAnswers {
  return Object.fromEntries(
    SUPPLIER_SECTIONS.map((s) => [s.id, s.questions.map(() => null)]),
  ) as SupplierAnswers;
}

export type SupplierResult = {
  score: number; // 0–100, share of best practices in place
  yesCount: number;
  total: number;
  isComplete: boolean;
};

export function scoreSupplier(answers: SupplierAnswers): SupplierResult {
  let yesCount = 0;
  let answered = 0;
  for (const s of SUPPLIER_SECTIONS) {
    for (const a of answers[s.id] ?? []) {
      if (a === true) yesCount++;
      if (a === true || a === false) answered++;
    }
  }
  return {
    score: Math.round((yesCount / SUPPLIER_TOTAL_QUESTIONS) * 100),
    yesCount,
    total: SUPPLIER_TOTAL_QUESTIONS,
    isComplete: answered === SUPPLIER_TOTAL_QUESTIONS,
  };
}
