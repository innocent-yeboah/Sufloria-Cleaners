import Link from "next/link";
import { notFound } from "next/navigation";
import BookingForm from "@/components/admin/BookingForm";
import StatusBadge from "@/components/admin/StatusBadge";
import { requireAdminSession, formatGbp, formatUkDate } from "@/lib/admin/auth";
import type { Booking, Client, Profile } from "@/lib/admin/types";

type Params = { params: { id: string } };

export async function generateMetadata({ params }: Params) {
  return { title: `Booking ${params.id.slice(0, 8)}` };
}

export default async function AdminBookingDetailPage({ params }: Params) {
  const { supabase } = await requireAdminSession();

  const [{ data: booking }, { data: clients }, { data: staff }, { data: tasks }] =
    await Promise.all([
      supabase
        .from("bookings")
        .select("*, clients(contact_name, company_name, email, phone)")
        .eq("id", params.id)
        .maybeSingle(),
      supabase.from("clients").select("*").order("contact_name"),
      supabase.from("profiles").select("*").eq("is_active", true).order("full_name"),
      supabase
        .from("job_tasks")
        .select("*")
        .eq("booking_id", params.id)
        .order("created_at"),
    ]);

  if (!booking) notFound();
  const row = booking as Booking;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/bookings" className="text-sm font-semibold text-teal">
          ← Back to bookings
        </Link>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="heading-lg">
              {row.clients?.company_name ||
                row.clients?.contact_name ||
                row.property_address ||
                "Booking"}
            </h1>
            <p className="mt-1 text-sm text-dark/70">
              {formatUkDate(row.booking_date)} · {row.start_time?.slice(0, 5)}
              {row.end_time ? `–${row.end_time.slice(0, 5)}` : ""}
            </p>
          </div>
          <div className="flex gap-2">
            <StatusBadge value={row.status} />
            {row.payment_status ? (
              <StatusBadge value={row.payment_status} />
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-navy/8 bg-white p-4 shadow-soft">
          <p className="text-xs text-dark/60">Quote</p>
          <p className="font-heading text-xl font-bold text-navy">
            {formatGbp(row.price_quote)}
          </p>
        </div>
        <div className="rounded-2xl border border-navy/8 bg-white p-4 shadow-soft">
          <p className="text-xs text-dark/60">Final price</p>
          <p className="font-heading text-xl font-bold text-navy">
            {formatGbp(row.final_price)}
          </p>
        </div>
        <div className="rounded-2xl border border-navy/8 bg-white p-4 shadow-soft">
          <p className="text-xs text-dark/60">Crew size</p>
          <p className="font-heading text-xl font-bold text-navy">
            {row.crew_size}
          </p>
        </div>
      </div>

      <BookingForm
        booking={row}
        clients={(clients || []) as Client[]}
        staff={(staff || []) as Profile[]}
      />

      <section className="rounded-2xl border border-navy/8 bg-white p-5 shadow-soft">
        <h2 className="font-heading text-lg font-bold text-navy">Job tasks</h2>
        {(tasks || []).length === 0 ? (
          <p className="mt-3 text-sm text-dark/60">No tasks for this booking yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-navy/8">
            {(tasks || []).map((task) => (
              <li key={task.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p className="font-semibold text-navy">{task.task_title}</p>
                  <p className="text-dark/60">{task.task_description}</p>
                </div>
                <StatusBadge value={task.status} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
