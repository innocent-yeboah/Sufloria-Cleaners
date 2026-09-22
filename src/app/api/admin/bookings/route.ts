import { NextResponse } from "next/server";
import { getAdminApiContext, parseBody, writeAuditLog } from "@/lib/admin/api";
import { bookingCreateSchema } from "@/lib/admin/schemas";

export async function GET(request: Request) {
  const ctx = await getAdminApiContext();
  if (!ctx.ok) return ctx.error;

  const { searchParams } = new URL(request.url);
  let query = ctx.supabase
    .from("bookings")
    .select("*, clients(contact_name, company_name)")
    .order("booking_date", { ascending: true })
    .limit(300);

  const status = searchParams.get("status");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  if (status) query = query.eq("status", status);
  if (from) query = query.gte("booking_date", from);
  if (to) query = query.lte("booking_date", to);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const ctx = await getAdminApiContext(["admin", "manager", "scheduler"]);
  if (!ctx.ok) return ctx.error;

  const body = await request.json();
  const parsed = parseBody(bookingCreateSchema, body);
  if (!parsed.ok) return parsed.error;
  const payload = parsed.data;

  const { data, error } = await ctx.supabase
    .from("bookings")
    .insert({
      client_id: payload.client_id || null,
      lead_id: payload.lead_id || null,
      service_type: payload.service_type || null,
      service_description: payload.service_description || null,
      property_address: payload.property_address || null,
      property_postcode: payload.property_postcode || null,
      booking_date: payload.booking_date,
      start_time: payload.start_time,
      end_time: payload.end_time || null,
      crew_size: payload.crew_size || 1,
      status: payload.status || "pending",
      price_quote: payload.price_quote ?? null,
      notes: payload.notes || null,
      assigned_team: payload.assigned_team || [],
      created_by: ctx.profile.id,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (payload.lead_id) {
    await ctx.supabase
      .from("leads")
      .update({ status: "booked", booked_at: new Date().toISOString() })
      .eq("id", payload.lead_id);
  }

  await writeAuditLog(ctx.supabase, {
    userId: ctx.profile.id,
    action: "create",
    tableName: "bookings",
    recordId: data.id,
    newData: payload,
  });

  return NextResponse.json({ id: data.id }, { status: 201 });
}
