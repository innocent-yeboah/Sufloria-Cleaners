"use client";

import { FormEvent, useState } from "react";

export default function MyPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setNotice(null);
    const form = event.currentTarget;
    const formData = new FormData(form);

    const res = await fetch("/api/admin/profile/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        current_password: formData.get("current_password"),
        new_password: formData.get("new_password"),
        confirm_password: formData.get("confirm_password"),
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "Could not update password.");
      setLoading(false);
      return;
    }

    form.reset();
    setNotice(data.notice || "Password updated successfully.");
    setLoading(false);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-2xl border border-navy/8 bg-white p-5 shadow-soft"
    >
      <div>
        <h2 className="font-heading text-lg font-bold text-navy">
          Security
        </h2>
        <p className="mt-1 text-sm text-dark/70">
          Change your password. Use at least 8 characters.
        </p>
      </div>

      <div className="grid gap-3">
        <label className="text-sm">
          <span className="mb-1 block font-semibold text-navy">
            Current password
          </span>
          <input
            name="current_password"
            type="password"
            required
            autoComplete="current-password"
            className="w-full rounded-xl border border-navy/15 px-3 py-2"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-semibold text-navy">
            New password
          </span>
          <input
            name="new_password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full rounded-xl border border-navy/15 px-3 py-2"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-semibold text-navy">
            Confirm new password
          </span>
          <input
            name="confirm_password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full rounded-xl border border-navy/15 px-3 py-2"
          />
        </label>
      </div>

      {error ? (
        <p className="text-sm text-rose-700" role="alert">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p className="text-sm text-emerald-700" role="status">
          {notice}
        </p>
      ) : null}

      <button type="submit" disabled={loading} className="btn-navy disabled:opacity-60">
        {loading ? "Updating…" : "Update password"}
      </button>
    </form>
  );
}
