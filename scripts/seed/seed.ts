import fs from "fs";
import path from "path";
import { MongoClient, ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import {
  User,
  Student,
  Teacher,
  Marks,
  Timetable,
  Ticket,
  Notice,
  AcademicGrade,
  DayOfWeek,
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from "../../types";
import { COLLECTIONS } from "../../lib/db/collections";
import { ensureIndexes } from "../../lib/db/indexes";

// Load environment variables from .env.local if not already present
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
  console.error("❌ Error: MONGODB_URI is not set in environment.");
  process.exit(1);
}

const DB_NAME = process.env.MONGODB_DB || "campus_saathi";

// Helper to compute grade based on total marks
function calculateGrade(total: number): AcademicGrade {
  if (total >= 90) return "O";
  if (total >= 80) return "A+";
  if (total >= 70) return "A";
  if (total >= 60) return "B+";
  if (total >= 50) return "B";
  if (total >= 40) return "C";
  return "F";
}

async function runSeed() {
  console.log("=================================================");
  console.log("  CampusSaathi Database Seed — Stage 2");
  console.log("=================================================");
  console.log(`Target Database: ${DB_NAME}`);

  const client = new MongoClient(uri!, { serverSelectionTimeoutMS: 10000 });
  await client.connect();
  const db = client.db(DB_NAME);

  console.log("✓ Connected to MongoDB Atlas successfully.");

  // 1. Ensure indexes
  console.log("Creating/verifying collection indexes...");
  await ensureIndexes(db);
  console.log("✓ Indexes verified.");

  // 2. Clear only CampusSaathi collections safely (Idempotency)
  console.log("Resetting CampusSaathi demo collections...");
  for (const colName of Object.values(COLLECTIONS)) {
    await db.collection(colName).deleteMany({});
  }
  console.log("✓ Demo collections cleared.");

  // Pre-generate deterministic password hashes for demo
  console.log("Generating demo password hashes...");
  const studentPasswordHash = bcrypt.hashSync("DemoPass@2024", 10);
  const teacherPasswordHash = bcrypt.hashSync("FacultyPass@2024", 10);
  const adminPasswordHash = bcrypt.hashSync("admin", 10);

  // Seed Default Admin User
  console.log("Seeding default Administrator account (admin/admin)...");
  await db.collection(COLLECTIONS.USERS).insertOne({
    _id: new ObjectId(),
    identifier: "admin",
    passwordHash: adminPasswordHash,
    role: "ADMIN",
    name: "System Administrator",
    email: "admin@abctech.edu.in",
    department: "ADMINISTRATION",
    createdAt: new Date("2024-01-01T00:00:00Z"),
  });

  // ==========================================
  // 3. SEED TEACHERS & THEIR USER ACCOUNTS (10)
  // ==========================================
  console.log("Seeding 10 faculty members...");
  const teachersData = [
    {
      empId: "EMP1001",
      name: "Dr. Radhika Sen",
      dept: "CSE",
      designation: "Associate Professor",
      cabin: "Academic Block A, Room 312",
      email: "radhika.sen@abctech.edu.in",
    },
    {
      empId: "EMP1002",
      name: "Prof. Amit Verma",
      dept: "CSE",
      designation: "Assistant Professor",
      cabin: "Academic Block A, Room 314",
      email: "amit.verma@abctech.edu.in",
    },
    {
      empId: "EMP1003",
      name: "Dr. Sunita Rao",
      dept: "CSE",
      designation: "Professor & HOD",
      cabin: "Academic Block A, Room 301",
      email: "sunita.rao@abctech.edu.in",
    },
    {
      empId: "EMP1004",
      name: "Prof. Rajesh Nair",
      dept: "ECE",
      designation: "Assistant Professor",
      cabin: "Academic Block B, Room 205",
      email: "rajesh.nair@abctech.edu.in",
    },
    {
      empId: "EMP1005",
      name: "Dr. Kavita Menon",
      dept: "ECE",
      designation: "Associate Professor",
      cabin: "Academic Block B, Room 210",
      email: "kavita.menon@abctech.edu.in",
    },
    {
      empId: "EMP1006",
      name: "Dr. Manoj Kulkarni",
      dept: "MECH",
      designation: "Professor & HOD",
      cabin: "Workshop Block, Room 101",
      email: "manoj.kulkarni@abctech.edu.in",
    },
    {
      empId: "EMP1007",
      name: "Prof. Suresh Pandey",
      dept: "MECH",
      designation: "Assistant Professor",
      cabin: "Workshop Block, Room 108",
      email: "suresh.pandey@abctech.edu.in",
    },
    {
      empId: "EMP1008",
      name: "Dr. Arvind Swamy",
      dept: "CIVIL",
      designation: "Associate Professor",
      cabin: "Civil Sciences Block, Room 204",
      email: "arvind.swamy@abctech.edu.in",
    },
    {
      empId: "EMP1009",
      name: "Prof. Meera Nambiar",
      dept: "CIVIL",
      designation: "Assistant Professor",
      cabin: "Civil Sciences Block, Room 209",
      email: "meera.nambiar@abctech.edu.in",
    },
    {
      empId: "EMP1010",
      name: "Dr. Pooja Hegde",
      dept: "CSE",
      designation: "Associate Professor",
      cabin: "Academic Block A, Room 320",
      email: "pooja.hegde@abctech.edu.in",
    },
  ];

  const teacherUsersToInsert: User[] = [];
  const teachersToInsert: Teacher[] = [];

  for (const t of teachersData) {
    const userId = new ObjectId();
    teacherUsersToInsert.push({
      _id: userId,
      identifier: t.empId,
      passwordHash: teacherPasswordHash,
      role: "TEACHER",
      name: t.name,
      email: t.email,
      department: t.dept,
      createdAt: new Date("2024-01-15T09:00:00Z"),
    });

    teachersToInsert.push({
      _id: new ObjectId(),
      userId: userId,
      employeeId: t.empId,
      department: t.dept,
      designation: t.designation,
      cabinLocation: t.cabin,
    });
  }

  await db.collection(COLLECTIONS.USERS).insertMany(teacherUsersToInsert);
  await db.collection(COLLECTIONS.TEACHERS).insertMany(teachersToInsert);

  // ==========================================
  // 4. SEED STUDENTS & THEIR USER ACCOUNTS (20)
  // ==========================================
  console.log("Seeding 20 students across 4 departments...");
  const studentsRaw = [
    // CSE (5)
    { id: "STU2024CSE001", name: "Aarav Sharma", dept: "CSE", year: 3, sem: 6, cgpa: 8.84, phone: "+91 98765 43210" },
    { id: "STU2024CSE002", name: "Priya Patel", dept: "CSE", year: 3, sem: 6, cgpa: 9.12, phone: "+91 98765 43211" },
    { id: "STU2024CSE003", name: "Rohan Das", dept: "CSE", year: 2, sem: 4, cgpa: 7.95, phone: "+91 98765 43212" },
    { id: "STU2024CSE004", name: "Ananya Iyer", dept: "CSE", year: 4, sem: 8, cgpa: 9.4, phone: "+91 98765 43213" },
    { id: "STU2024CSE005", name: "Aditya Joshi", dept: "CSE", year: 1, sem: 2, cgpa: 8.2, phone: "+91 98765 43214" },

    // ECE (5)
    { id: "STU2024ECE001", name: "Vikram Verma", dept: "ECE", year: 3, sem: 6, cgpa: 8.45, phone: "+91 98765 43215" },
    { id: "STU2024ECE002", name: "Sneha Reddy", dept: "ECE", year: 3, sem: 6, cgpa: 8.9, phone: "+91 98765 43216" },
    { id: "STU2024ECE003", name: "Rahul Nair", dept: "ECE", year: 2, sem: 4, cgpa: 7.6, phone: "+91 98765 43217" },
    { id: "STU2024ECE004", name: "Divya Krishnan", dept: "ECE", year: 4, sem: 8, cgpa: 9.05, phone: "+91 98765 43218" },
    { id: "STU2024ECE005", name: "Karan Malhotra", dept: "ECE", year: 1, sem: 2, cgpa: 7.8, phone: "+91 98765 43219" },

    // MECH (5)
    { id: "STU2024ME001", name: "Arjun Singh", dept: "MECH", year: 3, sem: 6, cgpa: 8.1, phone: "+91 98765 43220" },
    { id: "STU2024ME002", name: "Pooja Choudhury", dept: "MECH", year: 3, sem: 6, cgpa: 8.65, phone: "+91 98765 43221" },
    { id: "STU2024ME003", name: "Nikhil Patil", dept: "MECH", year: 2, sem: 4, cgpa: 7.4, phone: "+91 98765 43222" },
    { id: "STU2024ME004", name: "Sanjay Gupta", dept: "MECH", year: 4, sem: 8, cgpa: 8.8, phone: "+91 98765 43223" },
    { id: "STU2024ME005", name: "Riya Sen", dept: "MECH", year: 1, sem: 2, cgpa: 8.05, phone: "+91 98765 43224" },

    // CIVIL (5)
    { id: "STU2024CIV001", name: "Tanvi Deshmukh", dept: "CIVIL", year: 3, sem: 6, cgpa: 8.7, phone: "+91 98765 43225" },
    { id: "STU2024CIV002", name: "Harsh Vardhan", dept: "CIVIL", year: 3, sem: 6, cgpa: 7.85, phone: "+91 98765 43226" },
    { id: "STU2024CIV003", name: "Neha Aggarwal", dept: "CIVIL", year: 2, sem: 4, cgpa: 8.3, phone: "+91 98765 43227" },
    { id: "STU2024CIV004", name: "Karthik Pillai", dept: "CIVIL", year: 4, sem: 8, cgpa: 8.95, phone: "+91 98765 43228" },
    { id: "STU2024CIV005", name: "Shreya Banerjee", dept: "CIVIL", year: 1, sem: 2, cgpa: 7.5, phone: "+91 98765 43229" },
  ];

  const studentUsersToInsert: User[] = [];
  const studentsToInsert: Student[] = [];

  for (const s of studentsRaw) {
    const userId = new ObjectId();
    const emailPrefix = s.name.toLowerCase().replace(" ", ".");
    studentUsersToInsert.push({
      _id: userId,
      identifier: s.id,
      passwordHash: studentPasswordHash,
      role: "STUDENT",
      name: s.name,
      email: `${emailPrefix}@abctech.edu.in`,
      department: s.dept,
      createdAt: new Date("2024-07-20T10:00:00Z"),
    });

    studentsToInsert.push({
      _id: new ObjectId(),
      userId: userId,
      studentId: s.id,
      department: s.dept,
      year: s.year,
      semester: s.sem,
      cgpa: s.cgpa,
      phone: s.phone,
    });
  }

  await db.collection(COLLECTIONS.USERS).insertMany(studentUsersToInsert);
  await db.collection(COLLECTIONS.STUDENTS).insertMany(studentsToInsert);

  // ==========================================
  // 5. SEED SUBJECTS & MARKS (20 Subjects)
  // ==========================================
  console.log("Seeding subjects and mathematically consistent student marks...");
  const subjectsByDept: Record<string, Array<{ code: string; name: string }>> = {
    CSE: [
      { code: "CS601", name: "Database Management Systems" },
      { code: "CS602", name: "Operating Systems" },
      { code: "CS603", name: "Computer Networks" },
      { code: "CS604", name: "Software Engineering" },
      { code: "CS605", name: "Artificial Intelligence" },
    ],
    ECE: [
      { code: "EC601", name: "Digital Signal Processing" },
      { code: "EC602", name: "Microprocessors & Microcontrollers" },
      { code: "EC603", name: "VLSI Design" },
      { code: "EC604", name: "Communication Systems" },
      { code: "EC605", name: "Electromagnetic Theory" },
    ],
    MECH: [
      { code: "ME601", name: "Heat & Mass Transfer" },
      { code: "ME602", name: "Design of Machine Elements" },
      { code: "ME603", name: "Fluid Mechanics" },
      { code: "ME604", name: "Manufacturing Technology" },
      { code: "ME605", name: "Kinematics of Machinery" },
    ],
    CIVIL: [
      { code: "CE601", name: "Structural Analysis" },
      { code: "CE602", name: "Geotechnical Engineering" },
      { code: "CE603", name: "Environmental Engineering" },
      { code: "CE604", name: "Transportation Engineering" },
      { code: "CE605", name: "Concrete Technology" },
    ],
  };

  const marksToInsert: Marks[] = [];

  for (const s of studentsRaw) {
    const deptSubjects = subjectsByDept[s.dept] || subjectsByDept["CSE"];

    for (let i = 0; i < deptSubjects.length; i++) {
      const subj = deptSubjects[i];
      // Deterministic realistic internal marks (28 to 39 out of 40)
      // Deterministic realistic endSem marks (40 to 58 out of 60)
      const baseHash = (s.id.charCodeAt(s.id.length - 1) + i * 7) % 11;
      const internalMarks = 30 + (baseHash % 10); // 30 - 39
      const endSemMarks = 42 + ((baseHash * 3) % 17); // 42 - 58
      const totalMarks = internalMarks + endSemMarks;
      const grade = calculateGrade(totalMarks);

      marksToInsert.push({
        _id: new ObjectId(),
        studentId: s.id,
        subjectCode: subj.code,
        subjectName: subj.name,
        semester: s.sem,
        internalMarks,
        endSemMarks,
        totalMarks,
        grade,
      });
    }
  }

  await db.collection(COLLECTIONS.MARKS).insertMany(marksToInsert);

  // ==========================================
  // 6. SEED TIMETABLES (Monday - Friday for 4 Depts)
  // ==========================================
  console.log("Seeding weekly departmental timetables...");
  const days: DayOfWeek[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const timetablesToInsert: Timetable[] = [];

  const deptScheduleMap: Record<
    string,
    {
      sem: number;
      faculty: Array<{ id: string; name: string }>;
      subjects: Array<{ code: string; name: string }>;
      rooms: string[];
    }
  > = {
    CSE: {
      sem: 6,
      faculty: [
        { id: "EMP1001", name: "Dr. Radhika Sen" },
        { id: "EMP1002", name: "Prof. Amit Verma" },
        { id: "EMP1003", name: "Dr. Sunita Rao" },
        { id: "EMP1010", name: "Dr. Pooja Hegde" },
      ],
      subjects: subjectsByDept["CSE"],
      rooms: ["Room 204", "Room 205", "Lab 3 (Computing)", "Room 204", "Lab 2 (Advanced DB)"],
    },
    ECE: {
      sem: 6,
      faculty: [
        { id: "EMP1004", name: "Prof. Rajesh Nair" },
        { id: "EMP1005", name: "Dr. Kavita Menon" },
      ],
      subjects: subjectsByDept["ECE"],
      rooms: ["Room 302", "Room 304", "VLSI Lab", "Room 302", "DSP Lab"],
    },
    MECH: {
      sem: 6,
      faculty: [
        { id: "EMP1006", name: "Dr. Manoj Kulkarni" },
        { id: "EMP1007", name: "Prof. Suresh Pandey" },
      ],
      subjects: subjectsByDept["MECH"],
      rooms: ["Room 105", "Room 106", "Heat Engines Lab", "Room 105", "CAD/CAM Center"],
    },
    CIVIL: {
      sem: 6,
      faculty: [
        { id: "EMP1008", name: "Dr. Arvind Swamy" },
        { id: "EMP1009", name: "Prof. Meera Nambiar" },
      ],
      subjects: subjectsByDept["CIVIL"],
      rooms: ["Room 401", "Room 402", "Surveying Lab", "Room 401", "Geotechnical Lab"],
    },
  };

  const timeSlots = [
    "09:30 AM - 10:30 AM",
    "10:30 AM - 11:30 AM",
    "11:45 AM - 12:45 PM",
    "01:45 PM - 02:45 PM",
    "03:00 PM - 05:00 PM (Lab Slot)",
  ];

  for (const dept of ["CSE", "ECE", "MECH", "CIVIL"]) {
    const config = deptScheduleMap[dept];
    for (let dayIdx = 0; dayIdx < days.length; dayIdx++) {
      const day = days[dayIdx];
      const slots = [];

      for (let slotIdx = 0; slotIdx < timeSlots.length; slotIdx++) {
        const subjIdx = (dayIdx + slotIdx) % config.subjects.length;
        const facIdx = (dayIdx + slotIdx) % config.faculty.length;
        const subj = config.subjects[subjIdx];
        const fac = config.faculty[facIdx];

        slots.push({
          time: timeSlots[slotIdx],
          subjectCode: subj.code,
          subjectName: subj.name,
          teacherId: fac.id,
          teacherName: fac.name,
          room: config.rooms[slotIdx % config.rooms.length],
        });
      }

      timetablesToInsert.push({
        _id: new ObjectId(),
        department: dept,
        semester: config.sem,
        dayOfWeek: day,
        slots,
      });
    }
  }

  await db.collection(COLLECTIONS.TIMETABLES).insertMany(timetablesToInsert);

  // ==========================================
  // 7. SEED NOTICES (12 Fictional Notices)
  // ==========================================
  console.log("Seeding 12 campus circulars and notices...");
  const noticesToInsert: Notice[] = [
    {
      _id: new ObjectId(),
      title: "Mid-Term Examination Schedule Released for Even Semesters 2026",
      category: "Examination",
      date: "2026-10-05",
      content:
        "The Mid-Term theory examinations for 2nd, 4th, 6th, and 8th semesters will commence from October 12, 2026. Hall tickets can be collected from respective departmental offices starting Oct 8.",
      priority: "HIGH",
    },
    {
      _id: new ObjectId(),
      title: "Central Library Extended Study Hours During Examination Period",
      category: "Academic",
      date: "2026-10-02",
      content:
        "To facilitate student preparation for mid-terms, the Central Library reading halls will remain open until 10:00 PM on all working days and Sundays starting October 6 through October 25, 2026.",
      priority: "NORMAL",
    },
    {
      _id: new ObjectId(),
      title: "National Technical Symposium 'Invento 2026' Paper Submissions Open",
      category: "Events",
      date: "2026-09-28",
      content:
        "The annual engineering symposium 'Invento 2026' invites undergraduate and postgraduate research papers across AI, Robotics, Green Energy, and Smart Infrastructure. Cash prizes up to ₹1,00,000.",
      priority: "NORMAL",
    },
    {
      _id: new ObjectId(),
      title: "Campus Recruitment Drive 2026 — Tier-1 Tech Companies Pre-Registration",
      category: "Placements",
      date: "2026-09-25",
      content:
        "All final-year B.Tech students (Class of 2026) are required to verify their academic CGPA and submit their updated resumes to the Placement Portal before October 15, 2026.",
      priority: "HIGH",
    },
    {
      _id: new ObjectId(),
      title: "Merit-cum-Means Scholarship Applications Closing Date",
      category: "Administration",
      date: "2026-09-20",
      content:
        "Applications for the State Merit-cum-Means scholarship for 2026-27 will close on October 10. Eligible students must submit verified income certificates to the Academic Dean office.",
      priority: "NORMAL",
    },
    {
      _id: new ObjectId(),
      title: "Hostel Maintenance Schedule — Water Tank Disinfection Notice",
      category: "Hostel",
      date: "2026-09-18",
      content:
        "Overhead water tank cleaning for Hostel Blocks A, B, and C will occur this Saturday between 09:00 AM and 01:00 PM. Alternative water supply will be available on ground floors.",
      priority: "NORMAL",
    },
    {
      _id: new ObjectId(),
      title: "Attendance Condonation Guidelines for Semester 6",
      category: "Academic",
      date: "2026-09-15",
      content:
        "Students with overall attendance between 65% and 74.9% due to verified medical emergencies must submit medical certificates counter-signed by the Chief Medical Officer before Oct 20.",
      priority: "HIGH",
    },
    {
      _id: new ObjectId(),
      title: "Hands-on Workshop on Generative AI & Vector Search",
      category: "Events",
      date: "2026-09-12",
      content:
        "The CSE Department is organizing a 2-day hands-on bootcamp on Large Language Models, RAG Architecture, and MongoDB Vector Search in Computing Lab 3 on October 17-18, 2026.",
      priority: "NORMAL",
    },
    {
      _id: new ObjectId(),
      title: "Re-evaluation Results for Odd Semester 2025-26",
      category: "Examination",
      date: "2026-09-10",
      content:
        "Results for students who applied for challenge evaluation in the December 2025 university examinations have been uploaded to the student portal. Grade cards have been updated accordingly.",
      priority: "NORMAL",
    },
    {
      _id: new ObjectId(),
      title: "Annual Sports Meet 'Athlos 2026' Selection Trials",
      category: "Events",
      date: "2026-09-08",
      content:
        "Selection trials for Football, Cricket, Badminton, and Track & Field events will be held at the Main Stadium between 04:30 PM and 06:30 PM starting Sept 14. All students welcome.",
      priority: "NORMAL",
    },
    {
      _id: new ObjectId(),
      title: "Classroom Projection System Maintenance and Reporting",
      category: "Administration",
      date: "2026-09-05",
      content:
        "Faculty and class representatives encountering audio-visual equipment faults in Academic Blocks A and B are requested to lodge digital tickets via CampusSaathi for same-day resolution.",
      priority: "NORMAL",
    },
    {
      _id: new ObjectId(),
      title: "Notice Regarding Campus Wi-Fi Security Certificate Renewal",
      category: "Administration",
      date: "2026-09-01",
      content:
        "The campus-wide 802.1x enterprise Wi-Fi certificate will be updated tonight at 11:00 PM. Students and faculty may need to re-accept the security certificate on their mobile devices.",
      priority: "NORMAL",
    },
  ];

  await db.collection(COLLECTIONS.NOTICES).insertMany(noticesToInsert);

  // ==========================================
  // 8. SEED TICKETS (20 Historical / Demo Tickets)
  // ==========================================
  console.log("Seeding 20 realistic helpdesk tickets...");
  const ticketSamples: Array<{
    cat: TicketCategory;
    title: string;
    desc: string;
    prio: TicketPriority;
    status: TicketStatus;
    userId: string;
    userName: string;
    role: "STUDENT" | "TEACHER";
    daysAgo: number;
  }> = [
    {
      cat: "Classroom",
      title: "Projector flickering in Room 402",
      desc: "The HDMI ceiling projector in Room 402 continuously loses sync during morning lectures.",
      prio: "HIGH",
      status: "OPEN",
      userId: "STU2024CSE001",
      userName: "Aarav Sharma",
      role: "STUDENT",
      daysAgo: 0,
    },
    {
      cat: "Internet",
      title: "Hostel Block C 3rd Floor Wi-Fi Outage",
      desc: "No wireless connectivity in rooms 301 through 315 since yesterday evening.",
      prio: "MEDIUM",
      status: "IN_PROGRESS",
      userId: "STU2024CSE003",
      userName: "Rohan Das",
      role: "STUDENT",
      daysAgo: 1,
    },
    {
      cat: "Electrical",
      title: "Lab 3 Air Conditioning cooling issue",
      desc: "AC unit #2 in Computing Lab 3 is blowing ambient room temperature air.",
      prio: "LOW",
      status: "RESOLVED",
      userId: "EMP1001",
      userName: "Dr. Radhika Sen",
      role: "TEACHER",
      daysAgo: 3,
    },
    {
      cat: "Classroom",
      title: "Broken audio microphone in Seminar Hall 1",
      desc: "Collar mic produces loud static distortion whenever the amplifier volume is raised.",
      prio: "MEDIUM",
      status: "IN_PROGRESS",
      userId: "EMP1003",
      userName: "Dr. Sunita Rao",
      role: "TEACHER",
      daysAgo: 2,
    },
    {
      cat: "IT Support",
      title: "MATLAB license activation error on Lab PC 18",
      desc: "Workstation 18 in ECE CAD Lab displays Network License Manager error -96.",
      prio: "MEDIUM",
      status: "RESOLVED",
      userId: "STU2024ECE001",
      userName: "Vikram Verma",
      role: "STUDENT",
      daysAgo: 4,
    },
    {
      cat: "Library",
      title: "RFID Book Drop kiosk scanner unresponsive",
      desc: "The automated book return kiosk at Central Library entrance is stuck on scanning screen.",
      prio: "LOW",
      status: "RESOLVED",
      userId: "STU2024CSE002",
      userName: "Priya Patel",
      role: "STUDENT",
      daysAgo: 5,
    },
    {
      cat: "Hostel",
      title: "Water heater tripping circuit breaker in Block B",
      desc: "Second floor geyser in Hostel B causes the MCB switch to trip within 2 minutes of turning on.",
      prio: "HIGH",
      status: "IN_PROGRESS",
      userId: "STU2024ME001",
      userName: "Arjun Singh",
      role: "STUDENT",
      daysAgo: 1,
    },
    {
      cat: "Classroom",
      title: "Whiteboard marker tray detached in Room 204",
      desc: "The magnetic marker tray on the main lecture whiteboard has broken off its wall bracket.",
      prio: "LOW",
      status: "RESOLVED",
      userId: "EMP1002",
      userName: "Prof. Amit Verma",
      role: "TEACHER",
      daysAgo: 6,
    },
    {
      cat: "Internet",
      title: "Slow internet speeds in Civil CAD Lab",
      desc: "Speed test shows under 1 Mbps on several workstations during large drawing downloads.",
      prio: "MEDIUM",
      status: "OPEN",
      userId: "STU2024CIV001",
      userName: "Tanvi Deshmukh",
      role: "STUDENT",
      daysAgo: 0,
    },
    {
      cat: "Electrical",
      title: "Tube light flickering in Academic Block A Stairwell",
      desc: "Emergency stairwell light between 2nd and 3rd floor is blinking rapidly.",
      prio: "LOW",
      status: "RESOLVED",
      userId: "EMP1010",
      userName: "Dr. Pooja Hegde",
      role: "TEACHER",
      daysAgo: 7,
    },
    {
      cat: "IT Support",
      title: "Student Portal password reset email delay",
      desc: "Password reset OTP emails for college portal taking upwards of 45 minutes to arrive.",
      prio: "MEDIUM",
      status: "RESOLVED",
      userId: "STU2024CSE004",
      userName: "Ananya Iyer",
      role: "STUDENT",
      daysAgo: 8,
    },
    {
      cat: "Classroom",
      title: "Smart board touch calibration off in Room 310",
      desc: "Digital pen clicks are registering 2 inches to the right of the actual touch point.",
      prio: "MEDIUM",
      status: "OPEN",
      userId: "EMP1005",
      userName: "Dr. Kavita Menon",
      role: "TEACHER",
      daysAgo: 2,
    },
    {
      cat: "Academic",
      title: "Discrepancy in internal assessment component for CS604",
      desc: "Assignment 2 marks not reflecting in the consolidated internal marks sheet.",
      prio: "HIGH",
      status: "RESOLVED",
      userId: "STU2024CSE005",
      userName: "Aditya Joshi",
      role: "STUDENT",
      daysAgo: 9,
    },
    {
      cat: "Hostel",
      title: "Washing machine drainage blockage in Hostel A",
      desc: "Laundry machine #4 on ground floor has standing water and does not complete spin cycle.",
      prio: "LOW",
      status: "RESOLVED",
      userId: "STU2024ECE003",
      userName: "Rahul Nair",
      role: "STUDENT",
      daysAgo: 10,
    },
    {
      cat: "Electrical",
      title: "Power socket not working at Faculty Cabin C-108",
      desc: "Dual wall socket under desk has no voltage output, unable to power laptop dock.",
      prio: "MEDIUM",
      status: "RESOLVED",
      userId: "EMP1007",
      userName: "Prof. Suresh Pandey",
      role: "TEACHER",
      daysAgo: 5,
    },
    {
      cat: "Library",
      title: "Digital library journal access credentials expired",
      desc: "IEEE Xplore institutional single sign-on redirecting to subscription renewal page.",
      prio: "HIGH",
      status: "RESOLVED",
      userId: "EMP1006",
      userName: "Dr. Manoj Kulkarni",
      role: "TEACHER",
      daysAgo: 11,
    },
    {
      cat: "Classroom",
      title: "Classroom 106 podium height adjustment motor jammed",
      desc: "Hydraulic lift mechanism for the lecturer podium is locked in highest position.",
      prio: "LOW",
      status: "IN_PROGRESS",
      userId: "EMP1008",
      userName: "Dr. Arvind Swamy",
      role: "TEACHER",
      daysAgo: 3,
    },
    {
      cat: "Internet",
      title: "Guest Wi-Fi portal loop in Main Auditorium",
      desc: "Visiting speakers unable to connect to ABC-Guest network, landing page reloads infinitely.",
      prio: "HIGH",
      status: "RESOLVED",
      userId: "EMP1004",
      userName: "Prof. Rajesh Nair",
      role: "TEACHER",
      daysAgo: 12,
    },
    {
      cat: "Administration",
      title: "Campus ID Card magnetic stripe unreadable at turnstiles",
      desc: "Main gate turnstile beeps red error on card swipe, requires manual security bypass.",
      prio: "LOW",
      status: "OPEN",
      userId: "STU2024ME003",
      userName: "Nikhil Patil",
      role: "STUDENT",
      daysAgo: 1,
    },
    {
      cat: "IT Support",
      title: "Python environment missing OpenCV on Lab 2 systems",
      desc: "Computer Vision practical assignment cannot run without cv2 module installed in base env.",
      prio: "HIGH",
      status: "RESOLVED",
      userId: "STU2024CSE001",
      userName: "Aarav Sharma",
      role: "STUDENT",
      daysAgo: 14,
    },
  ];

  const ticketsToInsert: Ticket[] = [];
  for (let i = 0; i < ticketSamples.length; i++) {
    const t = ticketSamples[i];
    const ticketNum = 1001 + i;
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - t.daysAgo);

    ticketsToInsert.push({
      _id: new ObjectId(),
      ticketId: `CS-TKT-${ticketNum}`,
      userId: t.userId,
      userName: t.userName,
      userRole: t.role,
      category: t.cat,
      description: `${t.title}: ${t.desc}`,
      priority: t.prio,
      status: t.status,
      createdAt,
    });
  }

  await db.collection(COLLECTIONS.TICKETS).insertMany(ticketsToInsert);

  // ==========================================
  // 9. SUMMARY STATISTICS
  // ==========================================
  const userCount = await db.collection(COLLECTIONS.USERS).countDocuments();
  const studentCount = await db.collection(COLLECTIONS.STUDENTS).countDocuments();
  const teacherCount = await db.collection(COLLECTIONS.TEACHERS).countDocuments();
  const marksCount = await db.collection(COLLECTIONS.MARKS).countDocuments();
  const timetableCount = await db.collection(COLLECTIONS.TIMETABLES).countDocuments();
  const noticeCount = await db.collection(COLLECTIONS.NOTICES).countDocuments();
  const ticketCount = await db.collection(COLLECTIONS.TICKETS).countDocuments();

  console.log("\n=================================================");
  console.log("  Seed Completed Successfully!");
  console.log("=================================================");
  console.log(`  Users:        ${userCount} (20 Students + 10 Teachers)`);
  console.log(`  Students:     ${studentCount} (Across CSE, ECE, MECH, CIVIL)`);
  console.log(`  Teachers:     ${teacherCount} (Across 4 Departments)`);
  console.log(`  Marks:        ${marksCount} (5 Subjects x 20 Students)`);
  console.log(`  Timetables:   ${timetableCount} (5 Days x 4 Departments)`);
  console.log(`  Notices:      ${noticeCount} (Campus Announcements)`);
  console.log(`  Tickets:      ${ticketCount} (Historical Helpdesk Records)`);
  console.log("=================================================\n");

  await client.close();
  console.log("✓ MongoDB connection cleanly closed.");
}

runSeed().catch((err) => {
  console.error("❌ Fatal Error during seed execution:", err);
  process.exit(1);
});
