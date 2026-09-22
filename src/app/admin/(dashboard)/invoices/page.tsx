import Link from "next/link";
import DataTable from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";
import InvoiceCreateForm from "@/components/admin/InvoiceCreateForm";
import InvoiceStatusForm from "@/components/admin/InvoiceStatusForm";
import { requireAdminSession, formatGbp, formatUkDate } from "@/lib/admin/auth";
import type { Client, Invoice } from "@/lib/admin/types";

export const metadata = { title: "Invoices" };

type SearchParams = { new?: string; status?: string };

export default async function AdminInvoicesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { supabase } = await requireAdminSession([
    "admin",
    "manager",
    "finance",
  ]);

  let query = supabase
    .from("invoices")
    .select("*")
    .order("issue_date", { ascending: false })
    .limit(300);

  if (searchParams.status) query = query.eq("status", searchParams.status);

  const [{ data: invoices }, { data: clients }] = await Promise.all([
    query,
    supabase.from("clients").select("*").eq("status", "active").order("contact_name"),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-label">Finance</p>
          <h1 className="heading-lg">Invoices</h1>
          <p className="mt-2 text-sm text-dark/70">
            UK VAT-aware invoices with sequential numbering.
          </p>
        </div>
        <Link href="/admin/invoices?new=1" className="btn-navy w-fit">
          New invoice
        </Link>
      </div>

      <form className="flex gap-3 rounded-2xl border border-navy/8 bg-white p-4 shadow-soft">
        <select
          name="status"
          defaultValue={searchParams.status || ""}
          className="rounded-xl border border-navy/15 px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          {["draft", "sent", "paid", "overdue", "cancelled"].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button type="submit" className="btn-navy">
          Filter
        </button>
      </form>

      {searchParams.new === "1" ? (
        <InvoiceCreateForm clients={(clients || []) as Client[]} />
      ) : null}

      <DataTable
        rowKey={(row) => row.id}
        rows={(invoices || []) as Invoice[]}
        columns={[
          {
            key: "number",
            header: "Invoice",
            cell: (row) => (
              <div>
                <p className="font-semibold text-navy">{row.invoice_number}</p>
                <p className="text-xs text-dark/60">{row.client_name}</p>
              </div>
            ),
          },
          {
            key: "dates",
            header: "Dates",
            cell: (row) => (
              <span className="text-sm">
                {formatUkDate(row.issue_date)} → {formatUkDate(row.due_date)}
              </span>
            ),
          },
          {
            key: "total",
            header: "Total",
            cell: (row) => formatGbp(row.total_amount),
          },
          {
            key: "status",
            header: "Status",
            cell: (row) => <StatusBadge value={row.status} />,
          },
          {
            key: "actions",
            header: "Update",
            cell: (row) => <InvoiceStatusForm invoice={row} />,
          },
        ]}
      />
    </div>
  );
}
