import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { apiSuccess, apiError } from "@/lib/api/response";

export async function GET(request: NextRequest) {
  try {
    const { session, errorResponse } = await requireAuth(request, ["ADMIN"]);
    if (errorResponse) return errorResponse;

    return apiSuccess({
      user: {
        identifier: session.identifier,
        name: session.name,
        role: session.role,
        email: session.email,
        department: session.department,
      },
    });
  } catch (error: unknown) {
    console.error("Admin profile API error:", error);
    return apiError("SERVER_ERROR", "Failed to retrieve admin profile.", 500);
  }
}
