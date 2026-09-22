"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { Booking, Client, Profile, ServiceInterest } from "@/lib/admin/types";

const SERVICES: ServiceInterest[] = [
  "end_of_tenancy",
  "move_in",
  "after_builders",
  "sparkle_handover",
  "deep_cleaning",
  "commercial",
  "airbnb",
  "carpet",
  "oven_appliance",
  "decluttering",
  "other",
];

type Props = {
  clients: Client[];
  staff: Profile[];
  booking?: Booking;
};

export default function BookingForm({ clients, staff, booking }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const assigned = form.getAll("assigned_team").map(String);

    const payload = {
      client_id: String(form.get("client_id") || "") || null,
      service_type: String(form.get("service_type") || ""),
      service_description: String(form.get("service_description") || ""),
      property_address: String(form.get("property_address") || ""),
      property_postcode: String(form.get("property_postcode") || ""),
      booking_date: String(form.get("booking_date") || ""),
      start_time: String(form.get("start_time") || ""),
      end_time: String(form.get("end_time") || ""),
      crew_size: Number(form.get("crew_size") || 1),
      status: String(form.get("status") || "pending"),
      price_quote: form.get("price_quote")
        ? Number(form.get("price_quote"))
        : null,
      final_price: form.get("final_price")
        ? Number(form.get("final_price"))
        : null,
      payment_status: String(form.get("payment_status") || "unpaid"),
      notes: String(form.get("notes") || ""),
      assigned_team: assigned,
    };

    const res = await fetch(
      booking ? `/api/admin/bookings/${booking.id}` : "/api/admin/bookings",
      {
        method: booking ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Could not save booking.");
      setLoading(false);
      return;
    }

    const data = await res.json();
    router.push(`/admin/bookings/${booking?.id || data.id}`);
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-2xl border border-navy/8 bg-white p-5 shadow-soft"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm sm:col-span-2">
          <span className="mb-1 block font-semibold text-navy">Client</span>
          <select
            name="client_id"
            defaultValue={booking?.client_id || ""}
            className="w-full rounded-xl border border-navy/15 px-3 py-2"
          >
            <option value="">No client linked</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.company_name || c.contact_name} — {c.email}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-semibold text-navy">Service</span>
          <select
            name="service_type"
            defaultValue={booking?.service_type || "commercial"}
            className="w-full rounded-xl border border-navy/15 px-3 py-2"
          >
            {SERVICES.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-semibold text-navy">Status</span>
          <select
            name="status"
            defaultValue={booking?.status || "pending"}
            className="w-full rounded-xl border border-navy/15 px-3 py-2"
          >
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
        </label>
        <label className="text-sm sm:col-span-2">
          <span className="mb-1 block font-semibold text-navy">Address</span>
          <input
            name="property_address"
            defaultValue={booking?.property_address || ""}
            className="w-full rounded-xl border border-navy/15 px-3 py-2"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-semibold text-navy">Postcode</span>
          <input
            name="property_postcode"
            defaultValue={booking?.property_postcode || ""}
            className="w-full rounded-xl border border-navy/15 px-3 py-2"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-semibold text-navy">Crew size</span>
          <input
            name="crew_size"
            type="number"
            min={1}
            defaultValue={booking?.crew_size || 1}
            className="w-full rounded-xl border border-navy/15 px-3 py-2"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-semibold text-navy">Date</span>
          <input
            name="booking_date"
            type="date"
            required
            defaultValue={booking?.booking_date || ""}
            className="w-full rounded-xl border border-navy/15 px-3 py-2"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-semibold text-navy">Start time</span>
          <input
            name="start_time"
            type="time"
            required
            defaultValue={booking?.start_time?.slice(0, 5) || "09:00"}
            className="w-full rounded-xl border border-navy/15 px-3 py-2"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-semibold text-navy">End time</span>
          <input
            name="end_time"
            type="time"
            defaultValue={booking?.end_time?.slice(0, 5) || ""}
            className="w-full rounded-xl border border-navy/15 px-3 py-2"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-semibold text-navy">Quote (£)</span>
          <input
            name="price_quote"
            type="number"
            step="0.01"
            defaultValue={booking?.price_quote ?? ""}
            className="w-full rounded-xl border border-navy/15 px-3 py-2"
          />
        </label>
        {booking ? (
          <>
            <label className="text-sm">
              <span className="mb-1 block font-semibold text-navy">
                Final price (£)
              </span>
              <input
                name="final_price"
                type="number"
                step="0.01"
                defaultValue={booking.final_price ?? ""}
                className="w-full rounded-xl border border-navy/15 px-3 py-2"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-semibold text-navy">
                Payment status
              </span>
              <select
                name="payment_status"
                defaultValue={booking.payment_status || "unpaid"}
                className="w-full rounded-xl border border-navy/15 px-3 py-2"
              >
                {["unpaid", "deposit", "partial", "paid"].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          </>
        ) : null}
        <label className="text-sm sm:col-span-2">
          <span className="mb-1 block font-semibold text-navy">
            Assigned team
          </span>
          <select
            name="assigned_team"
            multiple
            defaultValue={booking?.assigned_team || []}
            className="h-28 w-full rounded-xl border border-navy/15 px-3 py-2"
          >
            {staff.map((s) => (
              <option key={s.id} value={s.id}>
                {s.full_name} ({s.role})
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm sm:col-span-2">
          <span className="mb-1 block font-semibold text-navy">Description</span>
          <textarea
            name="service_description"
            rows={2}
            defaultValue={booking?.service_description || ""}
            className="w-full rounded-xl border border-navy/15 px-3 py-2"
          />
        </label>
        <label className="text-sm sm:col-span-2">
          <span className="mb-1 block font-semibold text-navy">Notes</span>
          <textarea
            name="notes"
            rows={3}
            defaultValue={booking?.notes || ""}
            className="w-full rounded-xl border border-navy/15 px-3 py-2"
          />
        </label>
      </div>
      {error ? (
        <p className="text-sm text-rose-700" role="alert">
          {error}
        </p>
      ) : null}
      <button type="submit" disabled={loading} className="btn-navy disabled:opacity-60">
        {loading ? "Saving…" : booking ? "Update booking" : "Create booking"}
      </button>
    </form>
  );
}
