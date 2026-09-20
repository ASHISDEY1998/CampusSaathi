import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { apiSuccess, apiError } from "@/lib/api/response";
import { getTimetablesCollection } from "@/lib/db/collections";

export async function GET(request: NextRequest) {
  try {
    const { session, errorResponse } = await requireAuth(request, ["TEACHER"]);
    if (errorResponse) return errorResponse;

    const timetablesCol = await getTimetablesCollection();
    const timetables = await timetablesCol
      .find({ "slots.teacherId": session.identifier })
      .toArray();

    // Extract only slots belonging to this teacher
    const teacherSchedule = timetables.flatMap((t) =>
      (t.slots || [])
        .filter((s) => s.teacherId === session.identifier)
        .map((s) => ({
          dayOfWeek: t.dayOfWeek,
          semester: t.semester,
          department: t.department,
          time: s.time,
          subjectCode: s.subjectCode,
          subjectName: s.subjectName,
          room: s.room,
        }))
    );

    return apiSuccess(teacherSchedule);
  } catch (error: unknown) {
    console.error("Teacher timetable API error:", error);
    return apiError("SERVER_ERROR", "Failed to retrieve teacher timetable.", 500);
  }
}
