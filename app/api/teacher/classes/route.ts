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

    // Map unique class batches derived from real timetable slots
    const classMap = new Map<string, { department: string; semester: number; subjectCode: string; subjectName: string; room: string }>();

    for (const t of timetables) {
      for (const slot of t.slots || []) {
        if (slot.teacherId === session.identifier) {
          const key = `${t.department}-Sem${t.semester}-${slot.subjectCode}`;
          if (!classMap.has(key)) {
            classMap.set(key, {
              department: t.department,
              semester: t.semester,
              subjectCode: slot.subjectCode,
              subjectName: slot.subjectName,
              room: slot.room,
            });
          }
        }
      }
    }

    const classes = Array.from(classMap.values());
    return apiSuccess(classes);
  } catch (error: unknown) {
    console.error("Teacher classes API error:", error);
    return apiError("SERVER_ERROR", "Failed to retrieve teacher classes.", 500);
  }
}
