"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Sparkles,
  LifeBuoy,
  UserCircle,
  Building2,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

interface AuthUser {
  identifier: string;
  name: string;
  role: "STUDENT" | "TEACHER" | "ADMIN";
  email: string;
  department: string;
}

export default function DesktopNav() {
  const pathname = usePathname();
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
  }, [pathname]);

  // Hide on login page
  if (pathname === "/login") {
    return null;
  }

  // Base navigation items
  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "AI Assistant",
      href: "/chat",
      icon: Sparkles,
      badge: "AI",
    },
    {
      name: "Helpdesk Tickets",
      href: "/tickets",
      icon: LifeBuoy,
    },
    {
      name: "User Profile",
      href: "/profile",
      icon: UserCircle,
    },
  ];

  // Only append Admin Portal if logged in as ADMIN
  if (currentUser?.role === "ADMIN") {
    navItems.push({
      name: "Admin Portal",
      href: "/admin",
      icon: ShieldCheck,
      badge: "Admin",
    });
  }

  // Generate User Initials
  const getInitials = (name?: string) => {
    if (!name) return "CS";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-slate-800 bg-slate-950/60 backdrop-blur-xl min-h-[calc(100vh-4rem)] p-4 justify-between">
      <div className="space-y-6">
        {/* Institution Status Box */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-4">
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <Building2 className="h-3.5 w-3.5 text-cyan-400" />
            Institution Portal
          </div>
          <p className="mt-1 text-sm font-bold text-slate-100 truncate">
            ABC Institute of Technology
          </p>
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-emerald-400 font-medium">System Online & Active</span>
          </div>
        </div>

        {/* Navigation Group */}
        <nav aria-label="Desktop Sidebar Navigation" className="space-y-1.5">
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Menu
          </div>

          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "group flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-medium transition-all min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400",
                  isActive
                    ? "bg-indigo-950/70 text-cyan-400 border border-indigo-500/30 shadow-sm"
                    : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "h-4 w-4 transition-colors",
                      isActive
                        ? "text-cyan-400"
                        : "text-slate-400 group-hover:text-slate-200"
                    )}
                  />
                  <span>{item.name}</span>
                </div>

                {item.badge && (
                  <Badge
                    variant={item.badge === "Admin" ? "amber" : "cyan"}
                    className="text-[10px]"
                  >
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>

        {/* AI Assistant Callout */}
        <div className="rounded-2xl border border-indigo-950/80 bg-gradient-to-br from-indigo-950/40 to-slate-900/60 p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            AI College Companion
          </div>
          <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
            Get instant answers on college attendance rules, examination schedules, student marks, and helpdesk support.
          </p>
          <Link
            href="/chat"
            className="mt-3.5 flex items-center justify-center gap-1.5 w-full rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 min-h-[40px] py-2 text-xs font-bold text-cyan-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            Launch AI Assistant
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Footer / Account Profile */}
      <div className="border-t border-slate-800/80 pt-4">
        <Link
          href="/profile"
          className="flex items-center gap-3 rounded-xl p-2 hover:bg-slate-800/50 transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-900 to-slate-800 border border-indigo-700/50 text-xs font-bold text-cyan-300">
            {getInitials(currentUser?.name)}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-slate-200 truncate">
              {currentUser?.name || "Account Profile"}
            </span>
            <span className="text-[10px] text-slate-400 truncate">
              {currentUser
                ? `${currentUser.role} • ${currentUser.department}`
                : "Active User Session"}
            </span>
          </div>
        </Link>
      </div>
    </aside>
  );
}
