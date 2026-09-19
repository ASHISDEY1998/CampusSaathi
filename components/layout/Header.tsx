"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  GraduationCap,
  Sparkles,
  User,
  Shield,
  LogOut,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface AuthUser {
  identifier: string;
  name: string;
  role: "STUDENT" | "TEACHER" | "ADMIN";
  email: string;
  department: string;
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    let isMounted = true;
    const checkAuth = async () => {
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
    checkAuth();
    return () => {
      isMounted = false;
    };
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setCurrentUser(null);
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
    }
  };

  // Hide header on login page
  if (pathname === "/login") {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link
          href={currentUser?.role === "ADMIN" ? "/admin" : "/dashboard"}
          className="flex items-center gap-2.5 transition-opacity hover:opacity-90 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-xl"
          aria-label="CampusSaathi Home"
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 border border-indigo-500/30 shadow-lg shadow-indigo-950/50">
            <GraduationCap className="h-5 w-5 text-indigo-400" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-extrabold tracking-tight text-white flex items-center gap-1.5">
              Campus<span className="text-cyan-400">Saathi</span>
            </span>
            <span className="hidden sm:inline-block text-[10px] font-medium text-slate-400 -mt-0.5 tracking-wide">
              Your Intelligent College Companion
            </span>
          </div>
        </Link>

        {/* Right Side Status & User Session Controls */}
        <div className="flex items-center gap-2.5">
          {/* Admin Portal Shortcut */}
          <Link
            href="/admin"
            className="flex items-center gap-1.5 rounded-full bg-indigo-950/80 hover:bg-indigo-900/90 border border-indigo-500/40 px-2.5 py-1 text-[11px] font-semibold text-cyan-300 transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
            aria-label="Admin Portal"
          >
            <Shield className="h-3 w-3 text-cyan-400" />
            <span>Admin</span>
          </Link>

          {/* AI Status Indicator */}
          <div className="flex items-center gap-1.5 rounded-full bg-slate-900/90 px-2.5 py-1 text-[11px] font-medium text-slate-300 border border-slate-800 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true"></span>
            <span className="text-slate-400 hidden xs:inline">AI</span>
            <span className="text-emerald-400 font-semibold">Ready</span>
          </div>

          {/* Authenticated User Badge */}
          {currentUser ? (
            <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 py-1 pl-2.5 pr-1.5 text-xs text-slate-200">
              <Badge
                variant={
                  currentUser.role === "ADMIN"
                    ? "amber"
                    : currentUser.role === "TEACHER"
                    ? "cyan"
                    : "indigo"
                }
                className="text-[10px] py-0 px-1.5"
              >
                {currentUser.role}
              </Badge>
              <span className="font-semibold text-slate-100 max-w-[120px] truncate">
                {currentUser.name}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="ml-1 p-1 rounded-full text-slate-400 hover:text-rose-400 hover:bg-rose-950/50 transition-colors"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <Badge variant="indigo" className="hidden sm:inline-flex py-1 px-2.5">
              <User className="h-3 w-3 mr-1" />
              Demo User
            </Badge>
          )}

          {/* Mobile Logout / Chat Shortcut */}
          {currentUser && (
            <button
              type="button"
              onClick={handleLogout}
              className="flex sm:hidden min-h-[38px] min-w-[38px] items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 active:scale-95"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}

          {/* Quick Chat Shortcut for Mobile */}
          <Link
            href="/chat"
            className="flex md:hidden min-h-[44px] min-w-[44px] items-center justify-center rounded-xl bg-indigo-950/70 border border-indigo-500/40 text-cyan-300 shadow-sm active:scale-95 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
            aria-label="Open AI Assistant"
          >
            <Sparkles className="h-4 w-4 text-cyan-400" />
          </Link>
        </div>
      </div>
    </header>
  );
}
