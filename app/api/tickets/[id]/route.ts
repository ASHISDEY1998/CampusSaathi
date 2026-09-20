import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { apiSuccess, apiError } from "@/lib/api/response";
import { getTicketsCollection } from "@/lib/db/collections";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { session, errorResponse } = await requireAuth(request);
    if (errorResponse) return errorResponse;

    const { id } = await params;
    if (!id) {
      return apiError("BAD_REQUEST", "Ticket ID is required.", 400);
    }

    const ticketsCol = await getTicketsCollection();
    const ticket = await ticketsCol.findOne({ ticketId: id });

    if (!ticket) {
      return apiError("NOT_FOUND", "Ticket not found.", 404);
    }

    // Role check: non-admin can only access their own ticket
    if (session.role !== "ADMIN" && ticket.userId !== session.identifier) {
      return apiError("FORBIDDEN", "You do not have permission to access this ticket.", 403);
    }

    return apiSuccess({
      ticketId: ticket.ticketId,
      category: ticket.category,
      description: ticket.description,
      priority: ticket.priority,
      status: ticket.status,
      createdAt: ticket.createdAt,
      userId: ticket.userId,
      userName: ticket.userName,
    });
  } catch (error: unknown) {
    console.error("Single ticket API error:", error);
    return apiError("SERVER_ERROR", "Failed to retrieve ticket details.", 500);
  }
}
