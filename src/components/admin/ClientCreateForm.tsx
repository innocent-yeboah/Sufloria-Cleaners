"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function ClientCreateForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());

    const res = await fetch("/api/admin/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Could not create client.");
      setLoading(false);
      return;
    }

    const data = await res.json();
    router.push(`/admin/clients/${data.id}`);
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-2xl border border-teal/30 bg-white p-5 shadow-soft"
    >
      <h2 className="font-heading text-lg font-bold text-navy">Add client</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          name="contact_name"
          required
          placeholder="Contact name"
          className="rounded-xl border border-navy/15 px-3 py-2 text-sm"
        />
        <input
          name="company_name"
          placeholder="Company name"
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
        <input
          name="city"
          placeholder="City"
          className="rounded-xl border border-navy/15 px-3 py-2 text-sm"
        />
        <input
          name="postcode"
          placeholder="Postcode"
          className="rounded-xl border border-navy/15 px-3 py-2 text-sm"
        />
        <input
          name="address"
          placeholder="Address"
          className="sm:col-span-2 rounded-xl border border-navy/15 px-3 py-2 text-sm"
        />
        <textarea
          name="notes"
          rows={2}
          placeholder="Notes"
          className="sm:col-span-2 rounded-xl border border-navy/15 px-3 py-2 text-sm"
        />
      </div>
      {error ? (
        <p className="text-sm text-rose-700" role="alert">
          {error}
        </p>
      ) : null}
      <button type="submit" disabled={loading} className="btn-navy disabled:opacity-60">
        {loading ? "Saving…" : "Save client"}
      </button>
    </form>
  );
}
