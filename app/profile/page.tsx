"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  GraduationCap,
  Building2,
  LogOut,
  Settings,
  Bell,
  Moon,
  Sun,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/components/theme/ThemeProvider";

interface AuthUser {
  identifier: string;
  name: string;
  role: "STUDENT" | "TEACHER" | "ADMIN";
  email: string;
  department: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadSession = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (isMounted && data.authenticated && data.user) {
          setCurrentUser(data.user);
        }
      } catch {
        // ignore
      }
    };
    loadSession();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "CS";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-4">
      {/* Profile Header Card */}
      <Card className="p-6 sm:p-7 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold text-xl sm:text-2xl shadow-xs shrink-0 transition-colors">
            {currentUser ? getInitials(currentUser.name) : <User className="h-9 w-9" />}
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">
                {currentUser?.name || "User Profile"}
              </h1>
              <Badge
                variant={
                  currentUser?.role === "ADMIN"
                    ? "amber"
                    : currentUser?.role === "TEACHER"
                    ? "sky"
                    : "default"
                }
              >
                {currentUser?.role || "STUDENT"}
              </Badge>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
              Identifier: {currentUser?.identifier || "—"} • Role: {currentUser?.role || "Student"}
            </p>
            <p className="text-xs text-zinc-600 dark:text-zinc-300">
              Department of {currentUser?.department || "Computer Science & Engineering"} • ABC Institute of Technology
            </p>
          </div>
        </div>
      </Card>

      {/* Account Information */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Academic Details */}
        <Card className="p-5 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
            <GraduationCap className="h-4 w-4 text-sky-500" />
            Academic Information
          </h2>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1.5 border-b border-zinc-200 dark:border-zinc-800">
              <span className="text-zinc-500 dark:text-zinc-400">Department</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                {currentUser?.department || "Computer Science & Engineering"}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-zinc-200 dark:border-zinc-800">
              <span className="text-zinc-500 dark:text-zinc-400">Institution</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">ABC Institute of Technology</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-zinc-200 dark:border-zinc-800">
              <span className="text-zinc-500 dark:text-zinc-400">Affiliation</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">State Technical University</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-zinc-500 dark:text-zinc-400">Database Status</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Verified & Synced
              </span>
            </div>
          </div>
        </Card>

        {/* Security & Session */}
        <Card className="p-5 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
            <Building2 className="h-4 w-4 text-sky-500" />
            Security & Session
          </h2>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1.5 border-b border-zinc-200 dark:border-zinc-800">
              <span className="text-zinc-500 dark:text-zinc-400">Official Email</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate max-w-[180px]">
                {currentUser?.email || "student@abctech.edu.in"}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-zinc-200 dark:border-zinc-800">
              <span className="text-zinc-500 dark:text-zinc-400">Session Security</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-sky-500" />
                Stateless JWT (HMAC-SHA256)
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-zinc-200 dark:border-zinc-800">
              <span className="text-zinc-500 dark:text-zinc-400">Access Control</span>
              <Badge variant="sky" className="text-[10px]">Strict RBAC</Badge>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-zinc-500 dark:text-zinc-400">Environment</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">Production Cloud</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Preferences & Settings */}
      <Card className="p-5 space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
          <Settings className="h-4 w-4 text-sky-500" />
          Application Preferences
        </h2>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between py-2 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
              <Bell className="h-4 w-4 text-zinc-400" />
              <span>Campus Circular Notifications</span>
            </div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Enabled</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
              {theme === "dark" ? (
                <Moon className="h-4 w-4 text-zinc-400" />
              ) : (
                <Sun className="h-4 w-4 text-zinc-400" />
              )}
              <span>Theme Appearance</span>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="text-[11px] font-semibold text-sky-500 hover:text-sky-600 transition-colors px-2 py-1 rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900"
            >
              {theme === "dark" ? "Dark Mode (Switch to Light)" : "Light Mode (Switch to Dark)"}
            </button>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
              <ShieldCheck className="h-4 w-4 text-zinc-400" />
              <span>Role Authorization</span>
            </div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Server Enforced</span>
          </div>
        </div>

        <div className="pt-2">
          <Button
            type="button"
            variant="danger"
            onClick={handleLogout}
            className="w-full min-h-[44px] font-semibold text-xs"
          >
            <LogOut className="h-4 w-4 mr-1.5" />
            <span>Sign Out of CampusSaathi</span>
          </Button>
        </div>
      </Card>
    </div>
  );
}
