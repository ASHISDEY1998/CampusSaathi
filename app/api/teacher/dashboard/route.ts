import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { apiError } from "@/lib/api/response";
import {
  getTeachersCollection,
  getTimetablesCollection,
  getNoticesCollection,
  getTicketsCollection,
} from "@/lib/db/collections";

export async function GET(request: NextRequest) {
  try {
    const { session, errorResponse } = await requireAuth(request, ["TEACHER"]);
    if (errorResponse) return errorResponse;

    const employeeId = session.identifier;

    try {
      const [teachersCol, timetablesCol, noticesCol, ticketsCol] = await Promise.all([
        getTeachersCollection(),
        getTimetablesCollection(),
        getNoticesCollection(),
        getTicketsCollection(),
      ]);

      const [profile, timetables, notices, tickets] = await Promise.all([
        teachersCol.findOne({ employeeId }),
        timetablesCol.find({ "slots.teacherId": employeeId }).toArray(),
        noticesCol.find().sort({ date: -1 }).limit(5).toArray(),
        ticketsCol.find({ userId: employeeId }).sort({ createdAt: -1 }).limit(5).toArray(),
      ]);

      // Extract specific teaching slots assigned to this teacher
      const teacherSlots = timetables.flatMap((t) =>
        (t.slots || [])
          .filter((slot) => slot.teacherId === employeeId)
          .map((slot) => ({
            day: t.dayOfWeek,
            time: slot.time,
            subject: slot.subjectName,
            subjectCode: slot.subjectCode,
            room: slot.room,
            batch: `${t.department} - Sem ${t.semester}`,
          }))
      );

      const formattedProfile = profile
        ? {
            designation: profile.designation,
            cabinLocation: profile.cabinLocation,
            subjectsTaught: profile.subjectsTaught || [],
          }
        : null;

      const payload = {
        user: {
          identifier: session.identifier,
          name: session.name,
          email: session.email,
          department: session.department,
          role: session.role,
        },
        profile: formattedProfile,
        schedule: teacherSlots,
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
      console.error("Database error in teacher dashboard:", dbError);
      const emptyPayload = {
        user: {
          identifier: session.identifier,
          name: session.name,
          email: session.email,
          department: session.department,
          role: session.role,
        },
        profile: null,
        schedule: [],
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
    console.error("Teacher dashboard API error:", error);
    return apiError("SERVER_ERROR", "Failed to retrieve teacher dashboard data.", 500);
  }
}
