import { Collection, Db } from "mongodb";
import { getDb } from "./mongodb";
import {
  User,
  Student,
  Teacher,
  Marks,
  Timetable,
  Ticket,
  Notice,
  DocumentChunk,
} from "@/types";

export const COLLECTIONS = {
  USERS: "users",
  STUDENTS: "students",
  TEACHERS: "teachers",
  MARKS: "marks",
  TIMETABLES: "timetables",
  TICKETS: "tickets",
  NOTICES: "notices",
  DOCUMENT_CHUNKS: "documentChunks",
} as const;

export async function getUsersCollection(db?: Db): Promise<Collection<User>> {
  const database = db || (await getDb());
  return database.collection<User>(COLLECTIONS.USERS);
}

export async function getStudentsCollection(db?: Db): Promise<Collection<Student>> {
  const database = db || (await getDb());
  return database.collection<Student>(COLLECTIONS.STUDENTS);
}

export async function getTeachersCollection(db?: Db): Promise<Collection<Teacher>> {
  const database = db || (await getDb());
  return database.collection<Teacher>(COLLECTIONS.TEACHERS);
}

export async function getMarksCollection(db?: Db): Promise<Collection<Marks>> {
  const database = db || (await getDb());
  return database.collection<Marks>(COLLECTIONS.MARKS);
}

export async function getTimetablesCollection(db?: Db): Promise<Collection<Timetable>> {
  const database = db || (await getDb());
  return database.collection<Timetable>(COLLECTIONS.TIMETABLES);
}

export async function getTicketsCollection(db?: Db): Promise<Collection<Ticket>> {
  const database = db || (await getDb());
  return database.collection<Ticket>(COLLECTIONS.TICKETS);
}

export async function getNoticesCollection(db?: Db): Promise<Collection<Notice>> {
  const database = db || (await getDb());
  return database.collection<Notice>(COLLECTIONS.NOTICES);
}

export async function getDocumentChunksCollection(db?: Db): Promise<Collection<DocumentChunk>> {
  const database = db || (await getDb());
  return database.collection<DocumentChunk>(COLLECTIONS.DOCUMENT_CHUNKS);
}
