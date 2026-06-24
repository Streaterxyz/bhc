/**
 * Silent Upsell System — definitions + scoring.
 *
 * The Profit Patch Kit "bonus" tool. Most venues think they have a sales
 * strategy because they have good staff — but without briefs, hero products,
 * scripts and consistent communication, every server delivers a different
 * guest experience and small missed opportunities add up to thousands lost.
 *
 * A health-only checklist (no $), mirroring the Supplier tool: it produces a
 * sales-health % (share of best practices in place). Questions are framed so
 * Yes = good practice, No = a gap.
 */

export type SilentUpsellSectionId = "silent-sales";

export type SilentUpsellSection = {
  id: SilentUpsellSectionId;
  title: string;
  intro: string;
  questions: string[];
};

export const SILENT_UPSELL_SECTIONS: SilentUpsellSection[] = [
  {
    id: "silent-sales",
    title: "Silent Sales Audit",
    intro: "Are you maximising revenue opportunities in every guest interaction?",
    questions: [
      "Do staff receive a pre-shift sales brief before every service?",
      "Is there a designated hero item promoted every shift?",
      "Do staff use a scripted recommendation for hero items?",
      "Are daily specials communicated to every guest?",
      "Do staff recommend an additional beverage during service?",
      "Are premium products actively featured in team briefings?",
      "Do managers track the performance of promoted items?",
      "Is average spend per cover tracked weekly?",
      "Do staff receive sales coaching at least monthly?",
      "Have you updated your sales scripts in the last 90 days?",
    ],
  },
];

export const SILENT_UPSELL_TOTAL_QUESTIONS = SILENT_UPSELL_SECTIONS.reduce(
  (n, s) => n + s.questions.length,
  0,
);

export type SilentUpsellAnswers = Record<
  SilentUpsellSectionId,
  (boolean | null)[]
>;

export function emptySilentUpsellAnswers(): SilentUpsellAnswers {
  return Object.fromEntries(
    SILENT_UPSELL_SECTIONS.map((s) => [s.id, s.questions.map(() => null)]),
  ) as SilentUpsellAnswers;
}

export type SilentUpsellResult = {
  score: number; // 0–100, share of best practices in place
  yesCount: number;
  total: number;
  isComplete: boolean;
};

export function scoreSilentUpsell(
  answers: SilentUpsellAnswers,
): SilentUpsellResult {
  let yesCount = 0;
  let answered = 0;
  for (const s of SILENT_UPSELL_SECTIONS) {
    for (const a of answers[s.id] ?? []) {
      if (a === true) yesCount++;
      if (a === true || a === false) answered++;
    }
  }
  return {
    score: Math.round((yesCount / SILENT_UPSELL_TOTAL_QUESTIONS) * 100),
    yesCount,
    total: SILENT_UPSELL_TOTAL_QUESTIONS,
    isComplete: answered === SILENT_UPSELL_TOTAL_QUESTIONS,
  };
}
