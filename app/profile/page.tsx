"use client";

import Link from "next/link";
import {
  User,
  GraduationCap,
  Building2,
  LogOut,
  Settings,
  Bell,
  Moon,
  Lock,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function ProfilePage() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-4">
      {/* Profile Header Card */}
      <Card className="p-6 sm:p-7 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-cyan-400 text-white font-extrabold text-xl sm:text-2xl shadow-xl shadow-cyan-500/20 shrink-0">
            <User className="h-9 w-9" />
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                Demo Student Account
              </h1>
              <Badge variant="cyan">Stage 1 Profile</Badge>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Identifier: STU2024CSE012 • Role: Student
            </p>
            <p className="text-xs text-slate-300">
              Department of Computer Science & Engineering • 3rd Year
            </p>
          </div>
        </div>
      </Card>

      {/* Account Information Placeholders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Academic Details */}
        <Card className="p-5 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <GraduationCap className="h-4 w-4 text-cyan-400" />
            Academic Information
          </h2>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">Department</span>
              <span className="font-semibold text-slate-200">Computer Science</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">Academic Standing</span>
              <span className="font-semibold text-slate-200">3rd Year (Sem 6)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">Institution</span>
              <span className="font-semibold text-slate-200">ABC Institute of Tech</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400">Database Status</span>
              <span className="font-semibold text-amber-400 flex items-center gap-1">
                Scheduled for Stage 2
              </span>
            </div>
          </div>
        </Card>

        {/* Account Details */}
        <Card className="p-5 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Building2 className="h-4 w-4 text-cyan-400" />
            Account Information
          </h2>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">Demo Email</span>
              <span className="font-semibold text-slate-200 truncate max-w-[180px]">
                student.demo@abctech.edu.in
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">Session Security</span>
              <span className="font-semibold text-slate-200">Stateless JWT (Stage 3)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">PWA Manifest</span>
              <Badge variant="emerald" className="text-[10px]">Configured</Badge>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400">Environment</span>
              <span className="font-semibold text-cyan-300">Local Development</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Settings Rows */}
      <Card className="p-5 space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Settings className="h-4 w-4 text-cyan-400" />
          Application Settings (Placeholder Rows)
        </h2>

        <div className="divide-y divide-slate-800 text-xs">
          {/* Theme Row */}
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300">
                <Moon className="h-4 w-4 text-cyan-400" />
              </div>
              <div>
                <div className="font-semibold text-slate-200">Color Appearance</div>
                <div className="text-slate-400 text-[11px]">Deep Indigo & Slate Dark Mode (Default)</div>
              </div>
            </div>
            <Badge variant="outline">Dark Mode Active</Badge>
          </div>

          {/* Notifications Row */}
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300">
                <Bell className="h-4 w-4 text-indigo-400" />
              </div>
              <div>
                <div className="font-semibold text-slate-200">Campus Circular Alerts</div>
                <div className="text-slate-400 text-[11px]">Receive push updates for exam schedules</div>
              </div>
            </div>
            <Badge variant="outline">UI Placeholder</Badge>
          </div>

          {/* Privacy & Caching Row */}
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300">
                <Lock className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <div className="font-semibold text-slate-200">Data Privacy & Security</div>
                <div className="text-slate-400 text-[11px]">Private marks are never cached by Service Worker</div>
              </div>
            </div>
            <Badge variant="emerald">Protected</Badge>
          </div>
        </div>
      </Card>

      {/* Sign In / Sign Out Navigation */}
      <div className="pt-2">
        <Link href="/login" className="block">
          <Button
            variant="outline"
            className="w-full text-rose-400 hover:text-rose-300 border-slate-800 hover:border-rose-900/50"
          >
            <LogOut className="h-4 w-4 mr-2" />
            <span>Switch to Login Screen</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
