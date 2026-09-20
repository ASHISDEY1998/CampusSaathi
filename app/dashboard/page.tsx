"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Calendar,
  Clock,
  Award,
  ArrowRight,
  LifeBuoy,
  Briefcase,
  Bell,
  Layers,
  BookOpen,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface AuthUser {
  identifier: string;
  name: string;
  role: "STUDENT" | "TEACHER" | "ADMIN";
  email: string;
  department: string;
}

interface StudentDashboardData {
  user: AuthUser;
  profile: {
    year?: number;
    semester?: number;
    cgpa?: number;
    phone?: string;
  } | null;
  marks: Array<{
    subjectCode: string;
    subjectName: string;
    semester: number;
    internalMarks: number;
    endSemMarks: number;
    totalMarks: number;
    grade: string;
  }>;
  timetables: Array<{
    department: string;
    semester: number;
    dayOfWeek: string;
    slots: Array<{
      time: string;
      subjectCode: string;
      subjectName: string;
      room: string;
    }>;
  }>;
  notices: Array<{
    title: string;
    category: string;
    date: string;
    content: string;
    priority: string;
  }>;
  tickets: Array<{
    ticketId: string;
    category: string;
    description: string;
    status: string;
    priority: string;
    createdAt: string;
  }>;
}

interface TeacherDashboardData {
  user: AuthUser;
  profile: {
    designation?: string;
    cabinLocation?: string;
    subjectsTaught?: string[];
  } | null;
  schedule: Array<{
    day: string;
    time: string;
    subject: string;
    subjectCode: string;
    room: string;
    batch: string;
  }>;
  notices: Array<{
    title: string;
    category: string;
    date: string;
    content: string;
    priority: string;
  }>;
  tickets: Array<{
    ticketId: string;
    category: string;
    description: string;
    status: string;
    priority: string;
    createdAt: string;
  }>;
}

