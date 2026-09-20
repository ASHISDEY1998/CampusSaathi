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
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/90 dark:bg-black/90 border-t border-zinc-200 dark:border-zinc-800/80 backdrop-blur-md pb-safe transition-colors"
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
                className="group relative flex flex-col items-center justify-center min-w-[64px] min-h-[48px] py-1 text-center transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-xl"
              >
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg transition-all",
                    isActive
                      ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-sm"
                      : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800"
                  )}
                >
                  <Icon className="h-4.5 w-4.5 text-sky-500" />
                </div>
                <span
                  className={cn(
                    "text-[10px] mt-0.5 tracking-tight transition-colors",
                    isActive ? "text-sky-500 font-semibold" : "text-zinc-500 dark:text-zinc-400 font-normal"
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
                "flex flex-col items-center justify-center min-w-[64px] min-h-[48px] py-1 text-center transition-colors active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-lg",
                isActive
                  ? "text-sky-500"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              )}
            >
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-md transition-colors",
                  isActive ? "text-sky-500" : ""
                )}
              >
                <Icon className="h-4.5 w-4.5" />
              </div>
              <span
                className={cn(
                  "text-[10px] mt-0.5 tracking-tight transition-colors",
                  isActive ? "font-semibold text-sky-500" : "font-normal"
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
