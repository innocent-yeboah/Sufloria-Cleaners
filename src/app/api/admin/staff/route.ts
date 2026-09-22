import { NextResponse } from "next/server";
import { getAdminApiContext, parseBody, writeAuditLog } from "@/lib/admin/api";
import { staffCreateSchema } from "@/lib/admin/schemas";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import type { StaffRole } from "@/lib/admin/types";

export async function GET() {
  const ctx = await getAdminApiContext(["admin", "manager"]);
  if (!ctx.ok) return ctx.error;

  const { data, error } = await ctx.supabase
    .from("profiles")
    .select("*")
    .order("full_name");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const ctx = await getAdminApiContext(["admin"]);
  if (!ctx.ok) return ctx.error;

  const body = await request.json();
  const parsed = parseBody(staffCreateSchema, body);
  if (!parsed.ok) return parsed.error;
  const payload = parsed.data;

  let service;
  try {
    service = createSupabaseServiceClient();
  } catch {
    return NextResponse.json(
      { error: "Staff creation requires SUPABASE_SERVICE_ROLE_KEY." },
      { status: 503 }
    );
  }

  const { data: authData, error: authError } = await service.auth.admin.createUser({
    email: payload.email,
    password: payload.password,
    email_confirm: true,
    user_metadata: { full_name: payload.full_name },
    app_metadata: { role: payload.role },
  });

  if (authError || !authData.user) {
    return NextResponse.json(
      { error: authError?.message || "Could not create staff login." },
      { status: 400 }
    );
  }

  const userId = authData.user.id;

  // Trigger creates the base profile + staff_id; enrich it here.
  const { data: existing } = await service
    .from("profiles")
    .select("staff_id")
    .eq("id", userId)
    .maybeSingle();

  let staffId = existing?.staff_id as string | null | undefined;
  if (!staffId) {
    const { data: allocated } = await service.rpc("allocate_staff_id");
    staffId = allocated as string | null;
  }

  const { data: profile, error: profileError } = await service
    .from("profiles")
    .upsert({
      id: userId,
      email: payload.email,
      full_name: payload.full_name,
      phone: payload.phone || null,
      role: payload.role as StaffRole,
      is_active: payload.is_active ?? true,
      job_title: payload.job_title || null,
      hire_date: payload.hire_date || null,
      address: payload.address || null,
      emergency_contact: payload.emergency_contact || null,
      notes: payload.notes || null,
      staff_id: staffId || null,
      updated_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (profileError) {
    return NextResponse.json(
      { error: profileError.message },
      { status: 500 }
    );
  }

  await writeAuditLog(service, {
    userId: ctx.profile.id,
    action: "create",
    tableName: "profiles",
    recordId: userId,
    newData: {
      email: payload.email,
      role: payload.role,
      staff_id: profile.staff_id,
    },
  });

  return NextResponse.json({ id: userId, data: profile }, { status: 201 });
}
