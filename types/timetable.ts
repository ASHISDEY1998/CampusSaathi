import { ObjectId } from "mongodb";

export type DayOfWeek =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday";

export interface TimetableSlot {
  time: string; // e.g. "09:30 AM - 10:30 AM"
  subjectCode: string;
  subjectName: string;
  teacherId: string; // references Teacher.employeeId
  teacherName: string;
  room: string;
}

export interface Timetable {
  _id?: ObjectId;
  department: string;
  semester: number;
  dayOfWeek: DayOfWeek;
  slots: TimetableSlot[];
}
