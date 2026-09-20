import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { apiSuccess, apiError } from "@/lib/api/response";
import { getTicketsCollection } from "@/lib/db/collections";
import { TicketCategory, TicketPriority } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const { session, errorResponse } = await requireAuth(request);
    if (errorResponse) return errorResponse;

    const ticketsCol = await getTicketsCollection();

    // Scoped query: Students and Teachers only see their own tickets; Admin sees all
    const query = session.role === "ADMIN" ? {} : { userId: session.identifier };
    const tickets = await ticketsCol.find(query).sort({ createdAt: -1 }).toArray();

    return apiSuccess(
      tickets.map((t) => ({
        id: t._id ? t._id.toString() : "",
        ticketId: t.ticketId,
        userId: t.userId,
        userName: t.userName,
        userRole: t.userRole,
        category: t.category,
        description: t.description,
        priority: t.priority,
        status: t.status,
        createdAt: t.createdAt,
      }))
    );
  } catch (error: unknown) {
    console.error("Tickets GET API error:", error);
    return apiError("SERVER_ERROR", "Failed to retrieve tickets.", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { session, errorResponse } = await requireAuth(request);
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const { category, description, priority } = body;

    if (!category || !description?.trim()) {
      return apiError("BAD_REQUEST", "Category and description are required.", 400);
    }

    const ticketsCol = await getTicketsCollection();
    const count = await ticketsCol.countDocuments();
    const ticketId = `CS-TKT-${1000 + count + 1}`;

    const newTicket = {
      ticketId,
      userId: session.identifier,
      userName: session.name,
      userRole: (session.role === "TEACHER" ? "TEACHER" : "STUDENT") as "STUDENT" | "TEACHER",
      category: category as TicketCategory,
      description: description.trim(),
      priority: (priority || "MEDIUM") as TicketPriority,
      status: "OPEN" as const,
      createdAt: new Date(),
    };

    const result = await ticketsCol.insertOne(newTicket);

    return apiSuccess(
      {
        id: result.insertedId.toString(),
        ticketId: newTicket.ticketId,
        category: newTicket.category,
        description: newTicket.description,
        priority: newTicket.priority,
        status: newTicket.status,
        createdAt: newTicket.createdAt,
      },
      201
    );
  } catch (error: unknown) {
    console.error("Tickets POST API error:", error);
    return apiError("SERVER_ERROR", "Failed to create ticket.", 500);
  }
}
