import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken, AUTH_COOKIE_NAME } from "@/lib/auth/jwt";
import { apiError } from "@/lib/api/response";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return apiError("UNAUTHORIZED", "Not authenticated.", 401);
    }

    const payload = await verifyAuthToken(token);
    if (!payload) {
      return apiError("UNAUTHORIZED", "Session expired or invalid.", 401);
    }

    const safeUser = {
      identifier: payload.identifier,
      name: payload.name,
      role: payload.role,
      email: payload.email,
      department: payload.department,
    };

    // Return standard response envelope, plus backward-compatible fields for existing components
    return NextResponse.json({
      success: true,
      data: {
        user: safeUser,
      },
      authenticated: true,
      user: safeUser,
    });
  } catch (error: unknown) {
    console.error("Auth me error:", error);
    return apiError("SERVER_ERROR", "Internal server error.", 500);
  }
}
