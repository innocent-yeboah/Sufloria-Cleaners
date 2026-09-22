import { NextResponse } from "next/server";
import { getAdminApiContext, parseBody, writeAuditLog } from "@/lib/admin/api";
import { complaintUpdateSchema } from "@/lib/admin/schemas";

type Params = { params: { id: string } };

export async function PATCH(request: Request, { params }: Params) {
  const ctx = await getAdminApiContext(["admin", "manager"]);
  if (!ctx.ok) return ctx.error;

  const body = await request.json();
  const parsed = parseBody(complaintUpdateSchema, body);
  if (!parsed.ok) return parsed.error;

  const updates: Record<string, unknown> = { ...parsed.data };
  if (
    updates.status === "resolved" ||
    updates.status === "closed"
  ) {
    updates.resolved_at = new Date().toISOString();
  }

  const { data, error } = await ctx.supabase
    .from("complaints")
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
    tableName: "complaints",
    recordId: params.id,
    newData: updates,
  });

  return NextResponse.json({ data });
}
