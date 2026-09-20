import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { apiSuccess, apiError } from "@/lib/api/response";
import { getTicketsCollection } from "@/lib/db/collections";

export async function GET(request: NextRequest) {
  try {
    const { session, errorResponse } = await requireAuth(request, ["STUDENT"]);
    if (errorResponse) return errorResponse;

    const ticketsCol = await getTicketsCollection();
    const tickets = await ticketsCol
      .find({ userId: session.identifier })
      .sort({ createdAt: -1 })
      .toArray();

    return apiSuccess(
      tickets.map((t) => ({
        ticketId: t.ticketId,
        category: t.category,
        description: t.description,
        priority: t.priority,
        status: t.status,
        createdAt: t.createdAt,
      }))
    );
  } catch (error: unknown) {
    console.error("Student tickets API error:", error);
    return apiError("SERVER_ERROR", "Failed to retrieve student tickets.", 500);
  }
}
