import Link from "next/link";
import { Plus } from "lucide-react";
import DataTable from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";
import ClientCreateForm from "@/components/admin/ClientCreateForm";
import { requireAdminSession, formatUkDate } from "@/lib/admin/auth";
import type { Client } from "@/lib/admin/types";

export const metadata = { title: "Clients" };

type SearchParams = { q?: string; new?: string };

export default async function AdminClientsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { supabase } = await requireAdminSession();

  let query = supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(300);

  if (searchParams.q) {
    const q = searchParams.q.trim();
    query = query.or(
      `contact_name.ilike.%${q}%,company_name.ilike.%${q}%,email.ilike.%${q}%`
    );
  }

  const { data } = await query;
  const clients = (data || []) as Client[];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-label">CRM</p>
          <h1 className="heading-lg">Clients</h1>
          <p className="mt-2 text-sm text-dark/70">
            Active accounts and service history.
          </p>
        </div>
        <Link
          href="/admin/clients?new=1"
          className="btn-navy inline-flex w-fit items-center gap-2"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Add client
        </Link>
      </div>

      <form className="flex flex-col gap-3 rounded-2xl border border-navy/8 bg-white p-4 shadow-soft sm:flex-row">
        <input
          name="q"
          defaultValue={searchParams.q || ""}
          placeholder="Search clients"
          className="flex-1 rounded-xl border border-navy/15 px-3 py-2 text-sm"
        />
        <button type="submit" className="btn-navy">
          Search
        </button>
      </form>

      {searchParams.new === "1" ? <ClientCreateForm /> : null}

      <DataTable
        rowKey={(row) => row.id}
        rows={clients}
        columns={[
          {
            key: "name",
            header: "Client",
            cell: (row) => (
              <div>
                <Link
                  href={`/admin/clients/${row.id}`}
                  className="font-semibold text-navy hover:text-teal"
                >
                  {row.company_name || row.contact_name}
                </Link>
                <p className="text-xs text-dark/60">{row.contact_name}</p>
              </div>
            ),
          },
          {
            key: "email",
            header: "Email",
            cell: (row) => row.email,
          },
          {
            key: "city",
            header: "Location",
            cell: (row) =>
              [row.city, row.postcode].filter(Boolean).join(", ") || "—",
          },
          {
            key: "status",
            header: "Status",
            cell: (row) => <StatusBadge value={row.status} />,
          },
          {
            key: "created",
            header: "Since",
            cell: (row) => formatUkDate(row.created_at),
          },
        ]}
      />
    </div>
  );
}
