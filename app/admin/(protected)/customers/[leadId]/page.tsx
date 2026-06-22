import Link from "next/link";
import { notFound } from "next/navigation";

import { requireAdmin } from "@/lib/admin/auth";
import { getLeadById } from "@/lib/leads";

export const dynamic = "force-dynamic";

// Placeholder — the full customer picture (journey, venue profile, diagnostic,
// tools, $ figures, notes + flag) lands in Phase 3.
export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ leadId: string }>;
}) {
  await requireAdmin();
  const { leadId } = await params;
  const lead = await getLeadById(leadId);
  if (!lead) notFound();

  return (
    <div className="max-w-[1100px] mx-auto">
      <Link
        href="/admin/customers"
        className="inline-flex items-center gap-2 text-xs tracking-[0.16em] uppercase text-fg-tertiary hover:text-[color:var(--accent)] transition-colors mb-6"
      >
        <span aria-hidden>←</span> All customers
      </Link>
      <h1 className="text-3xl font-extrabold tracking-tight text-fg-primary mb-1">
        {lead.name || lead.email}
      </h1>
      <p className="text-fg-tertiary">{lead.email}</p>
      <p className="mt-8 text-sm text-fg-muted">
        Full customer detail — journey, venue profile, diagnostic, tool history,
        $ identified/recovered, notes and the attention flag — lands in the next
        update.
      </p>
    </div>
  );
}
