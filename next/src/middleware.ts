import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const access_token = request.cookies.get("access_token")?.value;
  const csrftoken = request.cookies.get("csrftoken")?.value;
  const sessionId = request.cookies.get("sessionid")?.value;

  const { pathname } = request.nextUrl;

  if (pathname === "/auth/teacher" && access_token) {
    return NextResponse.redirect(new URL("/teacher", request.url));
  }

  if (pathname.startsWith("/teacher") && !access_token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (pathname.startsWith("/auth/admin") && csrftoken && sessionId) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (pathname === "/admin" && (!csrftoken || !sessionId)) {
      return NextResponse.redirect(new URL("/auth/admin", request.url));
    }

  return NextResponse.next();
}

export const config = {
  matcher: ["/teacher/:path*", "/auth/teacher", "/admin/:path*", "/auth/admin"],
};
