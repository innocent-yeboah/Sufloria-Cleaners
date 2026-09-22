import { NextResponse } from "next/server";
import { getAdminApiContext, parseBody, writeAuditLog } from "@/lib/admin/api";
import { selfProfileUpdateSchema } from "@/lib/admin/schemas";

export async function GET() {
  const ctx = await getAdminApiContext();
  if (!ctx.ok) return ctx.error;
  return NextResponse.json({ data: ctx.profile });
}

export async function PATCH(request: Request) {
  const ctx = await getAdminApiContext();
  if (!ctx.ok) return ctx.error;

  const body = await request.json();
  const parsed = parseBody(selfProfileUpdateSchema, body);
  if (!parsed.ok) return parsed.error;

  const updates = {
    full_name: parsed.data.full_name,
    phone: parsed.data.phone || null,
    job_title: parsed.data.job_title || null,
    address: parsed.data.address || null,
    emergency_contact: parsed.data.emergency_contact || null,
    notes: parsed.data.notes || null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await ctx.supabase
    .from("profiles")
    .update(updates)
    .eq("id", ctx.profile.id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await writeAuditLog(ctx.supabase, {
    userId: ctx.profile.id,
    action: "update_self_profile",
    tableName: "profiles",
    recordId: ctx.profile.id,
    newData: updates,
  });

  return NextResponse.json({ data });
}
