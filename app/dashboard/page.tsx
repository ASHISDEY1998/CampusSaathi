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
import { Button } from "@/components/ui/Button";

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
      <div className="space-y-6 max-w-5xl mx-auto pb-6">
        {/* Welcome Header */}
        <div className="rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 p-5 sm:p-7 shadow-xs transition-colors">
          <div className="flex flex-wrap items-center gap-2 mb-2.5">
            <Badge variant="default" className="font-mono text-[11px]">
              {currentUser.identifier}
            </Badge>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              Department of {currentUser.department} {year && semester ? `• Year ${year} (Sem ${semester})` : ""}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Welcome, {currentUser.name}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-xl leading-relaxed">
            Your consolidated academic hub: course schedule, internal marks, and campus helpdesk.
          </p>
        </div>

        {/* Academic Overview Metrics */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-sky-500" />
              Academic Overview
            </h2>
            {semester && <span className="text-[11px] text-zinc-400 font-mono">Semester {semester}</span>}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* CGPA */}
            <Card className="p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
                <span className="text-xs font-medium">Cumulative CGPA</span>
                <Award className="h-4 w-4 text-sky-500" />
              </div>
              <div className="mt-3">
                <div className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
                  {typeof cgpa === "number" ? cgpa.toFixed(2) : "—"}
                </div>
                <div className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                  {typeof cgpa === "number" ? "Official record" : "Pending database sync"}
                </div>
              </div>
            </Card>

            {/* Attendance (Real state - no fake data) */}
            <Card className="p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
                <span className="text-xs font-medium">Attendance</span>
                <Clock className="h-4 w-4 text-sky-500" />
              </div>
              <div className="mt-3">
                <div className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
                  —
                </div>
                <div className="mt-1 text-[11px] text-zinc-400 dark:text-zinc-500">
                  Pending attendance sync
                </div>
              </div>
            </Card>

            {/* Timetable Status */}
            <Card className="p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
                <span className="text-xs font-medium">Weekly Routine</span>
                <Calendar className="h-4 w-4 text-sky-500" />
              </div>
              <div className="mt-3">
                <div className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-white">
                  {studentData?.timetables?.length ? `${studentData.timetables.length} Schedules` : "Not Published"}
                </div>
                <div className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                  {studentData?.timetables?.length ? "Routine synced" : "Awaiting department"}
                </div>
              </div>
            </Card>

            {/* Helpdesk Tickets */}
            <Card className="p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
                <span className="text-xs font-medium">My Tickets</span>
                <LifeBuoy className="h-4 w-4 text-sky-500" />
              </div>
              <div className="mt-3">
                <div className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
                  {studentData?.tickets?.length || 0}
                </div>
                <Link
                  href="/tickets"
                  className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-sky-500 hover:text-sky-600 transition-colors"
                >
                  View helpdesk &rarr;
                </Link>
              </div>
            </Card>
          </div>
        </div>

        {/* AI Assistant Banner */}
        <Card className="p-5 sm:p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-600 dark:text-sky-400">
                <Sparkles className="h-4 w-4" />
                Intelligent Campus Companion
              </div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
                Have questions regarding academic circulars or campus policies?
              </h3>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-xl leading-relaxed">
                CampusSaathi connects directly with institutional knowledge to assist with your day-to-day queries.
              </p>
            </div>

            <Link href="/chat">
              <Button variant="sky" size="md" className="shrink-0 w-full sm:w-auto">
                <Sparkles className="h-4 w-4" />
                <span>Ask CampusSaathi</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Card>

        {/* Real Marks & Campus Circulars */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Academic Marks */}
          <Card className="p-5">
            <CardHeader className="flex-row items-center justify-between p-0 pb-3">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-sky-500" />
                <CardTitle className="text-sm">Course Marks</CardTitle>
              </div>
              <Badge variant="outline" className="text-[10px]">Academic Record</Badge>
            </CardHeader>

            <CardContent className="p-0 space-y-2.5">
              {marks.length === 0 ? (
                <div className="py-6 text-center text-xs text-zinc-400 dark:text-zinc-500">
                  No academic records available yet.
                </div>
              ) : (
                marks.slice(0, 5).map((m, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/80"
                  >
                    <div>
                      <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        {m.subjectName}
                      </div>
                      <div className="text-[11px] text-zinc-500 font-mono">
                        {m.subjectCode} • Sem {m.semester}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-zinc-900 dark:text-white">
                        {m.totalMarks} / 100
                      </div>
                      <Badge variant="sky" className="text-[10px] py-0 px-1.5">
                        Grade {m.grade}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Campus Notices & Circulars */}
          <Card className="p-5">
            <CardHeader className="flex-row items-center justify-between p-0 pb-3">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-sky-500" />
                <CardTitle className="text-sm">Institutional Circulars</CardTitle>
              </div>
              <Badge variant="default" className="text-[10px]">Official</Badge>
            </CardHeader>

            <CardContent className="p-0 space-y-2.5">
              {notices.length === 0 ? (
                <div className="py-6 text-center text-xs text-zinc-400 dark:text-zinc-500">
                  No institutional circulars published yet.
                </div>
              ) : (
                notices.slice(0, 5).map((notice, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        {notice.title}
                      </span>
                      {notice.priority === "HIGH" && (
                        <Badge variant="rose" className="text-[9px]">Priority</Badge>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                      <Badge variant="outline" className="text-[10px] py-0 px-1.5">{notice.category}</Badge>
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
      <div className="space-y-6 max-w-5xl mx-auto pb-6">
        {/* Welcome Header */}
        <div className="rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 p-5 sm:p-7 shadow-xs transition-colors">
          <div className="flex flex-wrap items-center gap-2 mb-2.5">
            <Badge variant="sky" className="font-mono text-[11px]">
              {currentUser.identifier}
            </Badge>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              Department of {currentUser.department} • {designation}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Faculty Academic Console
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-xl leading-relaxed">
            Welcome, {currentUser.name}. Manage your assigned lecture schedule and review departmental resources.
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
              <span className="text-xs font-medium">Assigned Cabin</span>
              <Briefcase className="h-4 w-4 text-sky-500" />
            </div>
            <div className="mt-2 text-base font-semibold text-zinc-900 dark:text-white truncate">
              {cabin}
            </div>
            <div className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
              Official faculty workspace
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
              <span className="text-xs font-medium">Department</span>
              <BookOpen className="h-4 w-4 text-sky-500" />
            </div>
            <div className="mt-2 text-base font-semibold text-zinc-900 dark:text-white truncate">
              {currentUser.department}
            </div>
            <div className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
              Academic division
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
              <span className="text-xs font-medium">Scheduled Lectures</span>
              <Calendar className="h-4 w-4 text-sky-500" />
            </div>
            <div className="mt-2 text-base font-semibold text-zinc-900 dark:text-white">
              {schedule.length} Slots
            </div>
            <div className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
              Assigned timetable slots
            </div>
          </Card>
        </div>

        {/* Schedule & Circulars */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Lecture Schedule */}
          <Card className="p-5">
            <CardHeader className="flex-row items-center justify-between p-0 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-sky-500" />
                <CardTitle className="text-sm">Teaching Schedule</CardTitle>
              </div>
              <Badge variant="outline" className="text-[10px]">Active Routine</Badge>
            </CardHeader>

            <CardContent className="p-0 space-y-2.5">
              {schedule.length === 0 ? (
                <div className="py-6 text-center text-xs text-zinc-400 dark:text-zinc-500">
                  No timetable slots assigned yet.
                </div>
              ) : (
                schedule.slice(0, 5).map((slot, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        {slot.subject}
                      </div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        {slot.batch} • {slot.room}
                      </div>
                    </div>
                    <Badge variant="default" className="font-mono text-[10px]">
                      {slot.time}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Departmental Notices */}
          <Card className="p-5">
            <CardHeader className="flex-row items-center justify-between p-0 pb-3">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-sky-500" />
                <CardTitle className="text-sm">Institutional Circulars</CardTitle>
              </div>
              <Badge variant="default" className="text-[10px]">Official</Badge>
            </CardHeader>

            <CardContent className="p-0 space-y-2.5">
              {notices.length === 0 ? (
                <div className="py-6 text-center text-xs text-zinc-400 dark:text-zinc-500">
                  No circulars published yet.
                </div>
              ) : (
                notices.slice(0, 5).map((notice, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/80"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        {notice.title}
                      </span>
                      {notice.priority === "HIGH" && (
                        <Badge variant="rose" className="text-[9px]">Priority</Badge>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                      <Badge variant="outline" className="text-[10px] py-0 px-1.5">{notice.category}</Badge>
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
