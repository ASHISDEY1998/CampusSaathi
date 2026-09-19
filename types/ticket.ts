import { ObjectId } from "mongodb";

export type TicketCategory =
  | "Classroom"
  | "IT Support"
  | "Library"
  | "Hostel"
  | "Electrical"
  | "Internet"
  | "Academic"
  | "Administration"
  | "Other";

export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";

export type TicketPriority = "LOW" | "MEDIUM" | "HIGH";

export interface Ticket {
  _id?: ObjectId;
  ticketId: string; // e.g. CS-TKT-1001
  userId: string; // user identifier (STU... / EMP...)
  userName: string;
  userRole: "STUDENT" | "TEACHER";
  category: TicketCategory;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: Date;
}
