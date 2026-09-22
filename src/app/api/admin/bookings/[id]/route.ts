import { NextResponse } from "next/server";
import { getAdminApiContext, parseBody, writeAuditLog } from "@/lib/admin/api";
import { bookingUpdateSchema } from "@/lib/admin/schemas";

type Params = { params: { id: string } };

export async function GET(_request: Request, { params }: Params) {
  const ctx = await getAdminApiContext();
  if (!ctx.ok) return ctx.error;

  const { data, error } = await ctx.supabase
    .from("bookings")
    .select("*, clients(contact_name, company_name, email, phone)")
    .eq("id", params.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }
  return NextResponse.json({ data });
}

export async function PATCH(request: Request, { params }: Params) {
  const ctx = await getAdminApiContext(["admin", "manager", "scheduler"]);
  if (!ctx.ok) return ctx.error;

  const body = await request.json();
  const parsed = parseBody(bookingUpdateSchema, body);
  if (!parsed.ok) return parsed.error;

  const updates: Record<string, unknown> = { ...parsed.data };
  if (updates.client_id === "") updates.client_id = null;
  if (updates.lead_id === "") updates.lead_id = null;
  if (updates.end_time === "") updates.end_time = null;
  if (updates.status === "completed") {
    updates.completed_at = new Date().toISOString();
  }

  const { data, error } = await ctx.supabase
    .from("bookings")
    .update(updates)
    .eq("id", params.id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await writeAuditLog(ctx.supabase, {
    userId: ctx.profile.id,
    action: "update",
    tableName: "bookings",
    recordId: params.id,
    newData: updates,
  });

  return NextResponse.json({ data });
}
