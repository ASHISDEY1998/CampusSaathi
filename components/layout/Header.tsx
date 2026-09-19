"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, Sparkles, User, Shield } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export default function Header() {
  const pathname = usePathname();

  // Hide header on login page
  if (pathname === "/login") {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link
          href="/dashboard"
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

        {/* Right Side Status & Role Indicators */}
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

          {/* Role Placeholder (Generic preview badge, no hardcoded personal name) */}
          <Badge variant="indigo" className="hidden sm:inline-flex py-1 px-2.5">
            <User className="h-3 w-3 mr-1" />
            Demo User
          </Badge>

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
