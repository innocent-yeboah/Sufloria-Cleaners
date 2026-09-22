"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { Complaint } from "@/lib/admin/types";

export function ComplaintCreateForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());

    const res = await fetch("/api/admin/complaints", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Could not log complaint.");
      setLoading(false);
      return;
    }

    setLoading(false);
    router.push("/admin/complaints");
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-2xl border border-teal/30 bg-white p-5 shadow-soft"
    >
      <h2 className="font-heading text-lg font-bold text-navy">Log complaint</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          name="client_name"
          required
          placeholder="Client name"
          className="rounded-xl border border-navy/15 px-3 py-2 text-sm"
        />
        <input
          name="client_email"
          type="email"
          required
          placeholder="Client email"
          className="rounded-xl border border-navy/15 px-3 py-2 text-sm"
        />
        <input
          name="client_phone"
          placeholder="Phone"
          className="rounded-xl border border-navy/15 px-3 py-2 text-sm sm:col-span-2"
        />
        <textarea
          name="complaint_text"
          required
          rows={4}
          placeholder="Complaint details"
          className="rounded-xl border border-navy/15 px-3 py-2 text-sm sm:col-span-2"
        />
      </div>
      {error ? (
        <p className="text-sm text-rose-700" role="alert">
          {error}
        </p>
      ) : null}
      <button type="submit" disabled={loading} className="btn-navy disabled:opacity-60">
        {loading ? "Saving…" : "Save complaint"}
      </button>
    </form>
  );
}

export function ComplaintStatusForm({ complaint }: { complaint: Complaint }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const form = new FormData(event.currentTarget);
    await fetch(`/api/admin/complaints/${complaint.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: form.get("status"),
        resolution_notes: form.get("resolution_notes"),
      }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <select
        name="status"
        defaultValue={complaint.status}
        className="w-full rounded-lg border border-navy/15 px-2 py-1.5 text-sm"
      >
        {["new", "acknowledged", "investigating", "resolved", "closed"].map(
          (s) => (
            <option key={s} value={s}>
              {s}
            </option>
          )
        )}
      </select>
      <textarea
        name="resolution_notes"
        rows={2}
        defaultValue={complaint.resolution_notes || ""}
        placeholder="Resolution notes"
        className="w-full rounded-lg border border-navy/15 px-2 py-1.5 text-sm"
      />
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-navy px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
      >
        Update
      </button>
    </form>
  );
}
