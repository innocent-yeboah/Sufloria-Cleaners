import { NextResponse } from "next/server";
import { getAdminApiContext, parseBody, writeAuditLog } from "@/lib/admin/api";
import { clientCreateSchema } from "@/lib/admin/schemas";

type Params = { params: { id: string } };

export async function GET(_request: Request, { params }: Params) {
  const ctx = await getAdminApiContext();
  if (!ctx.ok) return ctx.error;

  const { data, error } = await ctx.supabase
    .from("clients")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Client not found." }, { status: 404 });
  }
  return NextResponse.json({ data });
}

export async function PATCH(request: Request, { params }: Params) {
  const ctx = await getAdminApiContext(["admin", "manager", "scheduler"]);
  if (!ctx.ok) return ctx.error;

  const body = await request.json();
  const parsed = parseBody(clientCreateSchema.partial(), body);
  if (!parsed.ok) return parsed.error;

  const { data, error } = await ctx.supabase
    .from("clients")
    .update(parsed.data)
    .eq("id", params.id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await writeAuditLog(ctx.supabase, {
    userId: ctx.profile.id,
    action: "update",
    tableName: "clients",
    recordId: params.id,
    newData: parsed.data,
  });

  return NextResponse.json({ data });
}
