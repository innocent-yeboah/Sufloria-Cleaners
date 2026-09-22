"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ROLE_LABELS,
  STAFF_ROLES,
  type Profile,
  type StaffRole,
} from "@/lib/admin/types";

type Props = {
  profile: Profile;
  canEditRole: boolean;
};

export default function StaffProfileForm({ profile, canEditRole }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSaved(false);
    const form = new FormData(event.currentTarget);

    const payload = {
      full_name: String(form.get("full_name") || ""),
      phone: String(form.get("phone") || "") || null,
      role: String(form.get("role") || profile.role),
      is_active: form.get("is_active") === "true",
      job_title: String(form.get("job_title") || "") || null,
      hire_date: String(form.get("hire_date") || "") || null,
      address: String(form.get("address") || "") || null,
      emergency_contact: String(form.get("emergency_contact") || "") || null,
      notes: String(form.get("notes") || "") || null,
    };

    const res = await fetch(`/api/admin/staff/${profile.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Could not update staff profile.");
      setLoading(false);
      return;
    }

    setLoading(false);
    setSaved(true);
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-2xl border border-navy/8 bg-white p-5 shadow-soft"
    >
      <h2 className="font-heading text-lg font-bold text-navy">Edit profile</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block font-semibold text-navy">Full name</span>
          <input
            name="full_name"
            required
            defaultValue={profile.full_name}
            className="w-full rounded-xl border border-navy/15 px-3 py-2"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-semibold text-navy">Phone</span>
          <input
            name="phone"
            defaultValue={profile.phone || ""}
            className="w-full rounded-xl border border-navy/15 px-3 py-2"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-semibold text-navy">Role</span>
          {canEditRole ? (
            <select
              name="role"
              defaultValue={profile.role}
              className="w-full rounded-xl border border-navy/15 px-3 py-2"
            >
              {STAFF_ROLES.map((role) => (
                <option key={role} value={role}>
                  {ROLE_LABELS[role as StaffRole]}
                </option>
              ))}
            </select>
          ) : (
            <>
              <input type="hidden" name="role" value={profile.role} />
              <input
                value={ROLE_LABELS[profile.role]}
                disabled
                className="w-full rounded-xl border border-navy/10 bg-light px-3 py-2 text-dark/70"
              />
            </>
          )}
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-semibold text-navy">Status</span>
          <select
            name="is_active"
            defaultValue={profile.is_active ? "true" : "false"}
            className="w-full rounded-xl border border-navy/15 px-3 py-2"
          >
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-semibold text-navy">Job title</span>
          <input
            name="job_title"
            defaultValue={profile.job_title || ""}
            className="w-full rounded-xl border border-navy/15 px-3 py-2"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-semibold text-navy">Hire date</span>
          <input
            name="hire_date"
            type="date"
            defaultValue={profile.hire_date || ""}
            className="w-full rounded-xl border border-navy/15 px-3 py-2"
          />
        </label>
        <label className="text-sm sm:col-span-2">
          <span className="mb-1 block font-semibold text-navy">
            Emergency contact
          </span>
          <input
            name="emergency_contact"
            defaultValue={profile.emergency_contact || ""}
            className="w-full rounded-xl border border-navy/15 px-3 py-2"
          />
        </label>
        <label className="text-sm sm:col-span-2">
          <span className="mb-1 block font-semibold text-navy">Address</span>
          <input
            name="address"
            defaultValue={profile.address || ""}
            className="w-full rounded-xl border border-navy/15 px-3 py-2"
          />
        </label>
        <label className="text-sm sm:col-span-2">
          <span className="mb-1 block font-semibold text-navy">Notes</span>
          <textarea
            name="notes"
            rows={3}
            defaultValue={profile.notes || ""}
            className="w-full rounded-xl border border-navy/15 px-3 py-2"
          />
        </label>
      </div>
      {error ? (
        <p className="text-sm text-rose-700" role="alert">
          {error}
        </p>
      ) : null}
      {saved ? (
        <p className="text-sm text-emerald-700" role="status">
          Profile saved.
        </p>
      ) : null}
      <button type="submit" disabled={loading} className="btn-navy disabled:opacity-60">
        {loading ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
