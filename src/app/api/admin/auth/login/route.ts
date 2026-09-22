import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import {
  ADMIN_SESSION_COOKIE,
  adminSessionCookieOptions,
  createAdminSessionToken,
  getAdminCredentialConfig,
  timingSafeEqualString,
} from "@/lib/admin/local-session";
import type { StaffRole } from "@/lib/admin/types";

export async function POST(request: Request) {
  try {
    const config = getAdminCredentialConfig();
    if (!config.configured) {
      return NextResponse.json(
        {
          error:
            "Admin login is not configured. Set ADMIN_EMAIL, ADMIN_PASSWORD, and ADMIN_SESSION_SECRET in .env.local.",
        },
        { status: 503 }
      );
    }

    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    const emailOk = timingSafeEqualString(email, config.email);
    const passwordOk = timingSafeEqualString(password, config.password);
    if (!emailOk || !passwordOk) {
      return NextResponse.json(
        { error: "Let's try that again — check your email and password." },
        { status: 401 }
      );
    }

    const supabase = createSupabaseServiceClient();
    let { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (!profile) {
      // Ensure profile exists for the matching Auth user if present
      const { data: users } = await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 200,
      });
      const authUser = users?.users?.find(
        (u) => (u.email || "").toLowerCase() === email
      );

      if (!authUser) {
        return NextResponse.json(
          {
            error:
              "No staff profile found for this email. Create the Auth user in Supabase first.",
          },
          { status: 400 }
        );
      }

      const { data: created, error } = await supabase
        .from("profiles")
        .upsert({
          id: authUser.id,
          email,
          full_name: authUser.user_metadata?.full_name || email.split("@")[0],
          role: "admin",
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .select("*")
        .single();

      if (error || !created) {
        return NextResponse.json(
          { error: error?.message || "Could not create staff profile." },
          { status: 500 }
        );
      }
      profile = created;
    }

    if (!profile.is_active) {
      return NextResponse.json(
        { error: "Your account is inactive. Contact an administrator." },
        { status: 403 }
      );
    }

    // Keep ops account elevated when using local admin bypass
    if (profile.role !== "admin") {
      const { data: promoted } = await supabase
        .from("profiles")
        .update({ role: "admin", updated_at: new Date().toISOString() })
        .eq("id", profile.id)
        .select("*")
        .single();
      if (promoted) profile = promoted;
    }

    await supabase
      .from("profiles")
      .update({ last_login: new Date().toISOString() })
      .eq("id", profile.id);

    const token = await createAdminSessionToken({
      sub: profile.id,
      email: profile.email,
      role: profile.role as StaffRole,
    });

    if (!token) {
      return NextResponse.json(
        { error: "Could not create admin session." },
        { status: 500 }
      );
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(
      ADMIN_SESSION_COOKIE,
      token,
      adminSessionCookieOptions()
    );
    return response;
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
