import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const AUTH_COOKIE_NAME = "campus_auth_session";

const getSecretKey = () => {
  const secret =
    process.env.AUTH_SECRET ||
    "campus_saathi_default_jwt_secret_key_minimum_32_characters_long!";
  return new TextEncoder().encode(secret);
};

// Routes that require authentication
const PROTECTED_PREFIXES = ["/dashboard", "/chat", "/tickets", "/profile", "/admin"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  let isValidSession = false;
  let userRole: string | null = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, getSecretKey());
      if (payload && payload.identifier) {
        isValidSession = true;
        userRole = (payload.role as string) || null;
      }
    } catch {
      isValidSession = false;
    }
  }

  // 1. Root path "/"
  if (pathname === "/") {
    if (isValidSession) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 2. Login page "/login"
  if (pathname === "/login") {
    if (isValidSession) {
      if (userRole === "ADMIN") {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // 3. Protected pages
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (isProtected) {
    if (!isValidSession) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (manifest.json, sw.js, icons)
     * - api routes
     */
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|icons|api).*)",
  ],
};
