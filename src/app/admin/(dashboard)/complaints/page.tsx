import Link from "next/link";
import DataTable from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";
import {
  ComplaintCreateForm,
  ComplaintStatusForm,
} from "@/components/admin/ComplaintForms";
import { requireAdminSession, formatUkDate } from "@/lib/admin/auth";
import type { Complaint } from "@/lib/admin/types";

export const metadata = { title: "Complaints" };

type SearchParams = { new?: string };

export default async function AdminComplaintsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { supabase } = await requireAdminSession();

  const { data } = await supabase
    .from("complaints")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  const complaints = (data || []) as Complaint[];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-label">Quality</p>
          <h1 className="heading-lg">Complaints</h1>
          <p className="mt-2 text-sm text-dark/70">
            Track, investigate, and resolve client concerns promptly.
          </p>
        </div>
        <Link href="/admin/complaints?new=1" className="btn-navy w-fit">
          Log complaint
        </Link>
      </div>

      {searchParams.new === "1" ? <ComplaintCreateForm /> : null}

      <DataTable
        rowKey={(row) => row.id}
        rows={complaints}
        columns={[
          {
            key: "client",
            header: "Client",
            cell: (row) => (
              <div>
                <p className="font-semibold text-navy">{row.client_name}</p>
                <p className="text-xs text-dark/60">{row.client_email}</p>
              </div>
            ),
          },
          {
            key: "text",
            header: "Complaint",
            cell: (row) => (
              <p className="max-w-md text-sm text-dark/80">
                {row.complaint_text.slice(0, 160)}
                {row.complaint_text.length > 160 ? "…" : ""}
              </p>
            ),
          },
          {
            key: "status",
            header: "Status",
            cell: (row) => <StatusBadge value={row.status} />,
          },
          {
            key: "created",
            header: "Logged",
            cell: (row) => formatUkDate(row.created_at),
          },
          {
            key: "actions",
            header: "Resolve",
            cell: (row) => <ComplaintStatusForm complaint={row} />,
          },
        ]}
      />
    </div>
  );
}
