"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  User,
  LogOut,
  Settings,
  Bell,
  Moon,
  Sun,
  ShieldCheck,
  Building,
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

interface InstitutionData {
  name: string;
  code?: string;
  tagline?: string;
  established?: string;
  logo?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [institution, setInstitution] = useState<InstitutionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadProfileData = async () => {
      try {
        const [authRes, instRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/institution/profile"),
        ]);

        const authData = await authRes.json();
        if (isMounted && authData.success) {
          const user = authData.data?.user || authData.user;
          setCurrentUser(user);
        }

        const instData = await instRes.json();
        if (isMounted && instData.success && instData.data) {
          setInstitution(instData.data);
        }
      } catch {
        // graceful empty state
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProfileData();
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
    <div className="space-y-6 max-w-3xl mx-auto pb-6">
      {/* 1. User Identity Section */}
      <Card className="p-6 sm:p-7 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold text-xl sm:text-2xl shadow-xs shrink-0 transition-colors">
            {currentUser ? getInitials(currentUser.name) : <User className="h-9 w-9" />}
          </div>

          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">
                {currentUser?.name || (loading ? "Loading..." : "User Profile")}
              </h1>
              {currentUser?.role && (
                <Badge
                  variant={
                    currentUser.role === "ADMIN"
                      ? "amber"
                      : currentUser.role === "TEACHER"
                      ? "sky"
                      : "default"
                  }
                >
                  {currentUser.role}
                </Badge>
              )}
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
              ID: {currentUser?.identifier || "—"} • Role: {currentUser?.role || "—"}
            </p>
            <p className="text-xs text-zinc-600 dark:text-zinc-300">
              Department of {currentUser?.department || "General Academics"}
            </p>
          </div>
        </div>
      </Card>

      {/* 2. Institution Section */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-sky-500" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Institution Details
            </h2>
          </div>
          <span className="text-[11px] text-zinc-400 dark:text-zinc-500">Official Campus Affiliate</span>
        </div>

        {institution ? (
          <div className="flex flex-col sm:flex-row items-center gap-5 pt-1">
            <div className="relative h-20 w-28 sm:h-24 sm:w-32 bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 p-2 flex items-center justify-center shrink-0">
              <Image
                src={institution.logo || "/branding/institute-logo.png"}
                alt={institution.name}
                width={128}
                height={96}
                className="h-full w-full object-contain"
                priority
              />
            </div>
            <div className="space-y-1 text-center sm:text-left flex-1">
              <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
                {institution.name}
              </h3>
              {institution.tagline && (
                <p className="text-xs text-sky-600 dark:text-sky-400 font-medium">
                  {institution.tagline} {institution.established && `• Estd. ${institution.established}`}
                </p>
              )}
              <p className="text-xs text-zinc-500 dark:text-zinc-400 pt-0.5">
                Department of {currentUser?.department || "Academic Affairs"}
              </p>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-zinc-400 dark:text-zinc-500 space-y-1">
            <Building className="h-6 w-6 mx-auto text-zinc-300 dark:text-zinc-600 mb-2" />
            <p>Institutional information pending synchronization.</p>
          </div>
        )}
      </Card>

      {/* 3. Account & Security Information */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-5 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
            <User className="h-4 w-4 text-sky-500" />
            Account Credentials
          </h2>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1.5 border-b border-zinc-200 dark:border-zinc-800">
              <span className="text-zinc-500 dark:text-zinc-400">Official ID</span>
              <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                {currentUser?.identifier || "—"}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-zinc-200 dark:border-zinc-800">
              <span className="text-zinc-500 dark:text-zinc-400">Department</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                {currentUser?.department || "—"}
              </span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-zinc-500 dark:text-zinc-400">Assigned Role</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                {currentUser?.role || "—"}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-5 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-sky-500" />
            Security & Session
          </h2>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1.5 border-b border-zinc-200 dark:border-zinc-800">
              <span className="text-zinc-500 dark:text-zinc-400">Official Email</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate max-w-[180px]">
                {currentUser?.email || "—"}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-zinc-200 dark:border-zinc-800">
              <span className="text-zinc-500 dark:text-zinc-400">Session Security</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-sky-500" />
                Stateless JWT (HMAC-SHA256)
              </span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-zinc-500 dark:text-zinc-400">Access Control</span>
              <Badge variant="sky" className="text-[10px]">Server Enforced RBAC</Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* 4. Appearance & Application Preferences */}
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
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Active</span>
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
              className="text-[11px] font-semibold text-sky-500 hover:text-sky-600 transition-colors px-2.5 py-1 rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900"
            >
              {theme === "dark" ? "Dark Mode (Switch to Light)" : "Light Mode (Switch to Dark)"}
            </button>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
              <ShieldCheck className="h-4 w-4 text-zinc-400" />
              <span>Application Product</span>
            </div>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
              CampusSaathi
            </span>
          </div>
        </div>

        <div className="pt-2">
          <Button
            type="button"
            variant="danger"
            onClick={handleLogout}
            className="w-full min-h-[44px] font-semibold text-xs justify-center"
          >
            <LogOut className="h-4 w-4 mr-1.5" />
            <span>Sign Out of CampusSaathi</span>
          </Button>
        </div>
      </Card>
    </div>
  );
}
