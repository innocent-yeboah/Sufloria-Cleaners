import { NextResponse } from "next/server";
import { getAdminApiContext, parseBody, writeAuditLog } from "@/lib/admin/api";
import { leadConvertSchema } from "@/lib/admin/schemas";

type Params = { params: { id: string } };

export async function POST(request: Request, { params }: Params) {
  const ctx = await getAdminApiContext(["admin", "manager", "scheduler"]);
  if (!ctx.ok) return ctx.error;

  const { data: lead, error: leadError } = await ctx.supabase
    .from("leads")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (leadError) {
    return NextResponse.json({ error: leadError.message }, { status: 500 });
  }
  if (!lead) {
    return NextResponse.json({ error: "Lead not found." }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = parseBody(leadConvertSchema, body);
  if (!parsed.ok) return parsed.error;
  const input = parsed.data;

  const { data: client, error: clientError } = await ctx.supabase
    .from("clients")
    .insert({
      company_name: input.company_name || null,
      contact_name: lead.name,
      email: lead.email,
      phone: lead.phone,
      address: input.address || null,
      postcode: input.postcode || null,
      city: input.city || null,
      notes: lead.message,
      created_by: ctx.profile.id,
    })
    .select("id")
    .single();

  if (clientError) {
    return NextResponse.json({ error: clientError.message }, { status: 500 });
  }

  let bookingId: string | null = null;
  if (input.booking_date && input.start_time) {
    const { data: booking, error: bookingError } = await ctx.supabase
      .from("bookings")
      .insert({
        client_id: client.id,
        lead_id: lead.id,
        service_type: lead.service_interest,
        property_address: input.address || null,
        property_postcode: input.postcode || null,
        booking_date: input.booking_date,
        start_time: input.start_time,
        price_quote: input.price_quote ?? lead.quote_amount,
        status: "confirmed",
        notes: lead.notes || lead.message,
        created_by: ctx.profile.id,
      })
      .select("id")
      .single();

    if (bookingError) {
      return NextResponse.json({ error: bookingError.message }, { status: 500 });
    }
    bookingId = booking.id;
  }

  await ctx.supabase
    .from("leads")
    .update({
      status: "booked",
      booked_at: new Date().toISOString(),
    })
    .eq("id", lead.id);

  await writeAuditLog(ctx.supabase, {
    userId: ctx.profile.id,
    action: "convert_lead",
    tableName: "leads",
    recordId: lead.id,
    newData: { clientId: client.id, bookingId },
  });

  return NextResponse.json({
    clientId: client.id,
    bookingId,
  });
}
