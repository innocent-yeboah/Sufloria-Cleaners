"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ROLE_LABELS, STAFF_ROLES } from "@/lib/admin/types";

export default function StaffCreateForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(event.currentTarget);

    const payload = {
      full_name: String(form.get("full_name") || ""),
      email: String(form.get("email") || ""),
      password: String(form.get("password") || ""),
      phone: String(form.get("phone") || ""),
      role: String(form.get("role") || "cleaner"),
      job_title: String(form.get("job_title") || ""),
      hire_date: String(form.get("hire_date") || ""),
      address: String(form.get("address") || ""),
      emergency_contact: String(form.get("emergency_contact") || ""),
      notes: String(form.get("notes") || ""),
      is_active: true,
    };

    const res = await fetch("/api/admin/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Could not create staff member.");
      setLoading(false);
      return;
    }

    const data = await res.json();
    router.push(`/admin/staff/${data.id}`);
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-2xl border border-teal/30 bg-white p-5 shadow-soft"
    >
      <h2 className="font-heading text-lg font-bold text-navy">Add staff member</h2>
      <p className="text-sm text-dark/70">
        Creates a login account, assigns a staff ID, and opens their profile.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          name="full_name"
          required
          placeholder="Full name"
          className="rounded-xl border border-navy/15 px-3 py-2 text-sm"
        />
        <input
          name="email"
          type="email"
          required
          placeholder="Work email"
          className="rounded-xl border border-navy/15 px-3 py-2 text-sm"
        />
        <input
          name="password"
          type="password"
          required
          minLength={8}
          placeholder="Temporary password (min 8 chars)"
          className="rounded-xl border border-navy/15 px-3 py-2 text-sm"
        />
        <input
          name="phone"
          placeholder="Phone"
          className="rounded-xl border border-navy/15 px-3 py-2 text-sm"
        />
        <select
          name="role"
          defaultValue="cleaner"
          className="rounded-xl border border-navy/15 px-3 py-2 text-sm"
        >
          {STAFF_ROLES.map((role) => (
            <option key={role} value={role}>
              {ROLE_LABELS[role]}
            </option>
          ))}
        </select>
        <input
          name="job_title"
          placeholder="Job title"
          className="rounded-xl border border-navy/15 px-3 py-2 text-sm"
        />
        <input
          name="hire_date"
          type="date"
          className="rounded-xl border border-navy/15 px-3 py-2 text-sm"
        />
        <input
          name="emergency_contact"
          placeholder="Emergency contact"
          className="rounded-xl border border-navy/15 px-3 py-2 text-sm"
        />
        <input
          name="address"
          placeholder="Address"
          className="rounded-xl border border-navy/15 px-3 py-2 text-sm sm:col-span-2"
        />
        <textarea
          name="notes"
          rows={2}
          placeholder="Internal notes"
          className="rounded-xl border border-navy/15 px-3 py-2 text-sm sm:col-span-2"
        />
      </div>
      {error ? (
        <p className="text-sm text-rose-700" role="alert">
          {error}
        </p>
      ) : null}
      <button type="submit" disabled={loading} className="btn-navy disabled:opacity-60">
        {loading ? "Creating…" : "Create staff"}
      </button>
    </form>
  );
}
