import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { apiSuccess, apiError } from "@/lib/api/response";
import { getTeachersCollection } from "@/lib/db/collections";

export async function GET(request: NextRequest) {
  try {
    const { errorResponse } = await requireAuth(request, ["ADMIN"]);
    if (errorResponse) return errorResponse;

    const teachersCol = await getTeachersCollection();
    const teachers = await teachersCol.find().toArray();

    return apiSuccess(
      teachers.map((t) => ({
        employeeId: t.employeeId,
        department: t.department,
        designation: t.designation,
        cabinLocation: t.cabinLocation,
        subjectsTaught: t.subjectsTaught || [],
      }))
    );
  } catch (error: unknown) {
    console.error("Admin teachers API error:", error);
    return apiError("SERVER_ERROR", "Failed to retrieve teacher directory.", 500);
  }
}
