"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Sparkles, LifeBuoy, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  href: string;
  icon: typeof LayoutDashboard;
  isSpecial?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    name: "Home",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "AI Chat",
    href: "/chat",
    icon: Sparkles,
    isSpecial: true,
  },
  {
    name: "Tickets",
    href: "/tickets",
    icon: LifeBuoy,
  },
  {
    name: "Profile",
    href: "/profile",
    icon: UserCircle,
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  // Hide bottom navigation on login page
  if (pathname === "/login") {
    return null;
  }

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass-nav pb-safe"
    >
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-3">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (item.isSpecial) {
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label="CampusSaathi AI Chat"
                aria-current={isActive ? "page" : undefined}
                className="group relative flex flex-col items-center justify-center min-w-[64px] min-h-[48px] py-1 text-center transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-2xl"
              >
                {/* Floating pill highlight for AI Chat */}
                <div
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-2xl transition-all shadow-lg",
                    isActive
                      ? "bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 text-white shadow-cyan-500/25 ring-2 ring-cyan-400/40"
                      : "bg-gradient-to-tr from-indigo-900 to-slate-800 text-cyan-300 border border-indigo-500/40 shadow-indigo-950/50"
                  )}
                >
                  <Icon className="h-5 w-5 animate-pulse" />
                </div>
                <span
                  className={cn(
                    "text-[10px] font-semibold mt-1 tracking-tight transition-colors",
                    isActive ? "text-cyan-400 font-bold" : "text-slate-300"
                  )}
                >
                  {item.name}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.name}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex flex-col items-center justify-center min-w-[64px] min-h-[48px] py-1 text-center transition-colors active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-xl",
                isActive
                  ? "text-cyan-400"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                  isActive ? "bg-slate-800/80" : ""
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span
                className={cn(
                  "text-[10px] mt-0.5 tracking-tight transition-colors",
                  isActive ? "font-bold text-cyan-400" : "font-medium"
                )}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
