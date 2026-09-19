import { ObjectId } from "mongodb";

export interface Teacher {
  _id?: ObjectId;
  userId: ObjectId;
  employeeId: string; // e.g. EMP1001
  department: string;
  designation: string; // e.g. Professor, Associate Professor, Assistant Professor
  cabinLocation: string; // e.g. Academic Block A, Room 312
}
