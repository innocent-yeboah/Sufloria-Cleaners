import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import {
  ADMIN_SESSION_COOKIE,
  readAdminSessionToken,
} from "@/lib/admin/local-session";
import { createClient } from "@supabase/supabase-js";

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const localSession = await readAdminSessionToken(
    request.cookies.get(ADMIN_SESSION_COOKIE)?.value
  );

  if (pathname === "/admin/login") {
    if (localSession) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.next();
    }
    const { user, supabaseResponse } = await updateSession(request);
    if (user) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return supabaseResponse;
  }

  if (localSession) {
    const service = getServiceClient();
    if (service) {
      const { data: profile } = await service
        .from("profiles")
        .select("id, is_active")
        .eq("id", localSession.sub)
        .maybeSingle();

      if (profile?.is_active) {
        return NextResponse.next();
      }
    } else {
      return NextResponse.next();
    }

    const response = NextResponse.redirect(
      new URL("/admin/login?error=inactive", request.url)
    );
    response.cookies.set(ADMIN_SESSION_COOKIE, "", {
      httpOnly: true,
      path: "/",
      maxAge: 0,
    });
    return response;
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const { supabase, user, supabaseResponse } = await updateSession(request);

  if (!user) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.is_active) {
    await supabase.auth.signOut();
    return NextResponse.redirect(
      new URL("/admin/login?error=inactive", request.url)
    );
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/admin/:path*"],
};
