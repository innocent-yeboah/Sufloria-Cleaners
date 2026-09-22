import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import {
  ADMIN_SESSION_COOKIE,
  readAdminSessionToken,
} from "@/lib/admin/local-session";
import type { Profile, StaffRole } from "@/lib/admin/types";

export async function resolveAdminAccess(allowed?: StaffRole[]) {
  // Preferred path: local signed session (bypasses disabled Email Auth provider)
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

    if (profile?.is_active) {
      if (allowed && !allowed.includes(profile.role as StaffRole)) {
        return { forbidden: true as const };
      }
      return {
        supabase,
        user: { id: profile.id, email: profile.email },
        profile: profile as Profile,
      };
    }
  }

  // Fallback: native Supabase Auth (when Email provider is enabled)
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { unauthenticated: true as const };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || !profile.is_active) {
    return { inactive: true as const };
  }

  if (allowed && !allowed.includes(profile.role as StaffRole)) {
    return { forbidden: true as const };
  }

  return {
    supabase,
    user: { id: user.id, email: user.email },
    profile: profile as Profile,
  };
}

export async function requireAdminSession(allowed?: StaffRole[]) {
  const access = await resolveAdminAccess(allowed);

  if ("unauthenticated" in access) {
    redirect("/admin/login");
  }
  if ("inactive" in access) {
    redirect("/admin/login?error=inactive");
  }
  if ("forbidden" in access) {
    redirect("/admin?error=forbidden");
  }

  return access;
}

export function formatGbp(amount: number | null | undefined): string {
  if (amount == null || Number.isNaN(Number(amount))) return "—";
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(Number(amount));
}

export function formatUkDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export { mapWebsiteServiceToLead } from "@/lib/lead-service";

