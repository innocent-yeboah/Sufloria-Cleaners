import { requireAdminSession, formatGbp } from "@/lib/admin/auth";
import {
  SERVICE_LABELS,
  type ServiceInterest,
} from "@/lib/admin/types";

export const metadata = { title: "Reports" };

export default async function AdminReportsPage() {
  const { supabase } = await requireAdminSession([
    "admin",
    "manager",
    "finance",
  ]);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [
    { data: paidInvoices },
    { data: expenses },
    { data: leads },
    { data: bookings },
    { count: openComplaints },
  ] = await Promise.all([
    supabase
      .from("invoices")
      .select("total_amount, status, paid_at, amount, vat_amount")
      .eq("status", "paid")
      .gte("paid_at", startOfMonth.toISOString()),
    supabase
      .from("expenses")
      .select("amount, category")
      .gte("expense_date", startOfMonth.toISOString().slice(0, 10)),
    supabase.from("leads").select("status, service_interest"),
    supabase.from("bookings").select("status, service_type, final_price, price_quote"),
    supabase
      .from("complaints")
      .select("id", { count: "exact", head: true })
      .in("status", ["new", "acknowledged", "investigating"]),
  ]);

  const revenue = (paidInvoices || []).reduce(
    (sum, row) => sum + Number(row.total_amount || 0),
    0
  );
  const expenseTotal = (expenses || []).reduce(
    (sum, row) => sum + Number(row.amount || 0),
    0
  );
  const profit = revenue - expenseTotal;

  const leadStatuses = (leads || []).reduce<Record<string, number>>((acc, row) => {
    acc[row.status] = (acc[row.status] || 0) + 1;
    return acc;
  }, {});

  const serviceMix = (leads || []).reduce<Record<string, number>>((acc, row) => {
    const key = row.service_interest || "other";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const bookingStatuses = (bookings || []).reduce<Record<string, number>>(
    (acc, row) => {
      acc[row.status] = (acc[row.status] || 0) + 1;
      return acc;
    },
    {}
  );

  const expenseByCategory = (expenses || []).reduce<Record<string, number>>(
    (acc, row) => {
      const key = row.category || "other";
      acc[key] = (acc[key] || 0) + Number(row.amount || 0);
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="section-label">Analytics</p>
        <h1 className="heading-lg">Reports</h1>
        <p className="mt-2 text-sm text-dark/70">
          Month-to-date financial and operations snapshot.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Revenue (MTD)", value: formatGbp(revenue) },
          { label: "Expenses (MTD)", value: formatGbp(expenseTotal) },
          { label: "Profit (MTD)", value: formatGbp(profit) },
          { label: "Open complaints", value: openComplaints ?? 0 },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-navy/8 bg-white p-5 shadow-soft"
          >
            <p className="text-sm text-dark/60">{card.label}</p>
            <p className="mt-2 font-heading text-3xl font-bold text-navy">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ReportList title="Lead pipeline" rows={leadStatuses} />
        <ReportList title="Booking status" rows={bookingStatuses} />
        <ReportList
          title="Service interest"
          rows={Object.fromEntries(
            Object.entries(serviceMix).map(([k, v]) => [
              SERVICE_LABELS[k as ServiceInterest] || k,
              v,
            ])
          )}
        />
        <ReportList
          title="Expenses by category"
          rows={Object.fromEntries(
            Object.entries(expenseByCategory).map(([k, v]) => [
              k,
              formatGbp(v),
            ])
          )}
          valueIsString
        />
      </div>
    </div>
  );
}

function ReportList({
  title,
  rows,
  valueIsString,
}: {
  title: string;
  rows: Record<string, number | string>;
  valueIsString?: boolean;
}) {
  const entries = Object.entries(rows);
  return (
    <section className="rounded-2xl border border-navy/8 bg-white p-5 shadow-soft">
      <h2 className="font-heading text-lg font-bold text-navy">{title}</h2>
      <ul className="mt-4 space-y-2">
        {entries.length === 0 ? (
          <li className="text-sm text-dark/60">No data yet.</li>
        ) : (
          entries
            .sort((a, b) =>
              valueIsString
                ? String(a[0]).localeCompare(String(b[0]))
                : Number(b[1]) - Number(a[1])
            )
            .map(([label, value]) => (
              <li
                key={label}
                className="flex items-center justify-between text-sm"
              >
                <span className="capitalize text-dark/80">{label}</span>
                <span className="font-semibold text-navy">{value}</span>
              </li>
            ))
        )}
      </ul>
    </section>
  );
}
