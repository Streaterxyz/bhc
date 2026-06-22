import Link from "next/link";

import { requireAdmin } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const admin = await requireAdmin();

  return (
    <div className="max-w-[1100px] mx-auto">
      <p className="eyebrow mb-3">Admin Portal</p>
      <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-fg-primary mb-2">
        Welcome back.
      </h1>
      <p className="text-fg-tertiary mb-10">
        Signed in as {admin.email}.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/customers"
          className="group rounded-2xl border border-[color:var(--border-subtle)] bg-bg-elevated p-6 transition-colors hover:border-[color:var(--border-default)]"
        >
          <p className="text-[0.65rem] tracking-[0.18em] uppercase text-[color:var(--accent)] font-semibold mb-3">
            Customers
          </p>
          <h2 className="text-xl font-extrabold tracking-tight text-fg-primary mb-1">
            Browse every lead &amp; customer
          </h2>
          <p className="text-sm text-fg-tertiary">
            Search, filter and drill into any venue&apos;s full picture for
            personalised support.
          </p>
        </Link>

        <div className="rounded-2xl border border-dashed border-[color:var(--border-subtle)] bg-bg-base p-6">
          <p className="text-[0.65rem] tracking-[0.18em] uppercase text-fg-muted font-semibold mb-3">
            Dashboards
          </p>
          <h2 className="text-xl font-extrabold tracking-tight text-fg-secondary mb-1">
            Insights &amp; trends
          </h2>
          <p className="text-sm text-fg-muted">
            Funnel conversion, revenue, aggregate $ identified, health-score
            distribution and more — landing in a later update.
          </p>
        </div>
      </div>
    </div>
  );
}