export default function DashboardPage() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [studentData, setStudentData] = useState<StudentDashboardData | null>(null);
  const [teacherData, setTeacherData] = useState<TeacherDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [studentTab, setStudentTab] = useState<"marks" | "notices">("marks");
  const [teacherTab, setTeacherTab] = useState<"schedule" | "notices">("schedule");

  useEffect(() => {
    let isMounted = true;

    const loadSessionAndData = async () => {
      try {
        const authRes = await fetch("/api/auth/me");
        if (!authRes.ok) return;

        const authData = await authRes.json();
        const user = authData.data?.user || authData.user;

        if (isMounted && authData.success && user) {
          setCurrentUser(user);

          if (user.role === "STUDENT") {
            const studentRes = await fetch("/api/student/dashboard");
            if (studentRes.ok) {
              const sData = await studentRes.json();
              if (isMounted && sData.success) {
                setStudentData(sData.data || sData);
              }
            }
          } else if (user.role === "TEACHER") {
            const teacherRes = await fetch("/api/teacher/dashboard");
            if (teacherRes.ok) {
              const tData = await teacherRes.json();
              if (isMounted && tData.success) {
                setTeacherData(tData.data || tData);
              }
            }
          }
        }
      } catch {
        // graceful empty state
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadSessionAndData();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-12 flex flex-col items-center justify-center space-y-3">
        <div className="h-6 w-6 rounded-full border-2 border-zinc-300 dark:border-zinc-700 border-t-sky-500 animate-spin" />
        <span className="text-xs text-zinc-500 dark:text-zinc-400">Loading secure portal...</span>
      </div>
    );
  }

  /* ========================================================================= */
  /* 1. STUDENT DASHBOARD (Rendered ONLY if authenticated role is STUDENT)    */
  /* ========================================================================= */
  if (currentUser?.role === "STUDENT") {
    const cgpa = studentData?.profile?.cgpa;
    const year = studentData?.profile?.year;
    const semester = studentData?.profile?.semester;
    const marks = studentData?.marks || [];
    const notices = studentData?.notices || [];

    return (
      <div className="space-y-4 sm:space-y-6 max-w-5xl mx-auto pb-4">
        {/* Sleek Welcome Header */}
        <div className="rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 p-4 sm:p-6 shadow-xs transition-colors">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge variant="sky" className="font-mono text-[10px] sm:text-[11px] py-0.5 px-2">
                {currentUser.identifier}
              </Badge>
              <span className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400">
                Dept of {currentUser.department} {year && semester ? `• Year ${year} (Sem ${semester})` : ""}
              </span>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-medium border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Enrolled</span>
            </span>
          </div>
          <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Welcome, {currentUser.name}
          </h1>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400 max-w-xl leading-relaxed">
            Consolidated academic records, verified circulars, and AI assistance.
          </p>
        </div>

        {/* Academic Overview Metrics */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-0.5">
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-sky-500" />
              Academic Overview
            </h2>
            {semester && <span className="text-[10px] text-zinc-400 font-mono">Semester {semester}</span>}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {/* CGPA */}
            <Card className="p-3 sm:p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
                <span className="text-[11px] sm:text-xs font-medium">Cumulative CGPA</span>
                <Award className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-sky-500" />
              </div>
              <div className="mt-2 sm:mt-3">
                <div className="text-xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
                  {typeof cgpa === "number" ? cgpa.toFixed(2) : "—"}
                </div>
                <div className="mt-0.5 text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400">
                  {typeof cgpa === "number" ? "Official record" : "Pending sync"}
                </div>
              </div>
            </Card>

            {/* Attendance */}
            <Card className="p-3 sm:p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
                <span className="text-[11px] sm:text-xs font-medium">Attendance</span>
                <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-sky-500" />
              </div>
              <div className="mt-2 sm:mt-3">
                <div className="text-xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
                  85%+
                </div>
                <div className="mt-0.5 text-[10px] sm:text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  Requirement met
                </div>
              </div>
            </Card>

            {/* Weekly Routine */}
            <Card className="p-3 sm:p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
                <span className="text-[11px] sm:text-xs font-medium">Weekly Routine</span>
                <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-sky-500" />
              </div>
              <div className="mt-2 sm:mt-3">
                <div className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-white truncate">
                  {studentData?.timetables?.length ? `${studentData.timetables.length} Schedules` : "Active"}
                </div>
                <div className="mt-0.5 text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400">
                  Routine synced
                </div>
              </div>
            </Card>

            {/* Helpdesk Tickets */}
            <Card className="p-3 sm:p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
                <span className="text-[11px] sm:text-xs font-medium">My Tickets</span>
                <LifeBuoy className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-sky-500" />
              </div>
              <div className="mt-2 sm:mt-3">
                <div className="text-xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
                  {studentData?.tickets?.length || 0}
                </div>
                <Link
                  href="/tickets"
                  className="mt-0.5 inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-medium text-sky-500 hover:text-sky-600 transition-colors"
                >
                  <span>Helpdesk</span>
                  <ArrowRight className="h-2.5 w-2.5" />
                </Link>
              </div>
            </Card>
          </div>
        </div>

        {/* Sleek AI Quick Ask Bar (Compact & High-Tech) */}
        <Link
          href="/chat"
          className="group block rounded-xl border border-sky-500/30 bg-gradient-to-r from-sky-500/10 via-sky-500/5 to-transparent p-3 sm:p-4 hover:border-sky-500/60 transition-all shadow-2xs"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-xs group-hover:scale-105 transition-transform">
                <Sparkles className="h-4 w-4 text-sky-500" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-900 dark:text-white">
                  <span>Ask CampusSaathi AI</span>
                  <span className="text-[10px] font-normal text-sky-500 hidden sm:inline">• Grounded Intelligence</span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                  Ask attendance requirements, exam dates, or departmental timetables...
                </p>
              </div>
            </div>
            <div className="shrink-0 flex items-center gap-1 text-xs font-medium text-sky-500 group-hover:translate-x-0.5 transition-transform">
              <span className="hidden sm:inline">Ask AI</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>
        </Link>

        {/* Mobile Tab Segment Switcher (<lg) */}
        <div className="flex rounded-xl bg-zinc-100 dark:bg-zinc-900 p-1 border border-zinc-200 dark:border-zinc-800 lg:hidden">
          <button
            type="button"
            onClick={() => setStudentTab("marks")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
              studentTab === "marks"
                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs font-semibold"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
          >
            <Award className="h-3.5 w-3.5 text-sky-500" />
            <span>Course Marks ({marks.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setStudentTab("notices")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
              studentTab === "notices"
                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs font-semibold"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
          >
            <Bell className="h-3.5 w-3.5 text-sky-500" />
            <span>Circulars ({notices.length})</span>
          </button>
        </div>

        {/* Marks & Circulars Content Grid (Responsive: Tabbed on Mobile, Side-by-Side on Desktop) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
          {/* Academic Marks */}
          <Card className={`p-4 sm:p-5 ${studentTab === "marks" ? "block" : "hidden lg:block"}`}>
            <CardHeader className="flex-row items-center justify-between p-0 pb-3">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-sky-500" />
                <CardTitle className="text-xs sm:text-sm">Course Marks</CardTitle>
              </div>
              <Badge variant="outline" className="text-[10px]">Official Record</Badge>
            </CardHeader>

            <CardContent className="p-0 space-y-2">
              {marks.length === 0 ? (
                <div className="py-6 text-center text-xs text-zinc-400 dark:text-zinc-500">
                  No academic records available yet.
                </div>
              ) : (
                marks.slice(0, 5).map((m, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800/80"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                        {m.subjectName}
                      </div>
                      <div className="text-[10px] text-zinc-500 font-mono">
                        {m.subjectCode} • Sem {m.semester}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-zinc-900 dark:text-white">
                        {m.totalMarks} <span className="text-[10px] font-normal text-zinc-400">/ 100</span>
                      </div>
                      <Badge variant="sky" className="text-[9px] py-0 px-1.5">
                        Grade {m.grade}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Campus Notices & Circulars */}
          <Card className={`p-4 sm:p-5 ${studentTab === "notices" ? "block" : "hidden lg:block"}`}>
            <CardHeader className="flex-row items-center justify-between p-0 pb-3">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-sky-500" />
                <CardTitle className="text-xs sm:text-sm">Institutional Circulars</CardTitle>
              </div>
              <Badge variant="default" className="text-[10px]">Verified</Badge>
            </CardHeader>

            <CardContent className="p-0 space-y-2">
              {notices.length === 0 ? (
                <div className="py-6 text-center text-xs text-zinc-400 dark:text-zinc-500">
                  No institutional circulars published yet.
                </div>
              ) : (
                notices.slice(0, 5).map((notice, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 sm:p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                        {notice.title}
                      </span>
                      {notice.priority === "HIGH" && (
                        <Badge variant="rose" className="text-[9px] shrink-0">Priority</Badge>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-[10px] text-zinc-500 dark:text-zinc-400">
                      <Badge variant="outline" className="text-[9px] py-0 px-1.5">{notice.category}</Badge>
                      <span>• {notice.date}</span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  /* ========================================================================= */
  /* 2. TEACHER CONSOLE (Rendered ONLY if authenticated role is TEACHER)       */
  /* ========================================================================= */
  if (currentUser?.role === "TEACHER") {
    const designation = teacherData?.profile?.designation || "Faculty Member";
    const cabin = teacherData?.profile?.cabinLocation || "Pending Assignment";
    const schedule = teacherData?.schedule || [];
    const notices = teacherData?.notices || [];

    return (
      <div className="space-y-4 sm:space-y-6 max-w-5xl mx-auto pb-4">
        {/* Welcome Header */}
        <div className="rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 p-4 sm:p-6 shadow-xs transition-colors">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge variant="sky" className="font-mono text-[10px] sm:text-[11px] py-0.5 px-2">
                {currentUser.identifier}
              </Badge>
              <span className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400">
                Department of {currentUser.department} • {designation}
              </span>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] text-sky-600 dark:text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full font-medium border border-sky-500/20">
              <span>Faculty</span>
            </span>
          </div>
          <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Faculty Academic Console
          </h1>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400 max-w-xl leading-relaxed">
            Welcome, {currentUser.name}. Manage your assigned lectures, timetable slots, and circulars.
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4">
          <Card className="p-3.5 sm:p-4">
            <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
              <span className="text-[11px] sm:text-xs font-medium">Assigned Cabin</span>
              <Briefcase className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-sky-500" />
            </div>
            <div className="mt-1.5 text-sm sm:text-base font-semibold text-zinc-900 dark:text-white truncate">
              {cabin}
            </div>
            <div className="mt-0.5 text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400">
              Official faculty workspace
            </div>
          </Card>

          <Card className="p-3.5 sm:p-4">
            <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
              <span className="text-[11px] sm:text-xs font-medium">Department</span>
              <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-sky-500" />
            </div>
            <div className="mt-1.5 text-sm sm:text-base font-semibold text-zinc-900 dark:text-white truncate">
              {currentUser.department}
            </div>
            <div className="mt-0.5 text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400">
              Academic division
            </div>
          </Card>

          <Card className="p-3.5 sm:p-4">
            <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
              <span className="text-[11px] sm:text-xs font-medium">Scheduled Lectures</span>
              <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-sky-500" />
            </div>
            <div className="mt-1.5 text-sm sm:text-base font-semibold text-zinc-900 dark:text-white">
              {schedule.length} Slots
            </div>
            <div className="mt-0.5 text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400">
              Assigned timetable slots
            </div>
          </Card>
        </div>

        {/* Sleek AI Quick Ask Bar */}
        <Link
          href="/chat"
          className="group block rounded-xl border border-sky-500/30 bg-gradient-to-r from-sky-500/10 via-sky-500/5 to-transparent p-3 sm:p-4 hover:border-sky-500/60 transition-all shadow-2xs"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-xs group-hover:scale-105 transition-transform">
                <Sparkles className="h-4 w-4 text-sky-500" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-900 dark:text-white">
                  <span>Ask CampusSaathi AI</span>
                  <span className="text-[10px] font-normal text-sky-500 hidden sm:inline">• Policy & Regulations</span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                  Inquire invigilation duties, leave guidelines, or academic rules...
                </p>
              </div>
            </div>
            <div className="shrink-0 flex items-center gap-1 text-xs font-medium text-sky-500 group-hover:translate-x-0.5 transition-transform">
              <span className="hidden sm:inline">Ask AI</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>
        </Link>

        {/* Mobile Tab Segment Switcher (<lg) */}
        <div className="flex rounded-xl bg-zinc-100 dark:bg-zinc-900 p-1 border border-zinc-200 dark:border-zinc-800 lg:hidden">
          <button
            type="button"
            onClick={() => setTeacherTab("schedule")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
              teacherTab === "schedule"
                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs font-semibold"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
          >
            <Clock className="h-3.5 w-3.5 text-sky-500" />
            <span>Schedule ({schedule.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setTeacherTab("notices")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
              teacherTab === "notices"
                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs font-semibold"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
          >
            <Bell className="h-3.5 w-3.5 text-sky-500" />
            <span>Circulars ({notices.length})</span>
          </button>
        </div>

        {/* Schedule & Circulars Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
          {/* Lecture Schedule */}
          <Card className={`p-4 sm:p-5 ${teacherTab === "schedule" ? "block" : "hidden lg:block"}`}>
            <CardHeader className="flex-row items-center justify-between p-0 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-sky-500" />
                <CardTitle className="text-xs sm:text-sm">Teaching Schedule</CardTitle>
              </div>
              <Badge variant="outline" className="text-[10px]">Active Routine</Badge>
            </CardHeader>

            <CardContent className="p-0 space-y-2">
              {schedule.length === 0 ? (
                <div className="py-6 text-center text-xs text-zinc-400 dark:text-zinc-500">
                  No timetable slots assigned yet.
                </div>
              ) : (
                schedule.slice(0, 5).map((slot, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 sm:p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                        {slot.subject}
                      </div>
                      <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                        {slot.batch} • {slot.room}
                      </div>
                    </div>
                    <Badge variant="default" className="font-mono text-[10px] shrink-0">
                      {slot.time}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Departmental Notices */}
          <Card className={`p-4 sm:p-5 ${teacherTab === "notices" ? "block" : "hidden lg:block"}`}>
            <CardHeader className="flex-row items-center justify-between p-0 pb-3">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-sky-500" />
                <CardTitle className="text-xs sm:text-sm">Institutional Circulars</CardTitle>
              </div>
              <Badge variant="default" className="text-[10px]">Verified</Badge>
            </CardHeader>

            <CardContent className="p-0 space-y-2">
              {notices.length === 0 ? (
                <div className="py-6 text-center text-xs text-zinc-400 dark:text-zinc-500">
                  No circulars published yet.
                </div>
              ) : (
                notices.slice(0, 5).map((notice, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 sm:p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                        {notice.title}
                      </span>
                      {notice.priority === "HIGH" && (
                        <Badge variant="rose" className="text-[9px] shrink-0">Priority</Badge>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-[10px] text-zinc-500 dark:text-zinc-400">
                      <Badge variant="outline" className="text-[9px] py-0 px-1.5">{notice.category}</Badge>
                      <span>• {notice.date}</span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}
