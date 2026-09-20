import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { apiSuccess, apiError } from "@/lib/api/response";
import { getTeachersCollection } from "@/lib/db/collections";

export async function GET(request: NextRequest) {
  try {
    const { session, errorResponse } = await requireAuth(request, ["TEACHER"]);
    if (errorResponse) return errorResponse;

    const teachersCol = await getTeachersCollection();
    const teacher = await teachersCol.findOne({ employeeId: session.identifier });

    return apiSuccess({
      user: {
        identifier: session.identifier,
        name: session.name,
        role: session.role,
        email: session.email,
        department: session.department,
      },
      teacher: teacher
        ? {
            employeeId: teacher.employeeId,
            department: teacher.department,
            designation: teacher.designation,
            cabinLocation: teacher.cabinLocation,
            subjectsTaught: teacher.subjectsTaught || [],
          }
        : null,
    });
  } catch (error: unknown) {
    console.error("Teacher profile API error:", error);
    return apiError("SERVER_ERROR", "Failed to retrieve teacher profile.", 500);
  }
}
