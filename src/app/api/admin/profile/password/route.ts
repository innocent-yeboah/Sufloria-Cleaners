import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAdminApiContext, parseBody, writeAuditLog } from "@/lib/admin/api";
import { selfPasswordChangeSchema } from "@/lib/admin/schemas";
import {
  getAdminCredentialConfig,
  timingSafeEqualString,
} from "@/lib/admin/local-session";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

export async function POST(request: Request) {
  const ctx = await getAdminApiContext();
  if (!ctx.ok) return ctx.error;

  const body = await request.json();
  const parsed = parseBody(selfPasswordChangeSchema, body);
  if (!parsed.ok) return parsed.error;

  const { current_password, new_password } = parsed.data;
  const email = (ctx.profile.email || "").toLowerCase();
  const localConfig = getAdminCredentialConfig();
  const isEnvAdmin =
    localConfig.configured &&
    timingSafeEqualString(email, localConfig.email);

  // Verify current password against local env login and/or Auth credentials
  let currentOk = false;

  if (isEnvAdmin && timingSafeEqualString(current_password, localConfig.password)) {
    currentOk = true;
  }

  if (!currentOk) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (url && anon) {
      const probe = createClient(url, anon, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { error } = await probe.auth.signInWithPassword({
        email,
        password: current_password,
      });
      if (!error) currentOk = true;
    }
  }

  if (!currentOk) {
    return NextResponse.json(
      { error: "Current password is incorrect." },
      { status: 401 }
    );
  }

  let service;
  try {
    service = createSupabaseServiceClient();
  } catch {
    return NextResponse.json(
      { error: "Password updates require SUPABASE_SERVICE_ROLE_KEY." },
      { status: 503 }
    );
  }

  const { error: updateError } = await service.auth.admin.updateUserById(
    ctx.profile.id,
    { password: new_password }
  );

  if (updateError) {
    return NextResponse.json(
      { error: updateError.message || "Could not update password." },
      { status: 500 }
    );
  }

  await writeAuditLog(service, {
    userId: ctx.profile.id,
    action: "change_password",
    tableName: "profiles",
    recordId: ctx.profile.id,
  });

  const response: {
    ok: true;
    notice?: string;
  } = { ok: true };

  if (isEnvAdmin) {
    response.notice =
      "Auth password updated. If you sign in with ADMIN_PASSWORD from .env / Vercel, update that value too and restart the app.";
  }

  return NextResponse.json(response);
}
