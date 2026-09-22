import { NextResponse } from "next/server";
import { getAdminApiContext, parseBody, writeAuditLog } from "@/lib/admin/api";
import { settingsUpdateSchema } from "@/lib/admin/schemas";

export async function GET() {
  const ctx = await getAdminApiContext(["admin", "manager", "finance"]);
  if (!ctx.ok) return ctx.error;

  const { data, error } = await ctx.supabase
    .from("company_settings")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data });
}

export async function PATCH(request: Request) {
  const ctx = await getAdminApiContext(["admin"]);
  if (!ctx.ok) return ctx.error;

  const body = await request.json();
  const parsed = parseBody(settingsUpdateSchema, body);
  if (!parsed.ok) return parsed.error;

  const { data: existing } = await ctx.supabase
    .from("company_settings")
    .select("id")
    .limit(1)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json(
      { error: "Settings row not found." },
      { status: 404 }
    );
  }

  const updates: Record<string, unknown> = {
    ...parsed.data,
    updated_at: new Date().toISOString(),
  };

  // Normalise empty optional strings to null
  for (const key of [
    "trading_name",
    "support_email",
    "website",
    "registered_address",
    "company_number",
    "vat_number",
    "invoice_footer",
  ]) {
    if (updates[key] === "") updates[key] = null;
  }

  const { data, error } = await ctx.supabase
    .from("company_settings")
    .update(updates)
    .eq("id", existing.id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await writeAuditLog(ctx.supabase, {
    userId: ctx.profile.id,
    action: "update",
    tableName: "company_settings",
    recordId: existing.id,
    newData: parsed.data,
  });

  return NextResponse.json({ data });
}
