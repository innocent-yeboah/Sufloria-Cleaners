import { NextResponse } from "next/server";
import { getAdminApiContext, parseBody, writeAuditLog } from "@/lib/admin/api";
import { leadUpdateSchema } from "@/lib/admin/schemas";

type Params = { params: { id: string } };

export async function GET(_request: Request, { params }: Params) {
  const ctx = await getAdminApiContext();
  if (!ctx.ok) return ctx.error;

  const { data, error } = await ctx.supabase
    .from("leads")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Lead not found." }, { status: 404 });
  }
  return NextResponse.json({ data });
}

export async function PATCH(request: Request, { params }: Params) {
  const ctx = await getAdminApiContext();
  if (!ctx.ok) return ctx.error;

  const body = await request.json();
  const parsed = parseBody(leadUpdateSchema, body);
  if (!parsed.ok) return parsed.error;

  const updates: Record<string, unknown> = { ...parsed.data };
  if (updates.status === "contacted") {
    updates.contacted_at = new Date().toISOString();
  }
  if (updates.status === "quoted") {
    updates.quoted_at = new Date().toISOString();
  }
  if (updates.status === "closing") {
    updates.closing_at = new Date().toISOString();
  }
  if (updates.status === "booked") {
    updates.booked_at = new Date().toISOString();
  }

  const { data, error } = await ctx.supabase
    .from("leads")
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
    tableName: "leads",
    recordId: params.id,
    newData: updates,
  });

  return NextResponse.json({ data });
}
