import Link from "next/link";
import { Plus } from "lucide-react";
import DataTable from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";
import { requireAdminSession, formatUkDate } from "@/lib/admin/auth";
import {
  LEAD_STATUSES,
  SERVICE_LABELS,
  type Lead,
  type ServiceInterest,
} from "@/lib/admin/types";
import LeadCreateForm from "@/components/admin/LeadCreateForm";

export const metadata = { title: "Leads" };

type SearchParams = { status?: string; q?: string; new?: string };

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { supabase } = await requireAdminSession();

  let query = supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (searchParams.status) {
    query = query.eq("status", searchParams.status);
  }
  if (searchParams.q) {
    const q = searchParams.q.trim();
    query = query.or(
      `name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`
    );
  }

  const { data } = await query;
  const leads = (data || []) as Lead[];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-label">CRM</p>
          <h1 className="heading-lg">Lead management</h1>
          <p className="mt-2 text-sm text-dark/70">
            Website enquiries and outbound opportunities.
          </p>
        </div>
        <Link
          href="/admin/leads?new=1"
          className="btn-navy inline-flex w-fit items-center gap-2"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Add lead
        </Link>
      </div>

      <form className="flex flex-col gap-3 rounded-2xl border border-navy/8 bg-white p-4 shadow-soft sm:flex-row">
        <input
          name="q"
          defaultValue={searchParams.q || ""}
          placeholder="Search name, email, phone"
          className="flex-1 rounded-xl border border-navy/15 px-3 py-2 text-sm outline-none ring-teal focus:ring-2"
        />
        <select
          name="status"
          defaultValue={searchParams.status || ""}
          className="rounded-xl border border-navy/15 px-3 py-2 text-sm outline-none ring-teal focus:ring-2"
        >
          <option value="">All statuses</option>
          {LEAD_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button type="submit" className="btn-navy">
          Filter
        </button>
      </form>

      {searchParams.new === "1" ? <LeadCreateForm /> : null}

      <DataTable
        rowKey={(row) => row.id}
        rows={leads}
        columns={[
          {
            key: "name",
            header: "Name",
            cell: (row) => (
              <div>
                <Link
                  href={`/admin/leads/${row.id}`}
                  className="font-semibold text-navy hover:text-teal"
                >
                  {row.name}
                </Link>
                <p className="text-xs text-dark/60">{row.email}</p>
              </div>
            ),
          },
          {
            key: "service",
            header: "Service",
            cell: (row) =>
              row.service_interest
                ? SERVICE_LABELS[row.service_interest as ServiceInterest]
                : "—",
          },
          {
            key: "status",
            header: "Status",
            cell: (row) => <StatusBadge value={row.status} />,
          },
          {
            key: "priority",
            header: "Priority",
            cell: (row) => <StatusBadge value={row.priority} />,
          },
          {
            key: "created",
            header: "Created",
            cell: (row) => formatUkDate(row.created_at),
          },
        ]}
      />
    </div>
  );
}
