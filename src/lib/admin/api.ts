import { NextResponse } from "next/server";
import { ZodError, type ZodType } from "zod";
import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import {
  ADMIN_SESSION_COOKIE,
  readAdminSessionToken,
} from "@/lib/admin/local-session";
import type { Profile, StaffRole } from "@/lib/admin/types";

type AdminApiOk = {
  ok: true;
  supabase: ReturnType<typeof createSupabaseServerClient> | ReturnType<typeof createSupabaseServiceClient>;
  user: { id: string; email?: string };
  profile: Profile;
};

type AdminApiErr = {
  ok: false;
  error: NextResponse;
};

export async function getAdminApiContext(
  allowed?: StaffRole[]
): Promise<AdminApiOk | AdminApiErr> {
  const cookieStore = cookies();
  const localToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const localSession = await readAdminSessionToken(localToken);

  if (localSession) {
    const supabase = createSupabaseServiceClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", localSession.sub)
      .maybeSingle();

    if (!profile || !profile.is_active) {
      return {
        ok: false,
        error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      };
    }

    if (allowed && !allowed.includes(profile.role as StaffRole)) {
      return {
        ok: false,
        error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
      };
    }

    return {
      ok: true,
      supabase,
      user: { id: profile.id, email: profile.email },
      profile: profile as Profile,
    };
  }

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || !profile.is_active) {
    return {
      ok: false,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (allowed && !allowed.includes(profile.role as StaffRole)) {
    return {
      ok: false,
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return {
    ok: true,
    supabase,
    user: { id: user.id, email: user.email },
    profile: profile as Profile,
  };
}

export function parseBody<T>(schema: ZodType<T>, body: unknown) {
  try {
    return { ok: true as const, data: schema.parse(body) };
  } catch (err) {
    if (err instanceof ZodError) {
      return {
        ok: false as const,
        error: NextResponse.json(
          { error: err.issues[0]?.message || "Invalid request." },
          { status: 400 }
        ),
      };
    }
    return {
      ok: false as const,
      error: NextResponse.json({ error: "Invalid request." }, { status: 400 }),
    };
  }
}

export async function writeAuditLog(
  supabase: AdminApiOk["supabase"],
  input: {
    userId: string;
    action: string;
    tableName?: string;
    recordId?: string;
    oldData?: unknown;
    newData?: unknown;
  }
) {
  await supabase.from("audit_log").insert({
    user_id: input.userId,
    action: input.action,
    table_name: input.tableName || null,
    record_id: input.recordId || null,
    old_data: input.oldData ?? null,
    new_data: input.newData ?? null,
  });
}
