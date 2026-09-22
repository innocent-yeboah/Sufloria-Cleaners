"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { Profile } from "@/lib/admin/types";

export default function MyProfileForm({ profile }: { profile: Profile }) {
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

    const res = await fetch("/api/admin/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: form.get("full_name"),
        phone: form.get("phone"),
        job_title: form.get("job_title"),
        address: form.get("address"),
        emergency_contact: form.get("emergency_contact"),
        notes: form.get("notes"),
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Could not save your profile.");
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
      <div>
        <h2 className="font-heading text-lg font-bold text-navy">
          Personal details
        </h2>
        <p className="mt-1 text-sm text-dark/70">
          Keep your contact information current for operations and emergency use.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm sm:col-span-2">
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
          <span className="mb-1 block font-semibold text-navy">Job title</span>
          <input
            name="job_title"
            defaultValue={profile.job_title || ""}
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
            placeholder="Name and phone number"
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
          <span className="mb-1 block font-semibold text-navy">
            Personal notes
          </span>
          <textarea
            name="notes"
            rows={3}
            defaultValue={profile.notes || ""}
            placeholder="Optional notes visible to managers"
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
          Profile updated.
        </p>
      ) : null}

      <button type="submit" disabled={loading} className="btn-navy disabled:opacity-60">
        {loading ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
