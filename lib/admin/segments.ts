/**
 * Customer row shape + outreach segments — client-safe (no DB imports), so
 * both the server aggregation (lib/admin/customers.ts) and the client table
 * can share the types + predicates.
 *
 * Dates are passed as epoch-ms numbers to keep the row trivially
 * serializable across the server/client boundary.
 */

export type CustomerStatus = "lead" | "customer" | "refunded";
export type EmailStatus = "active" | "unsubscribed" | "bounced";

export type CustomerRow = {
  leadId: string;
  email: string;
  name: string | null;
  status: CustomerStatus; // derived from purchases
  emailStatus: EmailStatus; // leads.status (bounce/complaint hygiene)
  onboarded: boolean; // has a venue profile
  hasDiagnostic: boolean; // ran the Top-5-Leaks diagnostic
  hasCalculator: boolean; // ran roster / menu / supplier
  healthScore: number | null; // latest diagnostic /100
  dollarsIdentified: number | null; // sum of latest $-tool figures
  source: string | null;
  createdAtMs: number;
  lastActivityMs: number;
};

/** A venue is a "whale" worth white-glove support at/above this $ identified. */
export const HIGH_DOLLAR_THRESHOLD = 20000;
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export type Segment = {
  id: string;
  label: string;
  description: string;
  predicate: (r: CustomerRow) => boolean;
};

/** High-value outreach lists, computed over the customer rows. */
export const SEGMENTS: Segment[] = [
  {
    id: "purchased-not-onboarded",
    label: "Purchased · not onboarded",
    description: "Paid but never set up their venue — at risk of never starting.",
    predicate: (r) => r.status === "customer" && !r.onboarded,
  },
  {
    id: "onboarded-no-diagnostic",
    label: "Onboarded · no diagnostic",
    description: "Set up their venue but haven't run the leak diagnostic yet.",
    predicate: (r) => r.onboarded && !r.hasDiagnostic,
  },
  {
    id: "diagnostic-no-calculator",
    label: "Diagnostic · no calculator",
    description: "Ran the diagnostic but never quantified a leak with a tool.",
    predicate: (r) => r.hasDiagnostic && !r.hasCalculator,
  },
  {
    id: "high-dollar",
    label: "High $ identified",
    description: `Identified ≥ $${HIGH_DOLLAR_THRESHOLD.toLocaleString()}/yr — worth white-glove support.`,
    predicate: (r) => (r.dollarsIdentified ?? 0) >= HIGH_DOLLAR_THRESHOLD,
  },
  {
    id: "refunded",
    label: "Refunded",
    description: "Refunded — candidates for feedback / win-back.",
    predicate: (r) => r.status === "refunded",
  },
  {
    id: "going-quiet",
    label: "Going quiet (30d+)",
    description: "A customer with no activity in 30+ days.",
    predicate: (r) =>
      r.status === "customer" && Date.now() - r.lastActivityMs > THIRTY_DAYS_MS,
  },
];

export function getSegment(id: string): Segment | undefined {
  return SEGMENTS.find((s) => s.id === id);
}
