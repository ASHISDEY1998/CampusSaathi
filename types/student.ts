import { ObjectId } from "mongodb";

export interface Student {
  _id?: ObjectId;
  userId: ObjectId;
  studentId: string; // e.g. STU2024CSE001
  department: string; // e.g. CSE, ECE, MECH, CIVIL
  year: number; // 1, 2, 3, 4
  semester: number; // 1 to 8
  cgpa: number; // e.g. 8.84
  phone: string;
}
