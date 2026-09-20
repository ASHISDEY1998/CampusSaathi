import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { apiError } from "@/lib/api/response";
import {
  getStudentsCollection,
  getMarksCollection,
  getTimetablesCollection,
  getNoticesCollection,
  getTicketsCollection,
} from "@/lib/db/collections";

export async function GET(request: NextRequest) {
  try {
    const { session, errorResponse } = await requireAuth(request, ["STUDENT"]);
    if (errorResponse) return errorResponse;

    const studentId = session.identifier;

    try {
      const [studentsCol, marksCol, timetablesCol, noticesCol, ticketsCol] = await Promise.all([
        getStudentsCollection(),
        getMarksCollection(),
        getTimetablesCollection(),
        getNoticesCollection(),
        getTicketsCollection(),
      ]);

      const [profile, marks, timetables, notices, tickets] = await Promise.all([
        studentsCol.findOne({ studentId }),
        marksCol.find({ studentId }).toArray(),
        timetablesCol.find({ department: session.department }).toArray(),
        noticesCol.find().sort({ date: -1 }).limit(5).toArray(),
        ticketsCol.find({ userId: studentId }).sort({ createdAt: -1 }).limit(5).toArray(),
      ]);

      const formattedProfile = profile
        ? {
            year: profile.year,
            semester: profile.semester,
            cgpa: profile.cgpa,
            phone: profile.phone,
          }
        : null;

      const formattedMarks = marks.map((m) => ({
        subjectCode: m.subjectCode,
        subjectName: m.subjectName,
        semester: m.semester,
        internalMarks: m.internalMarks,
        endSemMarks: m.endSemMarks,
        totalMarks: m.totalMarks,
        grade: m.grade,
      }));

      const payload = {
        user: {
          identifier: session.identifier,
          name: session.name,
          email: session.email,
          department: session.department,
          role: session.role,
        },
        profile: formattedProfile,
        marks: formattedMarks,
        timetables: timetables.map((t) => ({
          department: t.department,
          semester: t.semester,
          dayOfWeek: t.dayOfWeek,
          slots: t.slots || [],
        })),
        notices: notices.map((n) => ({
          title: n.title,
          category: n.category,
          date: n.date,
          content: n.content,
          priority: n.priority,
        })),
        tickets: tickets.map((t) => ({
          ticketId: t.ticketId,
          category: t.category,
          description: t.description,
          status: t.status,
          priority: t.priority,
          createdAt: t.createdAt,
        })),
      };

      return NextResponse.json({
        success: true,
        data: payload,
        ...payload,
      });
    } catch (dbError) {
      console.error("Database error in student dashboard:", dbError);
      const emptyPayload = {
        user: {
          identifier: session.identifier,
          name: session.name,
          email: session.email,
          department: session.department,
          role: session.role,
        },
        profile: null,
        marks: [],
        timetables: [],
        notices: [],
        tickets: [],
      };

      return NextResponse.json({
        success: true,
        data: emptyPayload,
        ...emptyPayload,
      });
    }
  } catch (error: unknown) {
    console.error("Student dashboard API error:", error);
    return apiError("SERVER_ERROR", "Failed to retrieve student dashboard data.", 500);
  }
}
