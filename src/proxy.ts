import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/jwt";

/**
 * Route protection (Next 16 `proxy.ts`). The backend-issued session JWT is
 * verified here as well as in the pages, so a tampered cookie never reaches a
 * protected render. Revocation is enforced by the dashboard's `/auth/me` call.
 */
export async function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;
  const { pathname } = request.nextUrl;

  const isAuthRoute = pathname === "/login" || pathname === "/signup";

  if (!session && pathname.startsWith("/dashboard")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (session && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup"],
};
