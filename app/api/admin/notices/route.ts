import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { apiSuccess, apiError } from "@/lib/api/response";
import { getNoticesCollection } from "@/lib/db/collections";

export async function GET(request: NextRequest) {
  try {
    const { errorResponse } = await requireAuth(request, ["ADMIN"]);
    if (errorResponse) return errorResponse;

    const noticesCol = await getNoticesCollection();
    const notices = await noticesCol.find().sort({ date: -1 }).toArray();

    return apiSuccess(
      notices.map((n) => ({
        id: n._id ? n._id.toString() : "",
        title: n.title,
        category: n.category,
        date: n.date,
        content: n.content,
        priority: n.priority,
      }))
    );
  } catch (error: unknown) {
    console.error("Admin notices API error:", error);
    return apiError("SERVER_ERROR", "Failed to retrieve institutional circulars.", 500);
  }
}
