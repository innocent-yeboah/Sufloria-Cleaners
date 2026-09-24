"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LEAD_STATUSES,
  SERVICE_LABELS,
  type Lead,
  type ServiceInterest,
} from "@/lib/admin/types";

type Props = {
  lead: Lead;
  staff: { id: string; full_name: string }[];
};

const SERVICE_OPTIONS = Object.entries(SERVICE_LABELS) as [
  ServiceInterest,
  string,
][];

export default function LeadDetailActions({ lead, staff }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [convertOpen, setConvertOpen] = useState(false);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get("name") || ""),
      email: String(form.get("email") || ""),
      phone: String(form.get("phone") || "") || null,
      service_interest: String(form.get("service_interest") || "") || null,
      status: String(form.get("status") || ""),
      priority: String(form.get("priority") || ""),
      assigned_to: String(form.get("assigned_to") || "") || null,
      quote_amount: form.get("quote_amount")
        ? Number(form.get("quote_amount"))
        : null,
      postcode: String(form.get("postcode") || "") || null,
      preferred_date: String(form.get("preferred_date") || "") || null,
      enquiry_type: String(form.get("enquiry_type") || "") || null,
      client_type: String(form.get("client_type") || "") || null,
      property_size: String(form.get("property_size") || "") || null,
      property_type: String(form.get("property_type") || "") || null,
      message: String(form.get("message") || "") || null,
      notes: String(form.get("notes") || "") || null,
      lost_reason: String(form.get("lost_reason") || "") || null,
    };

    const res = await fetch(`/api/admin/leads/${lead.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Could not update lead.");
      setLoading(false);
      return;
    }

    setLoading(false);
    setSuccess("Lead updated.");
    router.refresh();
  }

  async function convert(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());

    const res = await fetch(`/api/admin/leads/${lead.id}/convert`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Could not convert lead.");
      setLoading(false);
      return;
    }

    const data = await res.json();
    router.push(
      data.bookingId
        ? `/admin/bookings/${data.bookingId}`
        : `/admin/clients/${data.clientId}`
    );
    router.refresh();
  }

  async function setStatus(status: (typeof LEAD_STATUSES)[number]) {
    setLoading(true);
    setError(null);
    setSuccess(null);
    const res = await fetch(`/api/admin/leads/${lead.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Could not update status.");
      setLoading(false);
      return;
    }
    setLoading(false);
    setSuccess(`Status set to ${status}.`);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-navy/8 bg-white p-5 shadow-soft">
        <h2 className="font-heading text-lg font-bold text-navy">
          Quick status
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {LEAD_STATUSES.map((status) => (
            <button
              key={status}
              type="button"
              disabled={loading || lead.status === status}
              onClick={() => setStatus(status)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold capitalize transition disabled:opacity-50 ${
                lead.status === status
                  ? "bg-navy text-white"
                  : "border border-navy/15 bg-light text-navy hover:border-teal hover:text-teal"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <form
        key={`${lead.status}-${lead.priority}-${lead.assigned_to}-${lead.quote_amount}-${lead.postcode}`}
        onSubmit={save}
        className="space-y-4 rounded-2xl border border-navy/8 bg-white p-5 shadow-soft"
      >
        <h2 className="font-heading text-lg font-bold text-navy">
          Manage lead
        </h2>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block font-semibold text-navy">Name</span>
            <input
              name="name"
              required
              defaultValue={lead.name}
              className="w-full rounded-xl border border-navy/15 px-3 py-2"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-semibold text-navy">Email</span>
            <input
              name="email"
              type="email"
              required
              defaultValue={lead.email}
              className="w-full rounded-xl border border-navy/15 px-3 py-2"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-semibold text-navy">Phone</span>
            <input
              name="phone"
              defaultValue={lead.phone || ""}
              className="w-full rounded-xl border border-navy/15 px-3 py-2"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-semibold text-navy">Postcode</span>
            <input
              name="postcode"
              defaultValue={lead.postcode || ""}
              className="w-full rounded-xl border border-navy/15 px-3 py-2"
            />
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="mb-1 block font-semibold text-navy">Service</span>
            <select
              name="service_interest"
              defaultValue={lead.service_interest || ""}
              className="w-full rounded-xl border border-navy/15 px-3 py-2"
            >
              <option value="">Not set</option>
              {SERVICE_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-semibold text-navy">Status</span>
            <select
              name="status"
              defaultValue={lead.status}
              className="w-full rounded-xl border border-navy/15 px-3 py-2"
            >
              {LEAD_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-semibold text-navy">Priority</span>
            <select
              name="priority"
              defaultValue={lead.priority}
              className="w-full rounded-xl border border-navy/15 px-3 py-2"
            >
              {["low", "normal", "high"].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-semibold text-navy">
              Assigned to
            </span>
            <select
              name="assigned_to"
              defaultValue={lead.assigned_to || ""}
              className="w-full rounded-xl border border-navy/15 px-3 py-2"
            >
              <option value="">Unassigned</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-semibold text-navy">Quote (£)</span>
            <input
              name="quote_amount"
              type="number"
              step="0.01"
              min="0"
              defaultValue={lead.quote_amount ?? ""}
              className="w-full rounded-xl border border-navy/15 px-3 py-2"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-semibold text-navy">
              Preferred date
            </span>
            <input
              name="preferred_date"
              type="date"
              defaultValue={lead.preferred_date || ""}
              className="w-full rounded-xl border border-navy/15 px-3 py-2"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-semibold text-navy">
              Enquiry type
            </span>
            <input
              name="enquiry_type"
              defaultValue={lead.enquiry_type || ""}
              className="w-full rounded-xl border border-navy/15 px-3 py-2"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-semibold text-navy">
              Client type
            </span>
            <input
              name="client_type"
              defaultValue={lead.client_type || ""}
              className="w-full rounded-xl border border-navy/15 px-3 py-2"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-semibold text-navy">
              Property size
            </span>
            <input
              name="property_size"
              defaultValue={lead.property_size || ""}
              className="w-full rounded-xl border border-navy/15 px-3 py-2"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-semibold text-navy">
              Property type
            </span>
            <input
              name="property_type"
              defaultValue={lead.property_type || ""}
              className="w-full rounded-xl border border-navy/15 px-3 py-2"
            />
          </label>
        </div>

        <label className="block text-sm">
          <span className="mb-1 block font-semibold text-navy">
            Customer message
          </span>
          <textarea
            name="message"
            rows={3}
            defaultValue={lead.message || ""}
            className="w-full rounded-xl border border-navy/15 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-semibold text-navy">
            Internal notes
          </span>
          <textarea
            name="notes"
            rows={3}
            defaultValue={lead.notes || ""}
            className="w-full rounded-xl border border-navy/15 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-semibold text-navy">Lost reason</span>
          <input
            name="lost_reason"
            defaultValue={lead.lost_reason || ""}
            className="w-full rounded-xl border border-navy/15 px-3 py-2"
          />
        </label>

        {error ? (
          <p className="text-sm text-rose-700" role="alert">
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="text-sm text-teal" role="status">
            {success}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="btn-navy disabled:opacity-60"
        >
          {loading ? "Saving…" : "Save changes"}
        </button>
      </form>

      {lead.status !== "booked" ? (
        <div className="rounded-2xl border border-teal/30 bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-heading text-lg font-bold text-navy">
                Convert to client
              </h2>
              <p className="text-sm text-dark/70">
                Creates a client record and optional booking.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setConvertOpen((v) => !v)}
              className="btn-primary"
            >
              {convertOpen ? "Cancel" : "Convert"}
            </button>
          </div>
          {convertOpen ? (
            <form onSubmit={convert} className="mt-4 grid gap-3 sm:grid-cols-2">
              <input
                name="company_name"
                placeholder="Company name"
                className="rounded-xl border border-navy/15 px-3 py-2 text-sm"
              />
              <input
                name="city"
                placeholder="City"
                defaultValue=""
                className="rounded-xl border border-navy/15 px-3 py-2 text-sm"
              />
              <input
                name="address"
                placeholder="Address"
                className="sm:col-span-2 rounded-xl border border-navy/15 px-3 py-2 text-sm"
              />
              <input
                name="postcode"
                placeholder="Postcode"
                defaultValue={lead.postcode || ""}
                className="rounded-xl border border-navy/15 px-3 py-2 text-sm"
              />
              <input
                name="price_quote"
                type="number"
                step="0.01"
                placeholder="Quote (£)"
                defaultValue={lead.quote_amount ?? ""}
                className="rounded-xl border border-navy/15 px-3 py-2 text-sm"
              />
              <input
                name="booking_date"
                type="date"
                defaultValue={lead.preferred_date || ""}
                className="rounded-xl border border-navy/15 px-3 py-2 text-sm"
              />
              <input
                name="start_time"
                type="time"
                className="rounded-xl border border-navy/15 px-3 py-2 text-sm"
              />
              <button
                type="submit"
                disabled={loading}
                className="btn-navy sm:col-span-2 disabled:opacity-60"
              >
                Convert lead
              </button>
            </form>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
