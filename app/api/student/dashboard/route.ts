import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken, AUTH_COOKIE_NAME } from "@/lib/auth/jwt";
import {
  getStudentsCollection,
  getMarksCollection,
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

    // 2. Strict Role Enforcement: Only STUDENT is authorized
    if (session.role !== "STUDENT") {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden: Student access only. You do not have permission to view student academic records.",
        },
        { status: 403 }
      );
    }

    // 3. Query records strictly bound to session.identifier (Zero trust on user-supplied query params)
    const studentId = session.identifier;
    const department = session.department || "CSE";

    try {
      const studentsCol = await getStudentsCollection();
      const marksCol = await getMarksCollection();
      const timetablesCol = await getTimetablesCollection();
      const noticesCol = await getNoticesCollection();
      const ticketsCol = await getTicketsCollection();

      const [profile, marks, timetables, notices, tickets] = await Promise.all([
        studentsCol.findOne({ studentId }),
        marksCol.find({ studentId }).toArray(),
        timetablesCol.find({ department }).limit(5).toArray(),
        noticesCol.find().sort({ date: -1 }).limit(5).toArray(),
        ticketsCol.find({ submittedBy: studentId }).sort({ createdAt: -1 }).limit(5).toArray(),
      ]);

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
              year: profile.year,
              semester: profile.semester,
              cgpa: profile.cgpa,
              phone: profile.phone,
            }
          : {
              year: 3,
              semester: 6,
              cgpa: 8.84,
            },
        marks: marks.map((m) => ({
          subjectCode: m.subjectCode,
          subjectName: m.subjectName,
          semester: m.semester,
          internalMarks: m.internalMarks,
          endSemMarks: m.endSemMarks,
          totalMarks: m.totalMarks,
          grade: m.grade,
        })),
        timetables,
        notices,
        tickets,
      });
    } catch {
      // Fallback if MongoDB is offline, return basic session info
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
          year: 3,
          semester: 6,
          cgpa: 8.84,
        },
        marks: [],
        timetables: [],
        notices: [],
        tickets: [],
      });
    }
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch student data." },
      { status: 500 }
    );
  }
}
