"use client";

import { useState } from "react";
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
  GraduationCap,
  UserCheck,
  Bell,
  Layers,
  Activity,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function DashboardPage() {
  const [activeRole, setActiveRole] = useState<"STUDENT" | "TEACHER">("STUDENT");

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-4">
      {/* Stage 1 Status & Role Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-900/60 border border-slate-800 p-3.5">
        <div className="flex items-center gap-2">
          <Badge variant="cyan">Stage 1 UI Shell</Badge>
          <span className="text-xs text-slate-400">
            Previewing:{" "}
            <strong className="text-slate-200">
              {activeRole === "STUDENT" ? "Student Dashboard" : "Faculty Dashboard"}
            </strong>
          </span>
        </div>

        <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeRole === "STUDENT"}
            onClick={() => setActiveRole("STUDENT")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all min-h-[38px] flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
              activeRole === "STUDENT"
                ? "bg-indigo-600 text-white font-semibold shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <GraduationCap className="h-3.5 w-3.5" />
            Student View
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeRole === "TEACHER"}
            onClick={() => setActiveRole("TEACHER")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all min-h-[38px] flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
              activeRole === "TEACHER"
                ? "bg-indigo-600 text-white font-semibold shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <UserCheck className="h-3.5 w-3.5" />
            Teacher View
          </button>
        </div>
      </div>

      {activeRole === "STUDENT" ? (
        /* ================= STUDENT DASHBOARD ================= */
        <div className="space-y-6">
          {/* Section 1: Welcome Header */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 border border-indigo-500/30 p-5 sm:p-7 shadow-xl">
            <div className="relative z-10">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge variant="indigo">Example Student Persona</Badge>
                <span className="text-xs text-slate-400">B.Tech Computer Science • Sem 6</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Welcome to CampusSaathi!
              </h1>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                This is the exhibition dashboard prototype. In Stage 2 & 3, real student academic standing, internal marks, and class schedules will populate dynamically from MongoDB.
              </p>
            </div>
            <div className="absolute -right-8 -bottom-8 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" aria-hidden="true"></div>
          </div>

          {/* Section 2: Academic Overview (Placeholder Cards) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-cyan-400" />
                Academic Overview (Preview Structure)
              </h2>
              <span className="text-[11px] text-slate-500 font-mono">Sample Metrics</span>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* CGPA */}
              <Card className="p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-semibold">Cumulative CGPA</span>
                  <Award className="h-4 w-4 text-cyan-400" />
                </div>
                <div className="mt-3">
                  <div className="text-2xl sm:text-3xl font-extrabold text-white">
                    8.84
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                    <TrendingUp className="h-3 w-3" />
                    Top 5% in Department
                  </div>
                </div>
              </Card>

              {/* Attendance */}
              <Card className="p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-semibold">Attendance Rate</span>
                  <Clock className="h-4 w-4 text-indigo-400" />
                </div>
                <div className="mt-3">
                  <div className="text-2xl sm:text-3xl font-extrabold text-white">
                    89.2%
                  </div>
                  <div className="mt-1 text-[11px] font-medium text-emerald-400">
                    Above 75% requirement
                  </div>
                </div>
              </Card>

              {/* Next Exam */}
              <Card className="p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-semibold">Upcoming Exam</span>
                  <Calendar className="h-4 w-4 text-amber-400" />
                </div>
                <div className="mt-3">
                  <div className="text-sm sm:text-base font-bold text-white truncate">
                    Mid-Term Series
                  </div>
                  <div className="mt-1 text-[11px] font-medium text-amber-300 truncate">
                    Schedule via RAG
                  </div>
                </div>
              </Card>

              {/* Helpdesk Queries */}
              <Card className="p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-semibold">Open Complaints</span>
                  <LifeBuoy className="h-4 w-4 text-rose-400" />
                </div>
                <div className="mt-3">
                  <div className="text-2xl sm:text-3xl font-extrabold text-white">
                    1 Active
                  </div>
                  <Link
                    href="/tickets"
                    className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-cyan-400 hover:underline"
                  >
                    View tickets <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              </Card>
            </div>
          </div>

          {/* Section 3: Quick AI Access Hero */}
          <Card className="p-5 sm:p-6 border-cyan-500/40 bg-gradient-to-r from-indigo-950/80 via-slate-900 to-slate-900 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
              <div className="space-y-1.5">
                <Badge variant="cyan" className="gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                  Intelligent College Assistant
                </Badge>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Need information about marks, timetable, or regulations?
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 max-w-lg leading-relaxed">
                  CampusSaathi handles academic queries with zero hallucination and automatic source citations.
                </p>
              </div>

              <Link href="/chat">
                <Button variant="primary" size="md" className="shrink-0 w-full sm:w-auto">
                  <Sparkles className="h-4 w-4" />
                  <span>Launch AI Assistant</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </Card>

          {/* Section 4 & 5: Recent Activity + Notices / Services */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Recent Activity Card */}
            <Card className="p-5">
              <CardHeader className="flex-row items-center justify-between p-0 pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-cyan-400" />
                  <CardTitle className="text-sm">Recent Activity</CardTitle>
                </div>
                <Badge variant="outline" className="text-[10px]">Audit Trail</Badge>
              </CardHeader>

              <CardContent className="p-0 space-y-3">
                {[
                  {
                    title: "Class Schedule Checked",
                    desc: "Viewed timetable for Monday CSE-A lectures",
                    time: "10 mins ago",
                    icon: Calendar,
                  },
                  {
                    title: "Helpdesk Ticket Logged",
                    desc: "Issue CS-TKT-1042 registered: Lab 301 Projector",
                    time: "2 hours ago",
                    icon: LifeBuoy,
                  },
                  {
                    title: "Library Policy Inquired",
                    desc: "Asked AI about book return fine rates",
                    time: "Yesterday",
                    icon: Sparkles,
                  },
                ].map((act, idx) => {
                  const Icon = act.icon;
                  return (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80"
                    >
                      <div className="h-7 w-7 rounded-lg bg-indigo-950 border border-indigo-500/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-slate-200">
                          {act.title}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {act.desc}
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500 shrink-0 font-mono">
                        {act.time}
                      </span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Notices / Services Card */}
            <Card className="p-5">
              <CardHeader className="flex-row items-center justify-between p-0 pb-3">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-cyan-400" />
                  <CardTitle className="text-sm">Campus Notices & Circulars</CardTitle>
                </div>
                <Badge variant="amber" className="text-[10px]">Updates</Badge>
              </CardHeader>

              <CardContent className="p-0 space-y-3">
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
                    category: "Services",
                    date: "Ongoing",
                    isHigh: false,
                  },
                ].map((notice, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200">
                        {notice.title}
                      </span>
                      {notice.isHigh && (
                        <Badge variant="rose" className="text-[9px]">Priority</Badge>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
                      <Badge variant="outline" className="text-[10px] py-0 px-1.5">{notice.category}</Badge>
                      <span>• {notice.date}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* ================= TEACHER DASHBOARD ================= */
        <div className="space-y-6">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 border border-indigo-500/30 p-5 sm:p-7 shadow-xl">
            <Badge variant="indigo" className="mb-2">Example Faculty Persona</Badge>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Faculty Dashboard Preview
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-xl">
              In Stage 3 & 4, teachers will view assigned lecture batches, manage student attendance records, and inspect departmental equipment tickets.
            </p>
          </div>

          <Card className="p-5">
            <CardTitle className="text-sm mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-cyan-400" />
              Example Teaching Schedule (Schema Representation)
            </CardTitle>
            <div className="space-y-3">
              {[
                { time: "10:30 AM - 11:30 AM", batch: "CSE 3rd Year (Sem 6)", subject: "Database Management Systems", room: "Room 204" },
                { time: "01:30 PM - 03:30 PM", batch: "CSE 3rd Year (Batch B)", subject: "Advanced Database Lab", room: "Lab 2" },
              ].map((slot, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-200">{slot.subject}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{slot.batch} • {slot.room}</div>
                  </div>
                  <Badge variant="cyan">{slot.time}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
