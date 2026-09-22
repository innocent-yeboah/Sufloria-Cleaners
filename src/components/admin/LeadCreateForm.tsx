"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const SERVICES = [
  ["end_of_tenancy", "End of Tenancy Cleaning"],
  ["move_in", "Residential Move-In Cleaning"],
  ["after_builders", "After Builders Cleaning"],
  ["sparkle_handover", "Sparkle & Handover Cleaning"],
  ["deep_cleaning", "Deep Cleaning"],
  ["commercial", "Commercial & Office Cleaning"],
  ["airbnb", "Airbnb & Holiday Let Cleaning"],
  ["carpet", "Carpet Cleaning"],
  ["oven_appliance", "Oven & Appliance Cleaning"],
  ["decluttering", "Decluttering & Hoarding Cleaning"],
  ["other", "Other"],
] as const;

export default function LeadCreateForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());

    const res = await fetch("/api/admin/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Could not create lead.");
      setLoading(false);
      return;
    }

    const data = await res.json();
    router.push(`/admin/leads/${data.id}`);
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-2xl border border-teal/30 bg-white p-5 shadow-soft"
    >
      <h2 className="font-heading text-lg font-bold text-navy">Add lead</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          name="name"
          required
          placeholder="Full name"
          className="rounded-xl border border-navy/15 px-3 py-2 text-sm"
        />
        <input
          name="email"
          type="email"
          required
          placeholder="Email"
          className="rounded-xl border border-navy/15 px-3 py-2 text-sm"
        />
        <input
          name="phone"
          placeholder="Phone"
          className="rounded-xl border border-navy/15 px-3 py-2 text-sm"
        />
        <select
          name="service_interest"
          className="rounded-xl border border-navy/15 px-3 py-2 text-sm"
          defaultValue="commercial"
        >
          {SERVICES.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select
          name="source"
          className="rounded-xl border border-navy/15 px-3 py-2 text-sm"
          defaultValue="website"
        >
          {["website", "referral", "call", "email", "other"].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          name="priority"
          className="rounded-xl border border-navy/15 px-3 py-2 text-sm"
          defaultValue="normal"
        >
          {["low", "normal", "high"].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <textarea
        name="message"
        rows={3}
        placeholder="Notes / enquiry details"
        className="w-full rounded-xl border border-navy/15 px-3 py-2 text-sm"
      />
      {error ? (
        <p className="text-sm text-rose-700" role="alert">
          {error}
        </p>
      ) : null}
      <button type="submit" disabled={loading} className="btn-navy disabled:opacity-60">
        {loading ? "Saving…" : "Save lead"}
      </button>
    </form>
  );
}
