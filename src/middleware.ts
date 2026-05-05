import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req });

  const path = req.nextUrl.pathname;

  // Not authenticated → redirect to login
  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(loginUrl);
  }

  const role = token.role as string | undefined;

  // Manager routes: only MANAGER and SUPER_ADMIN
  if (path.startsWith("/manager")) {
    if (!role || !["MANAGER", "SUPER_ADMIN"].includes(role)) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // Admin routes: only SUPER_ADMIN
  if (path.startsWith("/admin")) {
    if (role !== "SUPER_ADMIN") {
      const dest = role === "MANAGER" ? "/manager" : "/dashboard";
      return NextResponse.redirect(new URL(dest, req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/manager/:path*", "/admin/:path*"],
};
