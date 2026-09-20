import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { apiSuccess, apiError } from "@/lib/api/response";
import {
  getUsersCollection,
  getStudentsCollection,
  getTeachersCollection,
  getMarksCollection,
  getTimetablesCollection,
  getTicketsCollection,
  getNoticesCollection,
} from "@/lib/db/collections";

export async function GET(request: NextRequest) {
  try {
    const { errorResponse } = await requireAuth(request, ["ADMIN"]);
    if (errorResponse) return errorResponse;

    const [usersCol, studentsCol, teachersCol, marksCol, timetablesCol, ticketsCol, noticesCol] =
      await Promise.all([
        getUsersCollection(),
        getStudentsCollection(),
        getTeachersCollection(),
        getMarksCollection(),
        getTimetablesCollection(),
        getTicketsCollection(),
        getNoticesCollection(),
      ]);

    const [usersCount, studentsCount, teachersCount, marksCount, timetablesCount, ticketsCount, noticesCount] =
      await Promise.all([
        usersCol.countDocuments(),
        studentsCol.countDocuments(),
        teachersCol.countDocuments(),
        marksCol.countDocuments(),
        timetablesCol.countDocuments(),
        ticketsCol.countDocuments(),
        noticesCol.countDocuments(),
      ]);

    return apiSuccess({
      status: "operational",
      database: "connected",
      environment: process.env.NODE_ENV || "development",
      timestamp: new Date().toISOString(),
      counts: {
        users: usersCount,
        students: studentsCount,
        teachers: teachersCount,
        marks: marksCount,
        timetables: timetablesCount,
        tickets: ticketsCount,
        notices: noticesCount,
      },
    });
  } catch (error: unknown) {
    console.error("Admin system status error:", error);
    return apiError("SERVER_ERROR", "Failed to retrieve system status.", 500);
  }
}
