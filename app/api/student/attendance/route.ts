import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { apiSuccess, apiError } from "@/lib/api/response";

/**
 * GET /api/student/attendance
 * Note: Attendance collection is pending institutional sync in a future stage.
 * Strictly returns empty list in accordance with the no-fake-data policy.
 */
export async function GET(request: NextRequest) {
  try {
    const { errorResponse } = await requireAuth(request, ["STUDENT"]);
    if (errorResponse) return errorResponse;

    return apiSuccess([]);
  } catch (error: unknown) {
    console.error("Student attendance API error:", error);
    return apiError("SERVER_ERROR", "Failed to retrieve student attendance.", 500);
  }
}
