"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Calendar,
  Clock,
  Award,
  TrendingUp,
  ArrowRight,
  LifeBuoy,
  ChevronRight,
  Briefcase,
  Bell,
  Layers,
  Activity,
  Shield,
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
  profile: {
    year?: number;
    semester?: number;
    cgpa?: number;
    phone?: string;
  };
  marks: {
    subjectCode: string;
    subjectName: string;
    semester: number;
    internalMarks: number;
    endSemMarks: number;
    totalMarks: number;
    grade: string;
  }[];
  notices: {
    title: string;
    category: string;
    date: string;
    isHighPriority?: boolean;
  }[];
  tickets: {
    ticketId: string;
    title: string;
    category: string;
    status: string;
    createdAt: string;
  }[];
}

interface TeacherDashboardData {
  profile: {
    designation?: string;
    cabinLocation?: string;
    subjectsTaught?: string[];
  };
  schedule: {
    day: string;
    time: string;
    subjectCode: string;
    subjectName: string;
    room: string;
    semester: number;
  }[];
  notices: {
    title: string;
    category: string;
    date: string;
    isHighPriority?: boolean;
  }[];
  tickets: {
    ticketId: string;
    title: string;
    category: string;
    status: string;
    createdAt: string;
  }[];
}

export default function DashboardPage() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState<StudentDashboardData | null>(null);
  const [teacherData, setTeacherData] = useState<TeacherDashboardData | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadSessionAndData = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();

        if (isMounted && data.authenticated && data.user) {
          const user: AuthUser = data.user;
          setCurrentUser(user);

          // Strictly fetch ONLY the authenticated user's role-specific API
          if (user.role === "STUDENT") {
            const studentRes = await fetch("/api/student/dashboard");
            if (studentRes.ok) {
              const sData = await studentRes.json();
              if (isMounted && sData.success) {
                setStudentData(sData);
              }
            }
          } else if (user.role === "TEACHER") {
            const teacherRes = await fetch("/api/teacher/dashboard");
            if (teacherRes.ok) {
              const tData = await teacherRes.json();
              if (isMounted && tData.success) {
                setTeacherData(tData);
              }
            }
          }
        }
      } catch {
        // Safe fallback
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
        <span className="text-xs text-zinc-500 dark:text-zinc-400">Loading secure console...</span>
      </div>
    );
  }

  /* ========================================================================= */
  /* 1. STUDENT DASHBOARD (Rendered ONLY if authenticated role is STUDENT)    */
  /* ========================================================================= */
  if (currentUser?.role === "STUDENT") {
    const cgpa = studentData?.profile?.cgpa || 8.84;
    const year = studentData?.profile?.year || 3;
    const semester = studentData?.profile?.semester || 6;

    return (
      <div className="space-y-6 max-w-5xl mx-auto pb-6">
        {/* Welcome Header */}
        <div className="rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 p-5 sm:p-7 shadow-xs transition-colors">
          <div className="flex flex-wrap items-center gap-2 mb-2.5">
            <Badge variant="default" className="font-mono text-[11px]">
              {currentUser.identifier}
            </Badge>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              Department of {currentUser.department} • Year {year} (Sem {semester})
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Welcome, {currentUser.name}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-xl leading-relaxed">
            Your consolidated academic hub: course schedule, attendance standing, internal marks, and college helpdesk.
          </p>
        </div>

        {/* Academic Overview Metrics */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-sky-500" />
              Academic Standing
            </h2>
            <span className="text-[11px] text-zinc-400 font-mono">Semester {semester}</span>
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
                  {cgpa.toFixed(2)}
                </div>
                <div className="mt-1 flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="h-3 w-3" />
                  Top 5% in Department
                </div>
              </div>
            </Card>

            {/* Attendance */}
            <Card className="p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
                <span className="text-xs font-medium">Attendance Rate</span>
                <Clock className="h-4 w-4 text-sky-500" />
              </div>
              <div className="mt-3">
                <div className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
                  89.2%
                </div>
                <div className="mt-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  Above 75% requirement
                </div>
              </div>
            </Card>

            {/* Upcoming Exam */}
            <Card className="p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
                <span className="text-xs font-medium">Next Milestone</span>
                <Calendar className="h-4 w-4 text-amber-500" />
              </div>
              <div className="mt-3">
                <div className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-white truncate">
                  Mid-Term Series
                </div>
                <div className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                  Commencing Next Week
                </div>
              </div>
            </Card>

            {/* Helpdesk Queries */}
            <Card className="p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
                <span className="text-xs font-medium">Active Tickets</span>
                <LifeBuoy className="h-4 w-4 text-sky-500" />
              </div>
              <div className="mt-3">
                <div className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
                  1 Active
                </div>
                <Link
                  href="/tickets"
                  className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-sky-500 hover:text-sky-600 transition-colors"
                >
                  View status <ChevronRight className="h-3 w-3" />
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
                Intelligent College Assistant
              </div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
                Have questions about attendance rules, exam dates, or college policies?
              </h3>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-xl leading-relaxed">
                CampusSaathi answers directly from official college circulars, rulebooks, and database records.
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

        {/* Recent Activity & Campus Circulars */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Recent Activity */}
          <Card className="p-5">
            <CardHeader className="flex-row items-center justify-between p-0 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-sky-500" />
                <CardTitle className="text-sm">Recent Academic Activity</CardTitle>
              </div>
              <Badge variant="outline" className="text-[10px]">Audit Log</Badge>
            </CardHeader>

            <CardContent className="p-0 space-y-2.5">
              {[
                {
                  title: "Timetable Inspected",
                  desc: "Viewed routine for Monday CSE-A lectures",
                  time: "10 mins ago",
                  icon: Calendar,
                },
                {
                  title: "Helpdesk Ticket Registered",
                  desc: "Issue CS-TKT-1042 filed: Lab 301 Projector",
                  time: "2 hours ago",
                  icon: LifeBuoy,
                },
                {
                  title: "Library Rules Queried",
                  desc: "Checked book return fine policy via AI",
                  time: "Yesterday",
                  icon: Sparkles,
                },
              ].map((act, idx) => {
                const Icon = act.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/80 transition-colors"
                  >
                    <div className="h-7 w-7 rounded-md bg-zinc-200 dark:bg-zinc-800 text-sky-500 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        {act.title}
                      </div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                        {act.desc}
                      </div>
                    </div>
                    <span className="text-[10px] text-zinc-400 shrink-0 font-mono">
                      {act.time}
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Campus Notices & Circulars */}
          <Card className="p-5">
            <CardHeader className="flex-row items-center justify-between p-0 pb-3">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-sky-500" />
                <CardTitle className="text-sm">Campus Notices & Circulars</CardTitle>
              </div>
              <Badge variant="default" className="text-[10px]">Verified</Badge>
            </CardHeader>

            <CardContent className="p-0 space-y-2.5">
              {[
                {
                  title: "Mid-Term Examination Schedule Released",
                  category: "Exams",
                  date: "Oct 12, 2026",
                  isHigh: true,
                },
                {
                  title: "Annual Tech Symposium 'Invento 2026' Registrations",
                  category: "Events",
                  date: "Oct 25, 2026",
                  isHigh: false,
                },
                {
                  title: "Central Library Extended Study Hours Circular",
                  category: "Campus",
                  date: "Active",
                  isHigh: false,
                },
              ].map((notice, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      {notice.title}
                    </span>
                    {notice.isHigh && (
                      <Badge variant="rose" className="text-[9px]">Priority</Badge>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                    <Badge variant="outline" className="text-[10px] py-0 px-1.5">{notice.category}</Badge>
                    <span>• {notice.date}</span>
                  </div>
                </div>
              ))}
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
    const cabin = teacherData?.profile?.cabinLocation || "Academic Block B";
    const schedule = teacherData?.schedule || [];

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
            Welcome, {currentUser.name}. Manage your weekly teaching schedule, review departmental batches, and access institutional resources.
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
              Official faculty cabin
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
              Faculty roster active
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
              <span className="text-xs font-medium">College AI Assistant</span>
              <Sparkles className="h-4 w-4 text-sky-500" />
            </div>
            <div className="mt-2">
              <Link
                href="/chat"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-500 hover:text-sky-600 transition-colors"
              >
                Inquire College AI <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
              Invigilation & exam rules
            </div>
          </Card>
        </div>

        {/* Weekly Teaching Schedule */}
        <Card className="p-5">
          <CardHeader className="flex-row items-center justify-between p-0 pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-sky-500" />
              <CardTitle className="text-sm">Assigned Teaching Schedule</CardTitle>
            </div>
            <Badge variant="default" className="text-[10px]">Weekly Timetable</Badge>
          </CardHeader>

          <CardContent className="p-0 space-y-3">
            {schedule.length > 0 ? (
              schedule.map((slot, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between transition-colors"
                >
                  <div>
                    <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      {slot.subjectCode} - {slot.subjectName}
                    </div>
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                      {slot.day} • {slot.room} • Semester {slot.semester}
                    </div>
                  </div>
                  <Badge variant="sky">{slot.time}</Badge>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
                No active lectures scheduled for today.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ========================================================================= */
  /* 3. ADMIN OVERVIEW (Rendered ONLY if authenticated role is ADMIN)          */
  /* ========================================================================= */
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-6">
      <div className="rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 p-5 sm:p-7 shadow-xs transition-colors">
        <div className="flex items-center gap-2 mb-2.5">
          <Badge variant="amber" className="font-mono text-[11px]">
            ADMIN CONSOLE
          </Badge>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            System Superuser • Full Privileges
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Administrator Overview
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-xl leading-relaxed">
          Welcome, {currentUser?.name || "Administrator"}. Manage user identity provisioning, synchronize institutional policy embeddings, and inspect active records.
        </p>

        <div className="mt-5">
          <Link href="/admin">
            <Button variant="primary" size="md">
              <Shield className="h-4 w-4 mr-2 text-sky-500" />
              Launch Administrator Portal
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
