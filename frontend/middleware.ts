import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth_token")?.value;
  const userDataRaw = request.cookies.get("user_data")?.value;

  let role: string | null = null;
  if (userDataRaw) {
    try {
      const user = JSON.parse(decodeURIComponent(userDataRaw));
      role = user?.role ?? null;
    } catch {}
  }

  const isLoggedIn = !!token;
  const isAdmin = role === "admin";

  // ── Admin area (/admin/*) ──────────────────────────────────────────────────
  // /admin/login is always accessible (client-side layout handles redirect if already logged in)
  if (pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  // All other /admin/* routes require admin role
  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    if (!isAdmin) {
      // Logged in but not admin — send to homepage
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // ── Customer auth pages (/login, /signup) ──────────────────────────────────
  // If already logged in as customer, skip login/signup
  if (pathname === "/login" || pathname === "/signup") {
    if (isLoggedIn && !isAdmin) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // ── Protected customer pages (/my-orders, /account) ───────────────────────
  const customerProtectedPaths = ["/my-orders", "/account"];
  if (customerProtectedPaths.some((p) => pathname.startsWith(p))) {
    if (!isLoggedIn) {
      return NextResponse.redirect(
        new URL(`/login?redirect=${encodeURIComponent(pathname)}`, request.url)
      );
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/login",
    "/signup",
    "/my-orders/:path*",
    "/account/:path*",
  ],
};
