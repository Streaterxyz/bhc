/**
 * Dashboard $ aggregation — the honest model.
 *
 *   $ Identified (current) = Σ max(0, latest dollarsIdentified) per $-tool
 *                            — what you're leaking right now.
 *   $ Recovered            = Σ max(0, baseline − current) per $-tool
 *                            — measured improvement vs the first snapshot.
 *
 * Baseline = the oldest snapshot for the tool; current = the newest. As an
 * operator re-runs a calculator with better numbers month over month, the
 * gap closes and "recovered" climbs — proven by the version history.
 *
 * Only tools that produce hard dollars contribute (roster now; menu later).
 * Checklist tools feed the Health Score, not these figures.
 */

import { listSnapshots, type ToolKey } from "@/lib/tools/snapshots";

const DOLLAR_TOOLS: ToolKey[] = ["roster", "menu"];

export type ToolFigure = {
  tool: ToolKey;
  baseline: number; // dollarsIdentified at first snapshot
  current: number; // dollarsIdentified at latest snapshot
  recovered: number; // max(0, baseline − current)
  hasData: boolean;
};

export type DashboardFigures = {
  identified: number;
  recovered: number;
  perTool: Record<string, ToolFigure>;
};

export async function getDashboardFigures(
  leadId: string,
): Promise<DashboardFigures> {
  let identified = 0;
  let recovered = 0;
  const perTool: Record<string, ToolFigure> = {};

  for (const tool of DOLLAR_TOOLS) {
    // Newest first.
    const snaps = await listSnapshots(leadId, tool);
    if (snaps.length === 0) {
      perTool[tool] = {
        tool,
        baseline: 0,
        current: 0,
        recovered: 0,
        hasData: false,
      };
      continue;
    }
    const current = snaps[0].dollarsIdentified ?? 0;
    const baseline = snaps[snaps.length - 1].dollarsIdentified ?? 0;
    const toolRecovered = Math.max(0, baseline - current);

    identified += Math.max(0, current);
    recovered += toolRecovered;
    perTool[tool] = {
      tool,
      baseline,
      current,
      recovered: toolRecovered,
      hasData: true,
    };
  }

  return { identified, recovered, perTool };
}
