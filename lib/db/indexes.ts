import { Db } from "mongodb";
import { COLLECTIONS } from "./collections";

export interface IndexCreationResult {
  collection: string;
  indexName: string;
  status: "created" | "already_exists" | "skipped";
}

/**
 * Ensures all required application indexes exist across CampusSaathi collections.
 * Idempotent: Can be safely executed multiple times.
 */
export async function ensureIndexes(db: Db): Promise<IndexCreationResult[]> {
  const results: IndexCreationResult[] = [];

  // Helper to create index safely
  async function createSafeIndex(
    collectionName: string,
    indexSpec: Record<string, 1 | -1>,
    options?: { unique?: boolean; name?: string }
  ) {
    try {
      const col = db.collection(collectionName);
      const name = await col.createIndex(indexSpec, options);
      results.push({ collection: collectionName, indexName: name, status: "created" });
    } catch (err: unknown) {
      const error = err as Error;
      // If already exists with same spec, it's fine
      results.push({
        collection: collectionName,
        indexName: options?.name || Object.keys(indexSpec).join("_"),
        status: error.message.includes("already exists") ? "already_exists" : "skipped",
      });
    }
  }

  // 1. users: unique identifier
  await createSafeIndex(COLLECTIONS.USERS, { identifier: 1 }, { unique: true, name: "uniq_identifier" });

  // 2. students: unique studentId, userId, department + semester
  await createSafeIndex(COLLECTIONS.STUDENTS, { studentId: 1 }, { unique: true, name: "uniq_studentId" });
  await createSafeIndex(COLLECTIONS.STUDENTS, { userId: 1 }, { name: "idx_userId" });
  await createSafeIndex(COLLECTIONS.STUDENTS, { department: 1, semester: 1 }, { name: "idx_dept_sem" });

  // 3. teachers: unique employeeId, userId, department
  await createSafeIndex(COLLECTIONS.TEACHERS, { employeeId: 1 }, { unique: true, name: "uniq_employeeId" });
  await createSafeIndex(COLLECTIONS.TEACHERS, { userId: 1 }, { name: "idx_userId" });
  await createSafeIndex(COLLECTIONS.TEACHERS, { department: 1 }, { name: "idx_department" });

  // 4. marks: studentId + semester, unique studentId + subjectCode + semester
  await createSafeIndex(COLLECTIONS.MARKS, { studentId: 1, semester: 1 }, { name: "idx_student_sem" });
  await createSafeIndex(
    COLLECTIONS.MARKS,
    { studentId: 1, subjectCode: 1, semester: 1 },
    { unique: true, name: "uniq_student_subject_sem" }
  );

  // 5. timetables: department + semester + dayOfWeek
  await createSafeIndex(
    COLLECTIONS.TIMETABLES,
    { department: 1, semester: 1, dayOfWeek: 1 },
    { name: "idx_dept_sem_day" }
  );

  // 6. tickets: unique ticketId, userId + createdAt, status + createdAt
  await createSafeIndex(COLLECTIONS.TICKETS, { ticketId: 1 }, { unique: true, name: "uniq_ticketId" });
  await createSafeIndex(COLLECTIONS.TICKETS, { userId: 1, createdAt: -1 }, { name: "idx_user_created" });
  await createSafeIndex(COLLECTIONS.TICKETS, { status: 1, createdAt: -1 }, { name: "idx_status_created" });

  // 7. notices: date, category + date
  await createSafeIndex(COLLECTIONS.NOTICES, { date: -1 }, { name: "idx_date" });
  await createSafeIndex(COLLECTIONS.NOTICES, { category: 1, date: -1 }, { name: "idx_category_date" });

  // 8. documentChunks: docId + section (Preparation for RAG; vector index deferred to Stage 5)
  await createSafeIndex(COLLECTIONS.DOCUMENT_CHUNKS, { docId: 1, section: 1 }, { name: "idx_doc_section" });

  return results;
}
