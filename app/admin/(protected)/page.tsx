import { requireAdmin } from "@/lib/admin/auth";
import {
  getOverview,
  type FunnelStage,
  type MonthPoint,
  type HealthBucket,
} from "@/lib/admin/overview";

export const dynamic = "force-dynamic";

function money(cents: number): string {
  return `$${Math.round(cents / 100).toLocaleString()}`;
}
function moneyWhole(n: number): string {
  return `$${Math.round(n).toLocaleString()}`;
}
function monthLabel(ym: string): string {
  const [y, m] = ym.split("-");
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleDateString("en-AU", { month: "short", year: "2-digit" });
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-[color:var(--border-subtle)] bg-bg-elevated p-5">
      <p className="text-[0.6rem] tracking-[0.18em] uppercase text-fg-muted mb-2">
        {label}
      </p>
      <p
        className={`text-2xl lg:text-3xl font-extrabold tabular-nums ${accent ? "text-[color:var(--accent)]" : "text-fg-primary"}`}
      >
        {value}
      </p>
    </div>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[color:var(--border-subtle)] bg-bg-elevated p-5 lg:p-6">
      <h2 className="text-[0.65rem] tracking-[0.18em] uppercase text-fg-muted font-semibold mb-5">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Funnel({ stages }: { stages: FunnelStage[] }) {
  const top = stages[0]?.count || 1;
  return (
    <ul className="space-y-2.5">
      {stages.map((s, i) => {
        const pctOfTop = Math.round((s.count / top) * 100);
        const prev = i > 0 ? stages[i - 1].count : null;
        const conv = prev && prev > 0 ? Math.round((s.count / prev) * 100) : null;
        return (
          <li key={s.label}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-fg-secondary">{s.label}</span>
              <span className="tabular-nums text-fg-tertiary">
                {s.count}
                {conv !== null && (
                  <span className="ml-2 text-xs text-fg-muted">{conv}%</span>
                )}
              </span>
            </div>
            <div className="h-2 rounded-full bg-bg-base overflow-hidden">
              <div
                className="h-full rounded-full bg-[color:var(--accent)]"
                style={{ width: `${Math.max(2, pctOfTop)}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function Bars({
  points,
  format,
}: {
  points: { label: string; value: number }[];
  format: (n: number) => string;
}) {
  const max = Math.max(1, ...points.map((p) => p.value));
  if (points.length === 0)
    return <p className="text-sm text-fg-muted">No data yet.</p>;
  return (
    <div className="flex items-end gap-3 h-44">
      {points.map((p) => (
        <div key={p.label} className="flex-1 flex flex-col items-center gap-2">
          <span className="text-[0.6rem] tabular-nums text-fg-tertiary">
            {format(p.value)}
          </span>
          <div className="w-full flex items-end h-32">
            <div
              className="w-full rounded-t bg-[color:var(--accent)]/80"
              style={{ height: `${Math.max(3, (p.value / max) * 100)}%` }}
            />
          </div>
          <span className="text-[0.6rem] text-fg-muted">{p.label}</span>
        </div>
      ))}
    </div>
  );
}

export default async function AdminOverviewPage() {
  await requireAdmin();
  const o = await getOverview();

  return (
    <div className="max-w-[1200px] mx-auto">
      <p className="eyebrow mb-3">Overview</p>
      <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-fg-primary mb-8">
        Dashboards
      </h1>

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Stat label="Leads" value={o.totals.leads.toLocaleString()} />
        <Stat label="Customers" value={o.totals.customers.toLocaleString()} />
        <Stat label="Net revenue" value={money(o.totals.revenueCents)} />
        <Stat label="$ Identified (all venues)" value={moneyWhole(o.totals.identified)} />
        <Stat label="$ Recovered (all venues)" value={moneyWhole(o.totals.recovered)} accent />
        <Stat
          label="Refund rate"
          value={`${o.totals.refundRatePct}% · ${o.totals.refunds}`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* 1. Funnel */}
        <Card title="Funnel conversion">
          <Funnel stages={o.funnel} />
        </Card>

        {/* 2. Onboard completion */}
        <Card title="Onboard completion">
          <div className="flex items-baseline gap-3 mb-3">
            <span className="text-4xl font-extrabold text-fg-primary tabular-nums">
              {o.onboardCompletionPct}%
            </span>
            <span className="text-sm text-fg-tertiary">
              of customers set up their venue
            </span>
          </div>
          <div className="h-2 rounded-full bg-bg-base overflow-hidden">
            <div
              className="h-full rounded-full bg-[color:var(--accent)]"
              style={{ width: `${o.onboardCompletionPct}%` }}
            />
          </div>
          <p className="text-xs text-fg-muted mt-3">
            {o.totals.onboarded} of {o.totals.customers} customers onboarded.
          </p>
        </Card>

        {/* 3. Revenue over time */}
        <Card title="Revenue over time">
          <Bars
            points={o.revenueByMonth.map((p: MonthPoint) => ({
              label: monthLabel(p.month),
              value: p.value,
            }))}
            format={(n) => money(n)}
          />
        </Card>

        {/* 5. Health-score distribution */}
        <Card title="Health-score distribution">
          <Bars
            points={o.healthDistribution.map((b: HealthBucket) => ({
              label: b.label,
              value: b.count,
            }))}
            format={(n) => `${n}`}
          />
        </Card>
      </div>

      {/* 7. Cohort retention */}
      <div className="mt-4">
        <Card title="Cohorts by signup month">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="text-left text-fg-muted text-xs">
                  <th className="pb-2 font-medium">Cohort</th>
                  <th className="pb-2 font-medium text-right">Leads</th>
                  <th className="pb-2 font-medium text-right">Customers</th>
                  <th className="pb-2 font-medium text-right">Onboarded</th>
                  <th className="pb-2 font-medium text-right">Used a tool</th>
                </tr>
              </thead>
              <tbody>
                {o.cohorts.map((c) => (
                  <tr
                    key={c.month}
                    className="border-t border-[color:var(--border-subtle)]"
                  >
                    <td className="py-2 text-fg-secondary">{monthLabel(c.month)}</td>
                    <td className="py-2 text-right tabular-nums text-fg-secondary">{c.leads}</td>
                    <td className="py-2 text-right tabular-nums text-fg-secondary">{c.customers}</td>
                    <td className="py-2 text-right tabular-nums text-fg-secondary">{c.onboarded}</td>
                    <td className="py-2 text-right tabular-nums text-fg-secondary">{c.ranTool}</td>
                  </tr>
                ))}
                {o.cohorts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-fg-muted">
                      No cohorts yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
