import { requireAdmin } from "@/lib/admin/auth";
import { listCustomers } from "@/lib/admin/customers";
import { CustomersTable } from "@/components/admin/CustomersTable";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  await requireAdmin();
  const rows = await listCustomers();

  return (
    <div className="max-w-[1200px] mx-auto">
      <p className="eyebrow mb-3">Customers</p>
      <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-fg-primary mb-2">
        Customers
      </h1>
      <p className="text-fg-tertiary mb-8">
        Every lead and customer. Search, filter by status, or jump to an
        outreach segment.
      </p>
      <CustomersTable rows={rows} />
    </div>
  );
}
