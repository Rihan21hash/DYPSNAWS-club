import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function middleware(request) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Always refresh session (required by @supabase/ssr)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const adminEmail = (process.env.ADMIN_EMAIL || "captain@dypsn.com").toLowerCase();
  const isAdminUser = user && (
    (user.email && user.email.toLowerCase() === adminEmail) ||
    user.user_metadata?.role === "admin"
  );

  // ── Redirect logged-in users away from auth pages ──
  if (user) {
    if (pathname === "/admin/login") {
      const url = request.nextUrl.clone();
      url.pathname = isAdminUser ? "/admin/dashboard" : "/";
      return NextResponse.redirect(url);
    }
    if (pathname === "/login" || pathname === "/signup") {
      const url = request.nextUrl.clone();
      url.pathname = isAdminUser ? "/admin/dashboard" : "/";
      return NextResponse.redirect(url);
    }
  }

  // ── Protect /admin/dashboard/* ──
  if (pathname.startsWith("/admin/dashboard") || pathname.startsWith("/admin/dashboard/")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }

  // ── Redirect /admin → /admin/dashboard (if logged in) or /admin/login (if logged out) ──
  if (pathname === "/admin") {
    const url = request.nextUrl.clone();
    url.pathname = user && isAdminUser ? "/admin/dashboard" : "/admin/login";
    return NextResponse.redirect(url);
  }

  // ── Protect event registration ──
  if (pathname.match(/^\/events\/[^/]+\/register$/)) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = url.pathname.replace("/register", "");
      url.searchParams.set("login", "required");
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|uploads/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
