/**
 * Menu Margin Trap Fixer — computation.
 *
 * Source: Tool 3 (Menu Margin Trap Fixer + Recipe Margin Calculator).
 * Per menu item the operator enters true cost (ingredient + prep labour +
 * overhead), sell price, and — optionally — monthly units sold. We compute
 * gross profit, GP% and COGS% per item, and the annual margin leak: for any
 * item below the target GP%, the per-unit shortfall × annual volume.
 *
 * Hybrid $ rule (per spec): the tool only produces a dollar figure when at
 * least one item has volume. With no volume it's a margin-health view and
 * contributes nothing to $ Identified (the diagnostic already scores the
 * Menu Profitability leak's health).
 *
 * Pure functions — shared between the client (live) and the server
 * (authoritative $ on save).
 */

export const DEFAULT_TARGET_GP_PCT = 70;

export type MenuItem = {
  name: string;
  cost: number; // ingredient cost $
  labour: number; // prep labour $
  overhead: number; // allocated overhead $
  sell: number; // sell price $
  units: number; // monthly units sold (0 = not provided)
};

export type MenuItemComputed = MenuItem & {
  totalCost: number;
  gpDollar: number; // gross profit per unit
  gpPct: number;
  cogsPct: number;
  belowTarget: boolean;
  annualLeak: number; // margin shortfall to target × annual volume
};

export type MenuTotals = {
  annualLeak: number;
  avgGpPct: number;
  itemsBelowTarget: number;
  hasVolume: boolean;
  pricedItems: number;
};

export function computeItem(
  it: MenuItem,
  targetGpPct: number,
): MenuItemComputed {
  const totalCost = it.cost + it.labour + it.overhead;
  const gpDollar = it.sell - totalCost;
  const gpPct = it.sell > 0 ? (gpDollar / it.sell) * 100 : 0;
  const cogsPct = it.sell > 0 ? (totalCost / it.sell) * 100 : 0;
  const targetGpDollar = it.sell * (targetGpPct / 100);
  const perUnitGap = Math.max(0, targetGpDollar - gpDollar);
  const annualLeak = perUnitGap * it.units * 12;
  return {
    ...it,
    totalCost,
    gpDollar,
    gpPct,
    cogsPct,
    belowTarget: it.sell > 0 && gpPct < targetGpPct,
    annualLeak,
  };
}

export function computeMenu(
  items: MenuItem[],
  targetGpPct: number,
): { rows: MenuItemComputed[]; totals: MenuTotals } {
  const rows = items.map((it) => computeItem(it, targetGpPct));
  const priced = rows.filter((r) => r.sell > 0);
  const avgGpPct =
    priced.length > 0
      ? priced.reduce((s, r) => s + r.gpPct, 0) / priced.length
      : 0;
  return {
    rows,
    totals: {
      annualLeak: Math.round(rows.reduce((s, r) => s + r.annualLeak, 0)),
      avgGpPct,
      itemsBelowTarget: rows.filter((r) => r.belowTarget).length,
      hasVolume: rows.some((r) => r.units > 0),
      pricedItems: priced.length,
    },
  };
}

export function emptyMenuItems(n = 5): MenuItem[] {
  return Array.from({ length: n }, () => ({
    name: "",
    cost: 0,
    labour: 0,
    overhead: 0,
    sell: 0,
    units: 0,
  }));
}

// ─── Recipe Margin Calculator (companion utility) ───────────────────
// Cost a single dish from its ingredients: (pack cost / pack size) × qty
// per element → total cost → GP / margin against a sell price. A scratchpad
// that helps fill in an item's "true cost" above; not itself persisted.
export type RecipeElement = {
  name: string;
  packCost: number;
  packSize: number;
  qty: number;
};

export function computeElementCost(e: RecipeElement): number {
  return e.packSize > 0 ? (e.packCost / e.packSize) * e.qty : 0;
}

export function computeRecipe(
  elements: RecipeElement[],
  sellPrice: number,
): { totalCost: number; gpDollar: number; gpPct: number } {
  const totalCost = elements.reduce((s, e) => s + computeElementCost(e), 0);
  const gpDollar = sellPrice - totalCost;
  const gpPct = sellPrice > 0 ? (gpDollar / sellPrice) * 100 : 0;
  return { totalCost, gpDollar, gpPct };
}

export function emptyRecipeElements(n = 4): RecipeElement[] {
  return Array.from({ length: n }, () => ({
    name: "",
    packCost: 0,
    packSize: 0,
    qty: 0,
  }));
}
