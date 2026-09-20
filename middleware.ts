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

  // 3. API Role-Based Authorization
  if (pathname.startsWith("/api/admin")) {
    if (!isValidSession) {
      return NextResponse.json({ success: false, error: "Unauthorized: Please sign in." }, { status: 401 });
    }
    if (userRole !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Forbidden: Administrator role required." }, { status: 403 });
    }
  }

  if (pathname.startsWith("/api/teacher")) {
    if (!isValidSession) {
      return NextResponse.json({ success: false, error: "Unauthorized: Please sign in." }, { status: 401 });
    }
    if (userRole !== "TEACHER") {
      return NextResponse.json({ success: false, error: "Forbidden: Faculty role required." }, { status: 403 });
    }
  }

  if (pathname.startsWith("/api/student")) {
    if (!isValidSession) {
      return NextResponse.json({ success: false, error: "Unauthorized: Please sign in." }, { status: 401 });
    }
    if (userRole !== "STUDENT") {
      return NextResponse.json({ success: false, error: "Forbidden: Student role required." }, { status: 403 });
    }
  }

  // 4. Protected pages
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (isProtected) {
    if (!isValidSession) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role-based protection: Only ADMIN can access /admin
    if (pathname.startsWith("/admin") && userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Role-based direct route blocking
    if (pathname.startsWith("/dashboard/teacher") && userRole !== "TEACHER") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (pathname.startsWith("/dashboard/student") && userRole !== "STUDENT") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
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
     */
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|icons).*)",
  ],
};
