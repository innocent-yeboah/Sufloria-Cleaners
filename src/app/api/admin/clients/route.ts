import { NextResponse } from "next/server";
import { getAdminApiContext, parseBody, writeAuditLog } from "@/lib/admin/api";
import { clientCreateSchema } from "@/lib/admin/schemas";

export async function GET(request: Request) {
  const ctx = await getAdminApiContext();
  if (!ctx.ok) return ctx.error;

  const { searchParams } = new URL(request.url);
  let query = ctx.supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(300);

  const q = searchParams.get("q");
  if (q) {
    query = query.or(
      `contact_name.ilike.%${q}%,company_name.ilike.%${q}%,email.ilike.%${q}%`
    );
  }

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
  const parsed = parseBody(clientCreateSchema, body);
  if (!parsed.ok) return parsed.error;
  const payload = parsed.data;

  const { data, error } = await ctx.supabase
    .from("clients")
    .insert({
      company_name: payload.company_name || null,
      contact_name: payload.contact_name,
      email: payload.email,
      phone: payload.phone || null,
      address: payload.address || null,
      postcode: payload.postcode || null,
      city: payload.city || null,
      notes: payload.notes || null,
      status: payload.status || "active",
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
    tableName: "clients",
    recordId: data.id,
    newData: payload,
  });

  return NextResponse.json({ id: data.id }, { status: 201 });
}
