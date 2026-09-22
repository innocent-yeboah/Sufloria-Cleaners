"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { Invoice } from "@/lib/admin/types";

export default function InvoiceStatusForm({ invoice }: { invoice: Invoice }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const form = new FormData(event.currentTarget);
    await fetch(`/api/admin/invoices/${invoice.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: form.get("status"),
        payment_method: form.get("payment_method") || null,
      }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-center gap-2">
      <select
        name="status"
        defaultValue={invoice.status}
        className="rounded-lg border border-navy/15 px-2 py-1.5 text-sm"
      >
        {["draft", "sent", "paid", "overdue", "cancelled"].map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <select
        name="payment_method"
        defaultValue=""
        className="rounded-lg border border-navy/15 px-2 py-1.5 text-sm"
      >
        <option value="">Payment method</option>
        {["bank_transfer", "card", "cash", "cheque"].map((s) => (
          <option key={s} value={s}>
            {s.replace(/_/g, " ")}
          </option>
        ))}
      </select>
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
