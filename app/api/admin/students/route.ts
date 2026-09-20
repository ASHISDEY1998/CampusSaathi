import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { apiSuccess, apiError } from "@/lib/api/response";
import { getStudentsCollection } from "@/lib/db/collections";

export async function GET(request: NextRequest) {
  try {
    const { errorResponse } = await requireAuth(request, ["ADMIN"]);
    if (errorResponse) return errorResponse;

    const studentsCol = await getStudentsCollection();
    const students = await studentsCol.find().toArray();

    return apiSuccess(
      students.map((s) => ({
        studentId: s.studentId,
        department: s.department,
        year: s.year,
        semester: s.semester,
        cgpa: s.cgpa,
        phone: s.phone,
      }))
    );
  } catch (error: unknown) {
    console.error("Admin students API error:", error);
    return apiError("SERVER_ERROR", "Failed to retrieve student directory.", 500);
  }
}
