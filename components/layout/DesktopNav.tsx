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
    <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-black/40 backdrop-blur-md min-h-[calc(100vh-4rem)] p-4 justify-between transition-colors">
      <div className="space-y-6">
        {/* Institution Status Box */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 p-3.5 shadow-sm">
          <div className="flex items-center gap-2 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            <Building2 className="h-3.5 w-3.5 text-sky-500" />
            Institution Portal
          </div>
          <p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate" title="Purnachandra Group of Institutions">
            Purnachandra Group of Institutions
          </p>
          <div className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
            Official Campus Portal
          </div>
        </div>

        {/* Navigation Group */}
        <nav aria-label="Desktop Sidebar Navigation" className="space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
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
                  "group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-all min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500",
                  isActive
                    ? "bg-zinc-200/70 dark:bg-zinc-900 text-zinc-900 dark:text-white font-semibold border-l-2 border-sky-500 pl-2.5 shadow-xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900/60 hover:text-zinc-900 dark:hover:text-white font-normal"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "h-4 w-4 transition-colors",
                      isActive
                        ? "text-sky-500"
                        : "text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300"
                    )}
                  />
                  <span>{item.name}</span>
                </div>

                {item.badge && (
                  <Badge
                    variant={item.badge === "Admin" ? "amber" : "sky"}
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
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
            <Sparkles className="h-4 w-4 text-sky-500" />
            Campus AI Assistant
          </div>
          <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Instant answers on verified college policies, exam timetables, marks, and campus circulars.
          </p>
          <Link
            href="/chat"
            className="mt-3 flex items-center justify-center gap-1.5 w-full rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 min-h-[40px] py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 shadow-xs"
          >
            Open Assistant
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Footer / Account Profile */}
      <div className="border-t border-zinc-200 dark:border-zinc-800/80 pt-3">
        <Link
          href="/profile"
          className="flex items-center gap-3 rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900/60 transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-zinc-900 dark:bg-zinc-100 text-xs font-semibold text-white dark:text-zinc-900">
            {getInitials(currentUser?.name)}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100 truncate">
              {currentUser?.name || "User Profile"}
            </span>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
              {currentUser
                ? `${currentUser.role} • ${currentUser.department}`
                : "Active Session"}
            </span>
          </div>
        </Link>
      </div>
    </aside>
  );
}
