import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { portalForRole, canAccessPortal } from "./lib/portal-access";

export default withAuth(function proxy(request) {
  const role = request.nextauth.token?.role;
  if (!canAccessPortal(role, request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL(portalForRole(role) ?? "/login?error=AccessDenied", request.url));
  }
  return NextResponse.next();
}, {
  pages: { signIn: "/login" },
  callbacks: { authorized: ({ token }) => Boolean(token?.backendJwt && portalForRole(token.role)) },
});

export const config = {
  matcher: ["/admin/:path*", "/barbeiro/:path*", "/clientes/:path*", "/superadmin/:path*"],
};
