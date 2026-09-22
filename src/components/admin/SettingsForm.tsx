"use client";

import { FormEvent, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

export type CompanySettings = {
  id: string;
  company_name: string;
  trading_name: string | null;
  email: string;
  support_email: string | null;
  phone: string;
  website: string | null;
  registered_address: string | null;
  company_number: string | null;
  vat_number: string | null;
  vat_rate: number;
  currency: string;
  timezone: string;
  invoice_prefix: string;
  invoice_next_number: number;
  invoice_footer: string | null;
  staff_prefix: string;
  staff_next_number: number;
  data_retention_days: number;
  updated_at?: string;
};

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-navy/8 bg-white p-5 shadow-soft sm:p-6">
      <div className="mb-5 border-b border-navy/8 pb-4">
        <h2 className="font-heading text-lg font-bold text-navy">{title}</h2>
        <p className="mt-1 text-sm text-dark/65">{description}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({
  label,
  hint,
  className = "",
  children,
}: {
  label: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={`text-sm ${className}`}>
      <span className="mb-1.5 block font-semibold text-navy">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-dark/55">{hint}</span> : null}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-navy/15 px-3 py-2.5 text-sm outline-none ring-teal focus:ring-2";
const readOnlyClass =
  "w-full rounded-xl border border-navy/10 bg-light px-3 py-2.5 text-sm text-dark/70";

export default function SettingsForm({
  settings,
}: {
  settings: CompanySettings;
}) {
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

    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company_name: form.get("company_name"),
        trading_name: form.get("trading_name"),
        email: form.get("email"),
        support_email: form.get("support_email"),
        phone: form.get("phone"),
        website: form.get("website"),
        registered_address: form.get("registered_address"),
        company_number: form.get("company_number"),
        vat_number: form.get("vat_number"),
        vat_rate: Number(form.get("vat_rate")),
        currency: form.get("currency"),
        timezone: form.get("timezone"),
        invoice_prefix: form.get("invoice_prefix"),
        invoice_footer: form.get("invoice_footer"),
        staff_prefix: form.get("staff_prefix"),
        data_retention_days: Number(form.get("data_retention_days")),
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Could not save settings.");
      setLoading(false);
      return;
    }

    setLoading(false);
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Section
        title="Company identity"
        description="Legal and trading details shown on invoices and client communications."
      >
        <Field label="Legal company name" className="sm:col-span-2">
          <input
            name="company_name"
            defaultValue={settings.company_name}
            required
            className={inputClass}
          />
        </Field>
        <Field label="Trading name" hint="Optional display name if different from legal name.">
          <input
            name="trading_name"
            defaultValue={settings.trading_name || ""}
            className={inputClass}
          />
        </Field>
        <Field label="Website">
          <input
            name="website"
            type="url"
            placeholder="https://"
            defaultValue={settings.website || ""}
            className={inputClass}
          />
        </Field>
        <Field label="Companies House number">
          <input
            name="company_number"
            defaultValue={settings.company_number || ""}
            placeholder="e.g. 12345678"
            className={inputClass}
          />
        </Field>
        <Field label="VAT registration number">
          <input
            name="vat_number"
            defaultValue={settings.vat_number || ""}
            placeholder="e.g. GB123456789"
            className={inputClass}
          />
        </Field>
        <Field label="Registered address" className="sm:col-span-2">
          <textarea
            name="registered_address"
            rows={2}
            defaultValue={settings.registered_address || ""}
            className={inputClass}
          />
        </Field>
      </Section>

      <Section
        title="Contact channels"
        description="Primary business contact details for enquiries and support."
      >
        <Field label="Primary email">
          <input
            name="email"
            type="email"
            defaultValue={settings.email}
            required
            className={inputClass}
          />
        </Field>
        <Field label="Support email" hint="Defaults to primary email if left blank.">
          <input
            name="support_email"
            type="email"
            defaultValue={settings.support_email || ""}
            className={inputClass}
          />
        </Field>
        <Field label="Phone">
          <input
            name="phone"
            defaultValue={settings.phone}
            required
            className={inputClass}
          />
        </Field>
        <Field label="Timezone">
          <select
            name="timezone"
            defaultValue={settings.timezone || "Europe/London"}
            className={inputClass}
          >
            <option value="Europe/London">Europe/London (UK)</option>
            <option value="Europe/Dublin">Europe/Dublin</option>
            <option value="UTC">UTC</option>
          </select>
        </Field>
      </Section>

      <Section
        title="Finance & invoicing"
        description="UK VAT defaults and sequential invoice numbering."
      >
        <Field label="VAT rate (%)">
          <input
            name="vat_rate"
            type="number"
            step="0.01"
            min={0}
            max={100}
            defaultValue={settings.vat_rate}
            className={inputClass}
          />
        </Field>
        <Field label="Currency">
          <select
            name="currency"
            defaultValue={settings.currency || "GBP"}
            className={inputClass}
          >
            <option value="GBP">GBP — Pound sterling</option>
            <option value="EUR">EUR — Euro</option>
            <option value="USD">USD — US dollar</option>
          </select>
        </Field>
        <Field label="Invoice prefix">
          <input
            name="invoice_prefix"
            defaultValue={settings.invoice_prefix}
            className={inputClass}
          />
        </Field>
        <Field
          label="Next invoice number"
          hint="Assigned automatically when invoices are created."
        >
          <input
            value={settings.invoice_next_number}
            disabled
            className={readOnlyClass}
          />
        </Field>
        <Field
          label="Invoice footer / payment note"
          className="sm:col-span-2"
          hint="Shown on invoices (bank details, payment terms, etc.)."
        >
          <textarea
            name="invoice_footer"
            rows={3}
            defaultValue={settings.invoice_footer || ""}
            placeholder="Payment due within 14 days. Bank transfer preferred."
            className={inputClass}
          />
        </Field>
      </Section>

      <Section
        title="Staff numbering"
        description="Human-readable staff IDs issued when new team members are added."
      >
        <Field label="Staff ID prefix">
          <input
            name="staff_prefix"
            defaultValue={settings.staff_prefix || "RCS-S"}
            className={inputClass}
          />
        </Field>
        <Field
          label="Next staff number"
          hint="Next ID will look like RCS-S-1002."
        >
          <input
            value={settings.staff_next_number}
            disabled
            className={readOnlyClass}
          />
        </Field>
      </Section>

      <Section
        title="Data protection"
        description="Retention policy for GDPR-minded UK operations."
      >
        <Field
          label="Data retention (days)"
          hint="2555 days ≈ 7 years — common UK business retention window."
          className="sm:col-span-2"
        >
          <input
            name="data_retention_days"
            type="number"
            min={30}
            max={3650}
            defaultValue={settings.data_retention_days}
            className={inputClass}
          />
        </Field>
      </Section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {error ? (
            <p className="text-sm text-rose-700" role="alert">
              {error}
            </p>
          ) : null}
          {saved ? (
            <p className="text-sm text-emerald-700" role="status">
              System settings saved.
            </p>
          ) : null}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="btn-navy disabled:opacity-60"
        >
          {loading ? "Saving…" : "Save settings"}
        </button>
      </div>
    </form>
  );
}
