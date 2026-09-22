"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  "equipment",
  "supplies",
  "transport",
  "salaries",
  "utilities",
  "rent",
  "marketing",
  "insurance",
  "training",
  "other",
] as const;

export default function ExpenseCreateForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());

    const res = await fetch("/api/admin/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Could not save expense.");
      setLoading(false);
      return;
    }

    setLoading(false);
    router.push("/admin/expenses");
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-2xl border border-teal/30 bg-white p-5 shadow-soft"
    >
      <h2 className="font-heading text-lg font-bold text-navy">Log expense</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          name="expense_date"
          type="date"
          required
          className="rounded-xl border border-navy/15 px-3 py-2 text-sm"
        />
        <select
          name="category"
          defaultValue="supplies"
          className="rounded-xl border border-navy/15 px-3 py-2 text-sm"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          name="description"
          required
          placeholder="Description"
          className="rounded-xl border border-navy/15 px-3 py-2 text-sm sm:col-span-2"
        />
        <input
          name="amount"
          type="number"
          step="0.01"
          min="0"
          required
          placeholder="Amount (£)"
          className="rounded-xl border border-navy/15 px-3 py-2 text-sm"
        />
        <input
          name="vendor"
          placeholder="Vendor"
          className="rounded-xl border border-navy/15 px-3 py-2 text-sm"
        />
      </div>
      {error ? (
        <p className="text-sm text-rose-700" role="alert">
          {error}
        </p>
      ) : null}
      <button type="submit" disabled={loading} className="btn-navy disabled:opacity-60">
        {loading ? "Saving…" : "Save expense"}
      </button>
    </form>
  );
}
