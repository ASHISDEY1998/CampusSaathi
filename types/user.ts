import { ObjectId } from "mongodb";

export type UserRole = "STUDENT" | "TEACHER" | "ADMIN";

export interface User {
  _id?: ObjectId;
  identifier: string; // STU... or EMP...
  passwordHash: string;
  role: UserRole;
  name: string;
  email: string;
  department: string;
  createdAt: Date;
}
