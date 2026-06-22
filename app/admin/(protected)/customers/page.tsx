import { requireAdmin } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

// Placeholder — the searchable customers list + segments land in Phase 2.
export default async function AdminCustomersPage() {
  await requireAdmin();

  return (
    <div className="max-w-[1100px] mx-auto">
      <p className="eyebrow mb-3">Customers</p>
      <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-fg-primary mb-2">
        Customers
      </h1>
      <p className="text-fg-tertiary">
        The searchable list, status filters and outreach segments are coming in
        the next update.
      </p>
    </div>
  );
}
