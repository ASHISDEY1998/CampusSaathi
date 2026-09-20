import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { apiSuccess, apiError } from "@/lib/api/response";
import { getMarksCollection } from "@/lib/db/collections";

export async function GET(request: NextRequest) {
  try {
    const { session, errorResponse } = await requireAuth(request, ["STUDENT"]);
    if (errorResponse) return errorResponse;

    const marksCol = await getMarksCollection();
    const marks = await marksCol.find({ studentId: session.identifier }).toArray();

    return apiSuccess(
      marks.map((m) => ({
        subjectCode: m.subjectCode,
        subjectName: m.subjectName,
        semester: m.semester,
        internalMarks: m.internalMarks,
        endSemMarks: m.endSemMarks,
        totalMarks: m.totalMarks,
        grade: m.grade,
      }))
    );
  } catch (error: unknown) {
    console.error("Student marks API error:", error);
    return apiError("SERVER_ERROR", "Failed to retrieve student marks.", 500);
  }
}
