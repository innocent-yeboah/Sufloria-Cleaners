import { NextResponse } from "next/server";
import { getAdminApiContext, parseBody, writeAuditLog } from "@/lib/admin/api";
import { leadCreateSchema } from "@/lib/admin/schemas";

export async function GET(request: Request) {
  const ctx = await getAdminApiContext();
  if (!ctx.ok) return ctx.error;

  const { searchParams } = new URL(request.url);
  let query = ctx.supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  const status = searchParams.get("status");
  const q = searchParams.get("q");
  if (status) query = query.eq("status", status);
  if (q) {
    query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const ctx = await getAdminApiContext();
  if (!ctx.ok) return ctx.error;

  const body = await request.json();
  const parsed = parseBody(leadCreateSchema, body);
  if (!parsed.ok) return parsed.error;

  const payload = parsed.data;
  const { data, error } = await ctx.supabase
    .from("leads")
    .insert({
      name: payload.name,
      email: payload.email,
      phone: payload.phone || null,
      service_interest: payload.service_interest || null,
      message: payload.message || null,
      source: payload.source || "other",
      priority: payload.priority || "normal",
      notes: payload.notes || null,
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
    tableName: "leads",
    recordId: data.id,
    newData: payload,
  });

  return NextResponse.json({ id: data.id }, { status: 201 });
}
