import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Check admin routes protection
    if (path.startsWith("/dashboard/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard/customer", req.url));
    }

    // Check customer routes protection
    if (path.startsWith("/dashboard/customer") && token?.role !== "CUSTOMER") {
      return NextResponse.redirect(new URL("/dashboard/admin", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    secret: process.env.NEXTAUTH_SECRET || "sm-sport-center-secret-key-12345",
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/reservation/:path*"],
};
