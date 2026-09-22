"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { Client } from "@/lib/admin/types";

type Props = { clients: Client[] };

export default function InvoiceCreateForm({ clients }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const clientId = String(form.get("client_id") || "");
    const client = clients.find((c) => c.id === clientId);

    const payload = {
      client_id: clientId || null,
      client_name:
        String(form.get("client_name") || "") ||
        client?.company_name ||
        client?.contact_name ||
        "",
      client_email: String(form.get("client_email") || "") || client?.email || "",
      client_address:
        String(form.get("client_address") || "") || client?.address || "",
      amount: Number(form.get("amount") || 0),
      vat_rate: Number(form.get("vat_rate") || 20),
      issue_date: String(form.get("issue_date") || ""),
      due_date: String(form.get("due_date") || ""),
      description: String(form.get("description") || ""),
      notes: String(form.get("notes") || ""),
      status: String(form.get("status") || "draft"),
    };

    const res = await fetch("/api/admin/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Could not create invoice.");
      setLoading(false);
      return;
    }

    setLoading(false);
    router.push("/admin/invoices");
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-2xl border border-teal/30 bg-white p-5 shadow-soft"
    >
      <h2 className="font-heading text-lg font-bold text-navy">New invoice</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <select
          name="client_id"
          className="rounded-xl border border-navy/15 px-3 py-2 text-sm sm:col-span-2"
          defaultValue=""
        >
          <option value="">Select client (optional)</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.company_name || c.contact_name}
            </option>
          ))}
        </select>
        <input
          name="client_name"
          required
          placeholder="Client name on invoice"
          className="rounded-xl border border-navy/15 px-3 py-2 text-sm"
        />
        <input
          name="client_email"
          type="email"
          placeholder="Client email"
          className="rounded-xl border border-navy/15 px-3 py-2 text-sm"
        />
        <input
          name="amount"
          type="number"
          step="0.01"
          min="0"
          required
          placeholder="Net amount (£)"
          className="rounded-xl border border-navy/15 px-3 py-2 text-sm"
        />
        <input
          name="vat_rate"
          type="number"
          step="0.01"
          defaultValue={20}
          placeholder="VAT %"
          className="rounded-xl border border-navy/15 px-3 py-2 text-sm"
        />
        <input
          name="issue_date"
          type="date"
          required
          className="rounded-xl border border-navy/15 px-3 py-2 text-sm"
        />
        <input
          name="due_date"
          type="date"
          required
          className="rounded-xl border border-navy/15 px-3 py-2 text-sm"
        />
        <select
          name="status"
          defaultValue="draft"
          className="rounded-xl border border-navy/15 px-3 py-2 text-sm"
        >
          {["draft", "sent", "paid", "overdue", "cancelled"].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <input
          name="description"
          placeholder="Line item description"
          defaultValue="Professional cleaning services"
          className="rounded-xl border border-navy/15 px-3 py-2 text-sm sm:col-span-2"
        />
        <textarea
          name="notes"
          rows={2}
          placeholder="Notes"
          className="rounded-xl border border-navy/15 px-3 py-2 text-sm sm:col-span-2"
        />
      </div>
      {error ? (
        <p className="text-sm text-rose-700" role="alert">
          {error}
        </p>
      ) : null}
      <button type="submit" disabled={loading} className="btn-navy disabled:opacity-60">
        {loading ? "Creating…" : "Create invoice"}
      </button>
    </form>
  );
}
