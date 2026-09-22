import Link from "next/link";
import { notFound } from "next/navigation";
import StatusBadge from "@/components/admin/StatusBadge";
import DataTable from "@/components/admin/DataTable";
import { requireAdminSession, formatGbp, formatUkDate } from "@/lib/admin/auth";
import type { Booking, Client, Invoice } from "@/lib/admin/types";

type Params = { params: { id: string } };

export default async function AdminClientDetailPage({ params }: Params) {
  const { supabase } = await requireAdminSession();

  const [{ data: client }, { data: bookings }, { data: invoices }] =
    await Promise.all([
      supabase.from("clients").select("*").eq("id", params.id).maybeSingle(),
      supabase
        .from("bookings")
        .select("*")
        .eq("client_id", params.id)
        .order("booking_date", { ascending: false }),
      supabase
        .from("invoices")
        .select("*")
        .eq("client_id", params.id)
        .order("issue_date", { ascending: false }),
    ]);

  if (!client) notFound();
  const row = client as Client;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/clients" className="text-sm font-semibold text-teal">
          ← Back to clients
        </Link>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="heading-lg">
              {row.company_name || row.contact_name}
            </h1>
            <p className="mt-1 text-sm text-dark/70">{row.email}</p>
          </div>
          <StatusBadge value={row.status} />
        </div>
      </div>

      <section className="rounded-2xl border border-navy/8 bg-white p-5 shadow-soft">
        <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-dark/60">Contact</dt>
            <dd className="font-semibold text-navy">{row.contact_name}</dd>
          </div>
          <div>
            <dt className="text-dark/60">Phone</dt>
            <dd className="font-semibold text-navy">{row.phone || "—"}</dd>
          </div>
          <div>
            <dt className="text-dark/60">Address</dt>
            <dd className="font-semibold text-navy">
              {[row.address, row.city, row.postcode].filter(Boolean).join(", ") ||
                "—"}
            </dd>
          </div>
        </dl>
        {row.notes ? (
          <p className="mt-4 whitespace-pre-wrap text-sm text-dark/80">
            {row.notes}
          </p>
        ) : null}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold text-navy">Bookings</h2>
          <Link href="/admin/bookings/new" className="text-sm font-semibold text-teal">
            New booking
          </Link>
        </div>
        <DataTable
          rowKey={(b) => b.id}
          rows={(bookings || []) as Booking[]}
          emptyMessage="No bookings for this client."
          columns={[
            {
              key: "date",
              header: "Date",
              cell: (b) => (
                <Link
                  href={`/admin/bookings/${b.id}`}
                  className="font-semibold text-navy hover:text-teal"
                >
                  {formatUkDate(b.booking_date)}
                </Link>
              ),
            },
            {
              key: "status",
              header: "Status",
              cell: (b) => <StatusBadge value={b.status} />,
            },
            {
              key: "quote",
              header: "Quote",
              cell: (b) => formatGbp(b.price_quote),
            },
          ]}
        />
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-lg font-bold text-navy">Invoices</h2>
        <DataTable
          rowKey={(inv) => inv.id}
          rows={(invoices || []) as Invoice[]}
          emptyMessage="No invoices for this client."
          columns={[
            {
              key: "number",
              header: "Invoice",
              cell: (inv) => inv.invoice_number,
            },
            {
              key: "total",
              header: "Total",
              cell: (inv) => formatGbp(inv.total_amount),
            },
            {
              key: "status",
              header: "Status",
              cell: (inv) => <StatusBadge value={inv.status} />,
            },
          ]}
        />
      </section>
    </div>
  );
}
