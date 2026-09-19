import { ObjectId } from "mongodb";

export type AcademicGrade = "O" | "A+" | "A" | "B+" | "B" | "C" | "F";

export interface Marks {
  _id?: ObjectId;
  studentId: string; // references Student.studentId
  subjectCode: string; // e.g. CS601
  subjectName: string; // e.g. Database Management Systems
  semester: number;
  internalMarks: number; // out of 40
  endSemMarks: number; // out of 60
  totalMarks: number; // internalMarks + endSemMarks (out of 100)
  grade: AcademicGrade;
}
