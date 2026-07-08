import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default auth((req) => {
  const { nextUrl, auth: session } = req as any;

  const isLoggedIn = !!session;
  const isLoginPage = nextUrl.pathname === "/login";
  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  const isDashboardRoute = nextUrl.pathname === "/" || 
    nextUrl.pathname.startsWith("/dashboard") ||
    nextUrl.pathname.startsWith("/petani") ||
    nextUrl.pathname.startsWith("/poktan") ||
    nextUrl.pathname.startsWith("/lahan") ||
    nextUrl.pathname.startsWith("/komoditas") ||
    nextUrl.pathname.startsWith("/produksi") ||
    nextUrl.pathname.startsWith("/pemasaran") ||
    nextUrl.pathname.startsWith("/bantuan") ||
    nextUrl.pathname.startsWith("/penyuluh") ||
    nextUrl.pathname.startsWith("/laporan") ||
    nextUrl.pathname.startsWith("/pengaturan");

  // Allow API auth routes
  if (isApiAuthRoute) return NextResponse.next();

  // Redirect to dashboard if already logged in and visiting login page
  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  // Redirect to login if not logged in and visiting protected route
  if (!isLoggedIn && isDashboardRoute) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
