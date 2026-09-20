import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { apiSuccess, apiError } from "@/lib/api/response";
import { getStudentsCollection } from "@/lib/db/collections";

export async function GET(request: NextRequest) {
  try {
    const { session, errorResponse } = await requireAuth(request, ["STUDENT"]);
    if (errorResponse) return errorResponse;

    const studentsCol = await getStudentsCollection();
    const student = await studentsCol.findOne({ studentId: session.identifier });

    return apiSuccess({
      user: {
        identifier: session.identifier,
        name: session.name,
        role: session.role,
        email: session.email,
        department: session.department,
      },
      student: student
        ? {
            studentId: student.studentId,
            department: student.department,
            year: student.year,
            semester: student.semester,
            cgpa: student.cgpa,
            phone: student.phone,
          }
        : null,
    });
  } catch (error: unknown) {
    console.error("Student profile API error:", error);
    return apiError("SERVER_ERROR", "Failed to retrieve student profile.", 500);
  }
}
