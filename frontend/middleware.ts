// frontend/middleware.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Read token from cookies
  const token = request.cookies.get("token")?.value;

  // ✅ Allow all auth pages (login / register)
  if (pathname.startsWith("/auth")) {
    return NextResponse.next();
  }

  // ✅ Protect dashboard routes
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      return NextResponse.redirect(
        new URL("/auth/login", request.url)
      );
    }
  }

  return NextResponse.next();
}

/**
 * Apply middleware ONLY to dashboard routes
 */
export const config = {
  matcher: ["/dashboard/:path*"],
};
