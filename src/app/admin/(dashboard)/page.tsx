import Link from "next/link";
import {
  CalendarDays,
  ClipboardList,
  FileWarning,
  PoundSterling,
  Plus,
} from "lucide-react";
import { requireAdminSession, formatGbp } from "@/lib/admin/auth";
import StatusBadge from "@/components/admin/StatusBadge";
import { SERVICE_LABELS, type Lead, type Booking } from "@/lib/admin/types";

export const metadata = { title: "Overview" };

export default async function AdminOverviewPage() {
  const { supabase } = await requireAdminSession();

  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay() + 1);
  startOfWeek.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const todayStr = startOfDay.toISOString().slice(0, 10);
  const weekAhead = new Date(now);
  weekAhead.setDate(now.getDate() + 7);
  const weekAheadStr = weekAhead.toISOString().slice(0, 10);

  const [
    leadsToday,
    leadsWeek,
    leadsMonth,
    bookingsToday,
    bookingsWeek,
    outstandingInvoices,
    pendingComplaints,
    recentLeads,
    recentBookings,
    paidInvoicesMonth,
    bookingStatusRows,
    serviceRows,
  ] = await Promise.all([
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .gte("created_at", startOfDay.toISOString()),
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .gte("created_at", startOfWeek.toISOString()),
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .gte("created_at", startOfMonth.toISOString()),
    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("booking_date", todayStr),
    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .gte("booking_date", todayStr)
      .lte("booking_date", weekAheadStr),
    supabase
      .from("invoices")
      .select("id", { count: "exact", head: true })
      .in("status", ["sent", "overdue"]),
    supabase
      .from("complaints")
      .select("id", { count: "exact", head: true })
      .in("status", ["new", "acknowledged", "investigating"]),
    supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("bookings")
      .select("*, clients(contact_name, company_name)")
      .order("booking_date", { ascending: true })
      .gte("booking_date", todayStr)
      .limit(5),
    supabase
      .from("invoices")
      .select("total_amount")
      .eq("status", "paid")
      .gte("paid_at", startOfMonth.toISOString()),
    supabase.from("bookings").select("status"),
    supabase.from("leads").select("service_interest"),
  ]);

  const monthRevenue = (paidInvoicesMonth.data || []).reduce(
    (sum, row) => sum + Number(row.total_amount || 0),
    0
  );

  const statusCounts = (bookingStatusRows.data || []).reduce<Record<string, number>>(
    (acc, row) => {
      acc[row.status] = (acc[row.status] || 0) + 1;
      return acc;
    },
    {}
  );

  const serviceCounts = (serviceRows.data || []).reduce<Record<string, number>>(
    (acc, row) => {
      const key = row.service_interest || "other";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    },
    {}
  );

  const kpis = [
    {
      label: "New leads",
      value: leadsMonth.count ?? 0,
      detail: `Today ${leadsToday.count ?? 0} · Week ${leadsWeek.count ?? 0}`,
      icon: ClipboardList,
      href: "/admin/leads",
    },
    {
      label: "Upcoming bookings",
      value: bookingsWeek.count ?? 0,
      detail: `Today ${bookingsToday.count ?? 0}`,
      icon: CalendarDays,
      href: "/admin/bookings",
    },
    {
      label: "Revenue (month)",
      value: formatGbp(monthRevenue),
      detail: "Paid invoices this month",
      icon: PoundSterling,
      href: "/admin/reports",
    },
    {
      label: "Outstanding invoices",
      value: outstandingInvoices.count ?? 0,
      detail: "Sent or overdue",
      icon: FileWarning,
      href: "/admin/invoices",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-label">Overview</p>
          <h1 className="heading-lg">Operations dashboard</h1>
          <p className="mt-2 text-sm text-dark/70">
            Live view of leads, bookings, revenue, and open issues.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/leads?new=1" className="btn-navy">
            <Plus className="h-4 w-4" aria-hidden />
            Add lead
          </Link>
          <Link href="/admin/bookings/new" className="btn-primary">
            Create booking
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Link
              key={kpi.label}
              href={kpi.href}
              className="rounded-2xl border border-navy/8 bg-white p-5 shadow-soft transition hover:border-teal/40"
            >
              <div className="flex items-start justify-between">
                <p className="text-sm font-semibold text-dark/70">{kpi.label}</p>
                <Icon className="h-5 w-5 text-teal" aria-hidden />
              </div>
              <p className="mt-3 font-heading text-3xl font-bold text-navy">
                {kpi.value}
              </p>
              <p className="mt-1 text-xs text-dark/60">{kpi.detail}</p>
            </Link>
          );
        })}
      </div>

      {(pendingComplaints.count ?? 0) > 0 ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          <strong>{pendingComplaints.count}</strong> complaint
          {(pendingComplaints.count ?? 0) === 1 ? "" : "s"} need attention.{" "}
          <Link href="/admin/complaints" className="font-semibold underline">
            Review complaints
          </Link>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-navy/8 bg-white p-5 shadow-soft">
          <h2 className="font-heading text-lg font-bold text-navy">
            Booking status mix
          </h2>
          <ul className="mt-4 space-y-2">
            {Object.entries(statusCounts).length === 0 ? (
              <li className="text-sm text-dark/60">No bookings yet.</li>
            ) : (
              Object.entries(statusCounts).map(([status, count]) => (
                <li
                  key={status}
                  className="flex items-center justify-between text-sm"
                >
                  <StatusBadge value={status} />
                  <span className="font-semibold text-navy">{count}</span>
                </li>
              ))
            )}
          </ul>
        </section>

        <section className="rounded-2xl border border-navy/8 bg-white p-5 shadow-soft">
          <h2 className="font-heading text-lg font-bold text-navy">
            Service interest (leads)
          </h2>
          <ul className="mt-4 space-y-2">
            {Object.entries(serviceCounts).length === 0 ? (
              <li className="text-sm text-dark/60">No leads yet.</li>
            ) : (
              Object.entries(serviceCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([service, count]) => (
                  <li
                    key={service}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-dark/80">
                      {SERVICE_LABELS[service as keyof typeof SERVICE_LABELS] ||
                        service}
                    </span>
                    <span className="font-semibold text-navy">{count}</span>
                  </li>
                ))
            )}
          </ul>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-navy/8 bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-bold text-navy">
              Recent leads
            </h2>
            <Link href="/admin/leads" className="text-sm font-semibold text-teal">
              View all
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-navy/8">
            {((recentLeads.data || []) as Lead[]).map((lead) => (
              <li key={lead.id} className="flex items-center justify-between py-3">
                <div>
                  <Link
                    href={`/admin/leads/${lead.id}`}
                    className="font-semibold text-navy hover:text-teal"
                  >
                    {lead.name}
                  </Link>
                  <p className="text-xs text-dark/60">{lead.email}</p>
                </div>
                <StatusBadge value={lead.status} />
              </li>
            ))}
            {(recentLeads.data || []).length === 0 ? (
              <li className="py-3 text-sm text-dark/60">No leads yet.</li>
            ) : null}
          </ul>
        </section>

        <section className="rounded-2xl border border-navy/8 bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-bold text-navy">
              Upcoming bookings
            </h2>
            <Link
              href="/admin/bookings"
              className="text-sm font-semibold text-teal"
            >
              View all
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-navy/8">
            {((recentBookings.data || []) as Booking[]).map((booking) => (
              <li key={booking.id} className="flex items-center justify-between py-3">
                <div>
                  <Link
                    href={`/admin/bookings/${booking.id}`}
                    className="font-semibold text-navy hover:text-teal"
                  >
                    {booking.clients?.company_name ||
                      booking.clients?.contact_name ||
                      booking.property_address ||
                      "Booking"}
                  </Link>
                  <p className="text-xs text-dark/60">
                    {booking.booking_date} · {booking.start_time?.slice(0, 5)}
                  </p>
                </div>
                <StatusBadge value={booking.status} />
              </li>
            ))}
            {(recentBookings.data || []).length === 0 ? (
              <li className="py-3 text-sm text-dark/60">No upcoming bookings.</li>
            ) : null}
          </ul>
        </section>
      </div>
    </div>
  );
}
