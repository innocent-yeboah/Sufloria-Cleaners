import { NextResponse } from "next/server";
import { SERVICE_OPTIONS } from "@/lib/constants";
import { CONTACT_LIMITS, HONEYPOT_FIELD } from "@/lib/contact-limits";
import { checkRateLimit, pruneRateLimits } from "@/lib/rate-limit";
import { getResendClient } from "@/lib/resend";
import { mapWebsiteServiceToLead } from "@/lib/lead-service";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { verifyTurnstileToken } from "@/lib/turnstile";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip") || "unknown";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(request: Request) {
  try {
    pruneRateLimits();
    const ip = getClientIp(request);
    const rate = checkRateLimit(
      `quote:${ip}`,
      CONTACT_LIMITS.rateLimitMax,
      CONTACT_LIMITS.rateLimitWindowMs
    );
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many enquiries from this connection. Please wait a few minutes." },
        { status: 429, headers: { "Retry-After": String(rate.retryAfterSec) } }
      );
    }

    const form = await request.formData();
    const honeypot = String(form.get(HONEYPOT_FIELD) || "").trim();
    if (honeypot) {
      return NextResponse.json({ ok: true });
    }

    const turnstileToken = String(form.get("turnstileToken") || "");
    const turnstile = await verifyTurnstileToken(turnstileToken || undefined, ip);
    if (!turnstile.success) {
      return NextResponse.json(
        { error: turnstile.error || "Security check failed." },
        { status: 400 }
      );
    }

    const name = String(form.get("name") || "").trim().slice(0, CONTACT_LIMITS.name);
    const email = String(form.get("email") || "").trim().slice(0, CONTACT_LIMITS.email);
    const phone = String(form.get("phone") || "").trim().slice(0, CONTACT_LIMITS.phone);
    const service = String(form.get("service") || "").trim();
    const message = String(form.get("message") || "").trim().slice(0, CONTACT_LIMITS.message);
    const enquiryType = String(form.get("enquiryType") || "residential").trim();
    const clientType = String(form.get("clientType") || "").trim();
    const propertyType = String(form.get("propertyType") || "").trim();
    const bedrooms = String(form.get("bedrooms") || "").trim();
    const postcode = String(form.get("postcode") || "").trim();
    const preferredDate = String(form.get("preferredDate") || "").trim();

    if (!name || name.length < 2 || !email || !phone || !service || message.length < 10 || !postcode) {
      return NextResponse.json(
        { error: "Please complete all required fields." },
        { status: 400 }
      );
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    if (!SERVICE_OPTIONS.includes(service as (typeof SERVICE_OPTIONS)[number])) {
      return NextResponse.json({ error: "Please select a valid service." }, { status: 400 });
    }

    const notes = [
      message,
      `Enquiry: ${enquiryType}`,
      `Client type: ${clientType}`,
      `Property: ${propertyType}`,
      `Bedrooms: ${bedrooms}`,
      `Postcode: ${postcode}`,
      preferredDate ? `Preferred date: ${preferredDate}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    let supabase;
    try {
      supabase = createSupabaseServiceClient();
    } catch {
      const resend = getResendClient();
      if (resend) {
        await resend.emails.send({
          from: process.env.CONTACT_FROM_EMAIL || "Sufloria Cleaners <onboarding@resend.dev>",
          to: [process.env.CONTACT_TO_EMAIL || "contact@sufloriacleaning.com"],
          replyTo: email,
          subject: `New Sufloria quote request — ${service}`,
          html: `<p><strong>${escapeHtml(name)}</strong> (${escapeHtml(email)} / ${escapeHtml(phone)})</p><pre>${escapeHtml(notes)}</pre>`,
        });
        return NextResponse.json({ ok: true });
      }
      return NextResponse.json(
        { error: "We're unable to accept enquiries right now. Please call or WhatsApp us." },
        { status: 503 }
      );
    }

    const { data: leadRow, error: leadError } = await supabase
      .from("leads")
      .insert({
        name,
        email,
        phone,
        service_interest: mapWebsiteServiceToLead(service),
        message: notes,
        property_type: propertyType || null,
        property_size: bedrooms || null,
        source: "website",
        status: "new",
        priority: enquiryType === "commercial" ? "high" : "normal",
        notes,
        enquiry_type: enquiryType,
        client_type: clientType || null,
        postcode: postcode || null,
        preferred_date: preferredDate || null,
      })
      .select("id")
      .single();

    if (leadError) {
      console.error("Lead insert error:", leadError);
      return NextResponse.json(
        { error: "We couldn't save your enquiry. Please try again shortly." },
        { status: 500 }
      );
    }

    const photos = form.getAll("photos").filter((item) => item instanceof File) as File[];
    const photoPaths: string[] = [];
    for (const [index, file] of photos.slice(0, 8).entries()) {
      if (!file.size || file.size > 8 * 1024 * 1024) continue;
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${leadRow.id}/${index}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("quote-photos")
        .upload(path, await file.arrayBuffer(), {
          contentType: file.type || "image/jpeg",
          upsert: false,
        });
      if (!uploadError) photoPaths.push(path);
    }

    if (photoPaths.length) {
      await supabase
        .from("leads")
        .update({
          photo_paths: photoPaths,
          notes: `${notes}\nphotos=${photoPaths.join(",")}`,
        })
        .eq("id", leadRow.id);
    }

    const resend = getResendClient();
    if (resend) {
      await resend.emails.send({
        from: process.env.CONTACT_FROM_EMAIL || "Sufloria Cleaners <onboarding@resend.dev>",
        to: [process.env.CONTACT_TO_EMAIL || "contact@sufloriacleaning.com"],
        replyTo: email,
        subject: `New Sufloria quote request — ${service}`,
        html: `
          <h2>New Sufloria quote request</h2>
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
          <p><strong>Service:</strong> ${escapeHtml(service)}</p>
          <p>${escapeHtml(notes).replace(/\n/g, "<br />")}</p>
        `,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Quote API error:", error);
    return NextResponse.json(
      { error: "Let's try that again together?" },
      { status: 500 }
    );
  }
}
