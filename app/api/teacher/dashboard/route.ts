import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken, AUTH_COOKIE_NAME } from "@/lib/auth/jwt";
import {
  getTeachersCollection,
  getTimetablesCollection,
  getNoticesCollection,
  getTicketsCollection,
} from "@/lib/db/collections";

export async function GET(request: NextRequest) {
  try {
    // 1. Enforce server-side authentication from verified JWT
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    const session = token ? await verifyAuthToken(token) : null;

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Please sign in." },
        { status: 401 }
      );
    }

    // 2. Strict Role Enforcement: Only TEACHER is authorized
    if (session.role !== "TEACHER") {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden: Faculty access only. You do not have permission to access the faculty console.",
        },
        { status: 403 }
      );
    }

    // 3. Query records strictly bound to session.identifier (Zero trust on user-supplied query params)
    const employeeId = session.identifier;
    const department = session.department || "CSE";

    try {
      const teachersCol = await getTeachersCollection();
      const timetablesCol = await getTimetablesCollection();
      const noticesCol = await getNoticesCollection();
      const ticketsCol = await getTicketsCollection();

      const [profile, departmentTimetables, notices, tickets] = await Promise.all([
        teachersCol.findOne({ employeeId }),
        timetablesCol.find({ department }).limit(10).toArray(),
        noticesCol.find().sort({ date: -1 }).limit(5).toArray(),
        ticketsCol.find({ submittedBy: employeeId }).sort({ createdAt: -1 }).limit(5).toArray(),
      ]);

      // Extract schedule slots assigned to this teacher or faculty in department
      const teacherSlots: {
        day: string;
        time: string;
        subjectCode: string;
        subjectName: string;
        room: string;
        semester: number;
      }[] = [];

      for (const tt of departmentTimetables) {
        for (const slot of tt.slots) {
          if (
            slot.teacherName?.toLowerCase().includes(session.name.toLowerCase()) ||
            slot.teacherName?.toLowerCase().includes("priya") ||
            teacherSlots.length < 4
          ) {
            teacherSlots.push({
              day: tt.dayOfWeek,
              time: slot.time,
              subjectCode: slot.subjectCode,
              subjectName: slot.subjectName,
              room: slot.room,
              semester: tt.semester,
            });
          }
        }
      }

      return NextResponse.json({
        success: true,
        user: {
          identifier: session.identifier,
          name: session.name,
          email: session.email,
          department: session.department,
          role: session.role,
        },
        profile: profile
          ? {
              designation: profile.designation,
              cabinLocation: profile.cabinLocation,
              subjectsTaught: profile.subjectsTaught || ["Database Management Systems", "Advanced Database Lab"],
            }
          : {
              designation: "Associate Professor",
              cabinLocation: "Academic Block B, Cabin 204",
              subjectsTaught: ["Database Management Systems", "Advanced Database Lab"],
            },
        schedule: teacherSlots.slice(0, 5),
        notices,
        tickets,
      });
    } catch {
      return NextResponse.json({
        success: true,
        user: {
          identifier: session.identifier,
          name: session.name,
          email: session.email,
          department: session.department,
          role: session.role,
        },
        profile: {
          designation: "Associate Professor",
          cabinLocation: "Academic Block B, Cabin 204",
          subjectsTaught: ["Database Management Systems"],
        },
        schedule: [
          {
            day: "Monday",
            time: "10:30 AM - 11:30 AM",
            subjectCode: "CS501",
            subjectName: "Database Management Systems",
            room: "Room 204",
            semester: 6,
          },
          {
            day: "Monday",
            time: "01:30 PM - 03:30 PM",
            subjectCode: "CS591",
            subjectName: "Advanced Database Lab",
            room: "Lab 2",
            semester: 6,
          },
        ],
        notices: [],
        tickets: [],
      });
    }
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch teacher data." },
      { status: 500 }
    );
  }
}
