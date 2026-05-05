import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    const role = token?.role as string | undefined;

    // Manager routes: only MANAGER and SUPER_ADMIN
    if (path.startsWith("/manager")) {
      if (!role || !["MANAGER", "SUPER_ADMIN"].includes(role)) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // Admin routes: only SUPER_ADMIN
    if (path.startsWith("/admin")) {
      if (role !== "SUPER_ADMIN") {
        const dest = ["MANAGER"].includes(role ?? "") ? "/manager" : "/dashboard";
        return NextResponse.redirect(new URL(dest, req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Route is protected if there's any valid token
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/manager/:path*",
    "/admin/:path*",
  ],
};
