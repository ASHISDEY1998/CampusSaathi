import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, verifyAuthToken, AuthSessionPayload } from "@/lib/auth/jwt";
import { UserRole } from "@/types";
import { apiError, ApiErrorEnvelope } from "./response";

export type AuthResult =
  | { session: AuthSessionPayload; errorResponse: null }
  | { session: null; errorResponse: NextResponse<ApiErrorEnvelope> };

/**
 * Validates the request's JWT session cookie and optionally enforces role authorization.
 * Returns { session, errorResponse: null } if authorized, or { session: null, errorResponse } on failure.
 */
export async function requireAuth(
  request: NextRequest,
  allowedRoles?: UserRole[]
): Promise<AuthResult> {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return {
      session: null,
      errorResponse: apiError("UNAUTHORIZED", "Authentication required to access this resource.", 401),
    };
  }

  const session = await verifyAuthToken(token);
  if (!session) {
    return {
      session: null,
      errorResponse: apiError("UNAUTHORIZED", "Invalid or expired session. Please sign in again.", 401),
    };
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(session.role)) {
    return {
      session: null,
      errorResponse: apiError("FORBIDDEN", "You do not have permission to access this resource.", 403),
    };
  }

  return { session, errorResponse: null };
}
