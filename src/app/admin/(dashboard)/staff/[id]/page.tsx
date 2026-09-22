import Link from "next/link";
import { notFound } from "next/navigation";
import StatusBadge from "@/components/admin/StatusBadge";
import StaffProfileForm from "@/components/admin/StaffProfileForm";
import { requireAdminSession, formatUkDate } from "@/lib/admin/auth";
import { ROLE_LABELS, type Profile } from "@/lib/admin/types";

type Params = { params: { id: string } };

export async function generateMetadata({ params }: Params) {
  return { title: `Staff ${params.id.slice(0, 8)}` };
}

export default async function AdminStaffDetailPage({ params }: Params) {
  const { supabase, profile: viewer } = await requireAdminSession([
    "admin",
    "manager",
  ]);

  const [{ data: staff }, { data: schedule }, { data: bookings }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", params.id).maybeSingle(),
      supabase
        .from("staff_schedule")
        .select("*")
        .eq("user_id", params.id)
        .order("date", { ascending: false })
        .limit(10),
      supabase
        .from("bookings")
        .select("id, booking_date, status, property_address, service_type")
        .contains("assigned_team", [params.id])
        .order("booking_date", { ascending: false })
        .limit(10),
    ]);

  if (!staff) notFound();
  const row = staff as Profile;
  const canEditRole = viewer.role === "admin";

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/staff" className="text-sm font-semibold text-teal">
          ← Back to staff
        </Link>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-mono text-xs font-semibold text-teal">
              {row.staff_id || "No staff ID"}
            </p>
            <h1 className="heading-lg mt-1">{row.full_name}</h1>
            <p className="mt-1 text-sm text-dark/70">{row.email}</p>
          </div>
          <div className="flex gap-2">
            <StatusBadge value={row.role} />
            <StatusBadge value={row.is_active ? "active" : "inactive"} />
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-navy/8 bg-white p-4 shadow-soft">
          <p className="text-xs text-dark/60">Role</p>
          <p className="font-heading text-lg font-bold text-navy">
            {ROLE_LABELS[row.role]}
          </p>
        </div>
        <div className="rounded-2xl border border-navy/8 bg-white p-4 shadow-soft">
          <p className="text-xs text-dark/60">Job title</p>
          <p className="font-heading text-lg font-bold text-navy">
            {row.job_title || "—"}
          </p>
        </div>
        <div className="rounded-2xl border border-navy/8 bg-white p-4 shadow-soft">
          <p className="text-xs text-dark/60">Hire date</p>
          <p className="font-heading text-lg font-bold text-navy">
            {formatUkDate(row.hire_date)}
          </p>
        </div>
        <div className="rounded-2xl border border-navy/8 bg-white p-4 shadow-soft">
          <p className="text-xs text-dark/60">Last login</p>
          <p className="font-heading text-lg font-bold text-navy">
            {formatUkDate(row.last_login)}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-3 rounded-2xl border border-navy/8 bg-white p-5 shadow-soft">
          <h2 className="font-heading text-lg font-bold text-navy">Details</h2>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-dark/60">Staff ID</dt>
              <dd className="font-mono font-semibold text-navy">
                {row.staff_id || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-dark/60">Phone</dt>
              <dd className="font-semibold text-navy">{row.phone || "—"}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-dark/60">Address</dt>
              <dd className="font-semibold text-navy">{row.address || "—"}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-dark/60">Emergency contact</dt>
              <dd className="font-semibold text-navy">
                {row.emergency_contact || "—"}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-dark/60">Notes</dt>
              <dd className="mt-1 whitespace-pre-wrap text-dark/85">
                {row.notes || "—"}
              </dd>
            </div>
          </dl>
        </section>

        <StaffProfileForm profile={row} canEditRole={canEditRole} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-navy/8 bg-white p-5 shadow-soft">
          <h2 className="font-heading text-lg font-bold text-navy">
            Recent schedule
          </h2>
          {(schedule || []).length === 0 ? (
            <p className="mt-3 text-sm text-dark/60">No schedule entries yet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-navy/8">
              {(schedule || []).map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-center justify-between py-3 text-sm"
                >
                  <span>{formatUkDate(entry.date)}</span>
                  <span className="capitalize text-dark/70">
                    {entry.shift || "shift"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-navy/8 bg-white p-5 shadow-soft">
          <h2 className="font-heading text-lg font-bold text-navy">
            Assigned bookings
          </h2>
          {(bookings || []).length === 0 ? (
            <p className="mt-3 text-sm text-dark/60">No assigned bookings yet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-navy/8">
              {(bookings || []).map((booking) => (
                <li
                  key={booking.id}
                  className="flex items-center justify-between py-3 text-sm"
                >
                  <div>
                    <Link
                      href={`/admin/bookings/${booking.id}`}
                      className="font-semibold text-navy hover:text-teal"
                    >
                      {booking.property_address || "Booking"}
                    </Link>
                    <p className="text-xs text-dark/60">
                      {formatUkDate(booking.booking_date)}
                    </p>
                  </div>
                  <StatusBadge value={booking.status} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
