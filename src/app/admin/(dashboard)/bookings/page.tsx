import Link from "next/link";
import { Plus } from "lucide-react";
import DataTable from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";
import { requireAdminSession, formatGbp, formatUkDate } from "@/lib/admin/auth";
import {
  SERVICE_LABELS,
  type Booking,
  type ServiceInterest,
} from "@/lib/admin/types";

export const metadata = { title: "Bookings" };

type SearchParams = { status?: string; from?: string; to?: string };

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { supabase } = await requireAdminSession();

  let query = supabase
    .from("bookings")
    .select("*, clients(contact_name, company_name)")
    .order("booking_date", { ascending: true })
    .limit(300);

  if (searchParams.status) query = query.eq("status", searchParams.status);
  if (searchParams.from) query = query.gte("booking_date", searchParams.from);
  if (searchParams.to) query = query.lte("booking_date", searchParams.to);

  const { data } = await query;
  const bookings = (data || []) as Booking[];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-label">Operations</p>
          <h1 className="heading-lg">Bookings</h1>
          <p className="mt-2 text-sm text-dark/70">
            Schedule, assign crews, and track job progress.
          </p>
        </div>
        <Link href="/admin/bookings/new" className="btn-navy inline-flex w-fit items-center gap-2">
          <Plus className="h-4 w-4" aria-hidden />
          New booking
        </Link>
      </div>

      <form className="grid gap-3 rounded-2xl border border-navy/8 bg-white p-4 shadow-soft sm:grid-cols-4">
        <select
          name="status"
          defaultValue={searchParams.status || ""}
          className="rounded-xl border border-navy/15 px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          {[
            "pending",
            "confirmed",
            "in_progress",
            "completed",
            "cancelled",
            "rescheduled",
          ].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <input
          type="date"
          name="from"
          defaultValue={searchParams.from || ""}
          className="rounded-xl border border-navy/15 px-3 py-2 text-sm"
        />
        <input
          type="date"
          name="to"
          defaultValue={searchParams.to || ""}
          className="rounded-xl border border-navy/15 px-3 py-2 text-sm"
        />
        <button type="submit" className="btn-navy">
          Filter
        </button>
      </form>

      <DataTable
        rowKey={(row) => row.id}
        rows={bookings}
        columns={[
          {
            key: "client",
            header: "Client / site",
            cell: (row) => (
              <Link
                href={`/admin/bookings/${row.id}`}
                className="font-semibold text-navy hover:text-teal"
              >
                {row.clients?.company_name ||
                  row.clients?.contact_name ||
                  row.property_address ||
                  "Booking"}
              </Link>
            ),
          },
          {
            key: "service",
            header: "Service",
            cell: (row) =>
              row.service_type
                ? SERVICE_LABELS[row.service_type as ServiceInterest]
                : "—",
          },
          {
            key: "when",
            header: "When",
            cell: (row) => (
              <span>
                {formatUkDate(row.booking_date)} · {row.start_time?.slice(0, 5)}
              </span>
            ),
          },
          {
            key: "status",
            header: "Status",
            cell: (row) => <StatusBadge value={row.status} />,
          },
          {
            key: "quote",
            header: "Quote",
            cell: (row) => formatGbp(row.price_quote),
          },
        ]}
      />
    </div>
  );
}
