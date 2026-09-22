import { NextResponse } from "next/server";
import { getAdminApiContext, parseBody, writeAuditLog } from "@/lib/admin/api";
import { complaintCreateSchema } from "@/lib/admin/schemas";

export async function GET() {
  const ctx = await getAdminApiContext();
  if (!ctx.ok) return ctx.error;

  const { data, error } = await ctx.supabase
    .from("complaints")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const ctx = await getAdminApiContext();
  if (!ctx.ok) return ctx.error;

  const body = await request.json();
  const parsed = parseBody(complaintCreateSchema, body);
  if (!parsed.ok) return parsed.error;
  const payload = parsed.data;

  const { data, error } = await ctx.supabase
    .from("complaints")
    .insert({
      client_name: payload.client_name,
      client_email: payload.client_email,
      client_phone: payload.client_phone || null,
      complaint_text: payload.complaint_text,
      booking_id: payload.booking_id || null,
      created_by: ctx.profile.id,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await writeAuditLog(ctx.supabase, {
    userId: ctx.profile.id,
    action: "create",
    tableName: "complaints",
    recordId: data.id,
    newData: payload,
  });

  return NextResponse.json({ id: data.id }, { status: 201 });
}
