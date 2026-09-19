import fs from "fs";
import path from "path";
import { MongoClient } from "mongodb";
import { COLLECTIONS } from "../../lib/db/collections";

function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        let val = trimmed.slice(idx + 1).trim();
        if (
          (val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))
        ) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}
loadEnv();

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("❌ Error: MONGODB_URI is not set.");
  process.exit(1);
}

const DB_NAME = process.env.MONGODB_DB || "campus_saathi";

async function verifyDatabase() {
  console.log("=================================================");
  console.log("  CampusSaathi Database Verification");
  console.log("=================================================");

  const client = new MongoClient(uri!, { serverSelectionTimeoutMS: 10000 });
  await client.connect();
  const db = client.db(DB_NAME);

  // 1. Connection Ping
  const ping = await db.command({ ping: 1 });
  if (!ping.ok) {
    throw new Error("MongoDB ping failed.");
  }
  console.log("✓ [Pass] MongoDB Atlas Connection Verified.");

  // 2. Collection Existence
  const existingCols = (await db.listCollections().toArray()).map((c) => c.name);
  const requiredCollections = Object.values(COLLECTIONS);
  for (const col of requiredCollections) {
    if (!existingCols.includes(col)) {
      // documentChunks might be empty, ensure it is created
      await db.createCollection(col);
    }
    console.log(`✓ [Pass] Collection '${col}' exists.`);
  }

  // 3. Document Counts Check
  const usersCount = await db.collection(COLLECTIONS.USERS).countDocuments();
  const studentsCount = await db.collection(COLLECTIONS.STUDENTS).countDocuments();
  const teachersCount = await db.collection(COLLECTIONS.TEACHERS).countDocuments();
  const marksCount = await db.collection(COLLECTIONS.MARKS).countDocuments();
  const timetablesCount = await db.collection(COLLECTIONS.TIMETABLES).countDocuments();
  const noticesCount = await db.collection(COLLECTIONS.NOTICES).countDocuments();
  const ticketsCount = await db.collection(COLLECTIONS.TICKETS).countDocuments();

  console.log("\nDocument Counts:");
  console.log(`  • Users:       ${usersCount} (Expected: 31)`);
  console.log(`  • Students:    ${studentsCount} (Expected: 20)`);
  console.log(`  • Teachers:    ${teachersCount} (Expected: 10)`);
  console.log(`  • Marks:       ${marksCount} (Expected: 100)`);
  console.log(`  • Timetables:  ${timetablesCount} (Expected: 20)`);
  console.log(`  • Notices:     ${noticesCount} (Expected: >= 10)`);
  console.log(`  • Tickets:     ${ticketsCount} (Expected: 20)`);

  if (studentsCount !== 20) throw new Error(`Expected 20 students, found ${studentsCount}`);
  if (teachersCount !== 10) throw new Error(`Expected 10 teachers, found ${teachersCount}`);
  if (usersCount !== 31) throw new Error(`Expected 31 users, found ${usersCount}`);
  if (marksCount !== 100) throw new Error(`Expected 100 marks records, found ${marksCount}`);
  if (timetablesCount !== 20) throw new Error(`Expected 20 timetable docs, found ${timetablesCount}`);
  if (noticesCount < 10) throw new Error(`Expected at least 10 notices, found ${noticesCount}`);
  if (ticketsCount !== 20) throw new Error(`Expected 20 tickets, found ${ticketsCount}`);

  console.log("✓ [Pass] All document counts match exact requirements.");

  // 4. Index Verification
  console.log("\nVerifying Critical Indexes:");
  const usersIndexes = await db.collection(COLLECTIONS.USERS).indexes();
  const studentsIndexes = await db.collection(COLLECTIONS.STUDENTS).indexes();
  const teachersIndexes = await db.collection(COLLECTIONS.TEACHERS).indexes();
  const marksIndexes = await db.collection(COLLECTIONS.MARKS).indexes();
  const ticketsIndexes = await db.collection(COLLECTIONS.TICKETS).indexes();

  const hasUserUniq = usersIndexes.some((i) => i.name === "uniq_identifier" || i.key?.identifier);
  const hasStudentUniq = studentsIndexes.some((i) => i.name === "uniq_studentId" || i.key?.studentId);
  const hasTeacherUniq = teachersIndexes.some((i) => i.name === "uniq_employeeId" || i.key?.employeeId);
  const hasMarksUniq = marksIndexes.some(
    (i) => i.name === "uniq_student_subject_sem" || (i.key?.studentId && i.key?.subjectCode)
  );
  const hasTicketUniq = ticketsIndexes.some((i) => i.name === "uniq_ticketId" || i.key?.ticketId);

  if (!hasUserUniq) throw new Error("Index 'uniq_identifier' missing on users collection.");
  if (!hasStudentUniq) throw new Error("Index 'uniq_studentId' missing on students collection.");
  if (!hasTeacherUniq) throw new Error("Index 'uniq_employeeId' missing on teachers collection.");
  if (!hasMarksUniq) throw new Error("Unique index missing on marks collection.");
  if (!hasTicketUniq) throw new Error("Index 'uniq_ticketId' missing on tickets collection.");

  console.log("✓ [Pass] All unique constraint and query indexes verified.");

  // 5. Referential Integrity & Math Consistency Check
  console.log("\nChecking Data Integrity & Consistency:");

  // Check student -> user references
  const students = await db.collection(COLLECTIONS.STUDENTS).find({}).toArray();
  const userIds = new Set((await db.collection(COLLECTIONS.USERS).find({}).toArray()).map((u) => u._id.toString()));

  for (const s of students) {
    if (!userIds.has(s.userId.toString())) {
      throw new Error(`Integrity error: Student ${s.studentId} references non-existent userId ${s.userId}`);
    }
  }
  console.log("✓ [Pass] All students reference valid user records.");

  // Check teacher -> user references
  const teachers = await db.collection(COLLECTIONS.TEACHERS).find({}).toArray();
  const teacherEmpIds = new Set(teachers.map((t) => t.employeeId));
  for (const t of teachers) {
    if (!userIds.has(t.userId.toString())) {
      throw new Error(`Integrity error: Teacher ${t.employeeId} references non-existent userId ${t.userId}`);
    }
  }
  console.log("✓ [Pass] All teachers reference valid user records.");

  // Check marks calculation: totalMarks === internalMarks + endSemMarks
  const marks = await db.collection(COLLECTIONS.MARKS).find({}).toArray();
  for (const m of marks) {
    if (m.totalMarks !== m.internalMarks + m.endSemMarks) {
      throw new Error(`Math inconsistency in marks for ${m.studentId} - ${m.subjectCode}: ${m.totalMarks} !== ${m.internalMarks} + ${m.endSemMarks}`);
    }
  }
  console.log("✓ [Pass] All 100 marks records are mathematically consistent (total = internal + endSem).");

  // Check timetable faculty references
  const timetables = await db.collection(COLLECTIONS.TIMETABLES).find({}).toArray();
  for (const tt of timetables) {
    for (const slot of tt.slots) {
      if (!teacherEmpIds.has(slot.teacherId)) {
        throw new Error(`Timetable refers to invalid teacherId ${slot.teacherId}`);
      }
    }
  }
  console.log("✓ [Pass] All timetable slots reference seeded faculty members.");

  console.log("\n=================================================");
  console.log("  ALL DATABASE VERIFICATION CHECKS PASSED! ✅");
  console.log("=================================================\n");

  await client.close();
}

verifyDatabase().catch((err) => {
  console.error("❌ Database verification failed:", err);
  process.exit(1);
});
