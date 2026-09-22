import { NextResponse } from "next/server";
import { getAdminApiContext, parseBody, writeAuditLog } from "@/lib/admin/api";
import { profileUpdateSchema } from "@/lib/admin/schemas";

type Params = { params: { id: string } };

export async function GET(_request: Request, { params }: Params) {
  const ctx = await getAdminApiContext(["admin", "manager"]);
  if (!ctx.ok) return ctx.error;

  const { data, error } = await ctx.supabase
    .from("profiles")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Staff member not found." }, { status: 404 });
  }
  return NextResponse.json({ data });
}

export async function PATCH(request: Request, { params }: Params) {
  const ctx = await getAdminApiContext(["admin", "manager"]);
  if (!ctx.ok) return ctx.error;

  const body = await request.json();
  const parsed = parseBody(profileUpdateSchema, body);
  if (!parsed.ok) return parsed.error;

  // Only admins can change roles
  if (parsed.data.role && ctx.profile.role !== "admin") {
    return NextResponse.json(
      { error: "Only admins can change staff roles." },
      { status: 403 }
    );
  }

  // Managers cannot create/promote admins
  if (
    parsed.data.role === "admin" &&
    ctx.profile.role !== "admin"
  ) {
    return NextResponse.json(
      { error: "Only admins can assign the admin role." },
      { status: 403 }
    );
  }

  const updates: Record<string, unknown> = {
    ...parsed.data,
    updated_at: new Date().toISOString(),
  };

  if (updates.hire_date === "") updates.hire_date = null;

  const { data, error } = await ctx.supabase
    .from("profiles")
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
    tableName: "profiles",
    recordId: params.id,
    newData: parsed.data,
  });

  return NextResponse.json({ data });
}
