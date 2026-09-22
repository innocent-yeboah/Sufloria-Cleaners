"use client";

import { FormEvent, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  CLIENT_TYPES,
  SERVICE_OPTIONS,
  SERVICES,
} from "@/lib/constants";
import { HONEYPOT_FIELD } from "@/lib/contact-limits";

type QuoteFormProps = {
  defaultService?: string;
};

export default function QuoteForm({ defaultService }: QuoteFormProps) {
  const params = useSearchParams();
  const commercial = params.get("type") === "commercial";
  const prefillSlug = params.get("service");
  const prefillTitle = useMemo(() => {
    if (defaultService) return defaultService;
    const match = SERVICES.find((service) => service.slug === prefillSlug);
    if (match) return match.title;
    if (commercial) return "Commercial & Office Cleaning";
    return SERVICE_OPTIONS[0];
  }, [commercial, defaultService, prefillSlug]);

  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const startedAt = useMemo(() => Date.now(), []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setError(null);
    const form = event.currentTarget;
    const data = new FormData(form);
    data.set("formStartedAt", String(startedAt));

    try {
      const response = await fetch("/api/quote", {
        method: "POST",
        body: data,
      });
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setStatus("error");
        setError(payload.error || "Let's try that again together?");
        return;
      }
      setStatus("sent");
      form.reset();
    } catch {
      setStatus("error");
      setError("Let's try that again together?");
    }
  }

  if (status === "sent") {
    return (
      <div className="gold-frame bg-white p-6 sm:p-8">
        <h2 className="heading-lg">Thank you</h2>
        <p className="mt-3 text-dark/75">
          We have your enquiry. Sufloria will be in touch with a tailored, no-obligation
          quote.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="gold-frame grid gap-4 bg-white p-6 sm:p-8">
      <input
        type="text"
        name={HONEYPOT_FIELD}
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-semibold">
          Enquiry type
          <select
            name="enquiryType"
            defaultValue={commercial ? "commercial" : "residential"}
            className="rounded-xl border-2 border-gold px-3 py-2.5 font-normal"
          >
            <option value="residential">Residential</option>
            <option value="commercial">Commercial partner</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          I am a
          <select name="clientType" className="rounded-xl border-2 border-gold px-3 py-2.5 font-normal">
            {CLIENT_TYPES.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-semibold">
          Name
          <input required name="name" className="rounded-xl border-2 border-gold px-3 py-2.5 font-normal" />
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          Email
          <input required type="email" name="email" className="rounded-xl border-2 border-gold px-3 py-2.5 font-normal" />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-semibold">
          Phone
          <input required name="phone" className="rounded-xl border-2 border-gold px-3 py-2.5 font-normal" />
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          Service
          <select
            name="service"
            defaultValue={prefillTitle}
            className="rounded-xl border-2 border-gold px-3 py-2.5 font-normal"
          >
            {SERVICE_OPTIONS.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="grid gap-1 text-sm font-semibold">
          Property type
          <select name="propertyType" className="rounded-xl border-2 border-gold px-3 py-2.5 font-normal">
            <option>House</option>
            <option>Flat</option>
            <option>Office</option>
            <option>New build</option>
            <option>Other</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          Bedrooms
          <select name="bedrooms" className="rounded-xl border-2 border-gold px-3 py-2.5 font-normal">
            <option>Studio</option>
            <option>1</option>
            <option>2</option>
            <option>3</option>
            <option>4</option>
            <option>5+</option>
            <option>Not applicable</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          Postcode
          <input required name="postcode" className="rounded-xl border-2 border-gold px-3 py-2.5 font-normal" />
        </label>
      </div>
      <label className="grid gap-1 text-sm font-semibold">
        Preferred date
        <input type="date" name="preferredDate" className="rounded-xl border-2 border-gold px-3 py-2.5 font-normal" />
      </label>
      <label className="grid gap-1 text-sm font-semibold">
        Notes
        <textarea
          name="message"
          rows={4}
          required
          minLength={10}
          className="rounded-xl border-2 border-gold px-3 py-2.5 font-normal"
        />
      </label>
      <label className="grid gap-1 text-sm font-semibold">
        Photos of the property
        <input
          type="file"
          name="photos"
          accept="image/*"
          multiple
          className="rounded-xl border-2 border-gold px-3 py-2.5 font-normal"
        />
      </label>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <button type="submit" className="btn-primary w-fit" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Send quote request"}
      </button>
    </form>
  );
}
