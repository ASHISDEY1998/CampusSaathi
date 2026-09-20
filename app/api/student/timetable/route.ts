import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { apiSuccess, apiError } from "@/lib/api/response";
import { getTimetablesCollection, getStudentsCollection } from "@/lib/db/collections";

export async function GET(request: NextRequest) {
  try {
    const { session, errorResponse } = await requireAuth(request, ["STUDENT"]);
    if (errorResponse) return errorResponse;

    const studentsCol = await getStudentsCollection();
    const student = await studentsCol.findOne({ studentId: session.identifier });

    const timetablesCol = await getTimetablesCollection();
    const query: Record<string, unknown> = {};

    if (student?.department) {
      query.department = student.department;
    } else if (session.department) {
      query.department = session.department;
    }

    if (student?.semester) {
      query.semester = student.semester;
    }

    const timetables = await timetablesCol.find(query).toArray();

    return apiSuccess(
      timetables.map((t) => ({
        department: t.department,
        semester: t.semester,
        dayOfWeek: t.dayOfWeek,
        slots: t.slots || [],
      }))
    );
  } catch (error: unknown) {
    console.error("Student timetable API error:", error);
    return apiError("SERVER_ERROR", "Failed to retrieve student timetable.", 500);
  }
}
