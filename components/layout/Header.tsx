"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Sparkles,
  Shield,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { useTheme } from "@/components/theme/ThemeProvider";

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
  const { theme, toggleTheme } = useTheme();
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
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/85 dark:bg-black/85 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link
          href={currentUser?.role === "ADMIN" ? "/admin" : "/dashboard"}
          className="flex items-center gap-2.5 transition-opacity hover:opacity-90 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-lg"
          aria-label="CampusSaathi Home"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm p-1 transition-colors overflow-hidden">
            <Image
              src="/branding/campussaathi-mark.svg"
              alt="CampusSaathi Mark"
              width={28}
              height={28}
              className="h-full w-full object-contain"
            />
          </div>

          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-1">
              Campus<span className="text-sky-500">Saathi</span>
            </span>
            <span className="hidden sm:inline-block text-[11px] font-normal text-zinc-500 dark:text-zinc-400 -mt-0.5 tracking-normal">
              Your Intelligent Campus Companion
            </span>
          </div>
        </Link>

        {/* Right Side Controls */}
        <div className="flex items-center gap-2">
          {/* Admin Portal Shortcut - Only visible to administrators */}
          {currentUser?.role === "ADMIN" && (
            <Link
              href="/admin"
              className="flex items-center gap-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 px-2.5 py-1.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition-colors focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none"
              aria-label="Admin Portal"
            >
              <Shield className="h-3.5 w-3.5 text-sky-500" />
              <span>Admin</span>
            </Link>
          )}

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 active:scale-95"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 text-zinc-300" />
            ) : (
              <Moon className="h-4 w-4 text-zinc-700" />
            )}
          </button>

          {/* Authenticated User Badge */}
          {currentUser && (
            <div className="hidden sm:flex items-center gap-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 py-1 pl-2.5 pr-1.5 text-xs text-zinc-800 dark:text-zinc-200">
              <Badge
                variant={
                  currentUser.role === "ADMIN"
                    ? "amber"
                    : currentUser.role === "TEACHER"
                    ? "sky"
                    : "default"
                }
                className="text-[10px] py-0 px-1.5 font-semibold"
              >
                {currentUser.role}
              </Badge>
              <span className="font-medium text-zinc-900 dark:text-zinc-100 max-w-[130px] truncate">
                {currentUser.name}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="ml-1 p-1 rounded-md text-zinc-400 hover:text-rose-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Mobile Logout */}
          {currentUser && (
            <button
              type="button"
              onClick={handleLogout}
              className="flex sm:hidden min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-rose-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 active:scale-95"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}

          {/* Quick Chat Shortcut for Mobile */}
          <Link
            href="/chat"
            className="flex md:hidden min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 text-sky-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none"
            aria-label="Open AI Assistant"
          >
            <Sparkles className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
