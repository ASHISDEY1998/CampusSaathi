"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Header from "./Header";
import BottomNav from "./BottomNav";
import DesktopNav from "./DesktopNav";

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login";

  if (isAuthPage) {
    return (
      <main className="min-h-screen w-full flex flex-col justify-center items-center bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 px-4 py-8 transition-colors duration-200">
        {children}
      </main>
    );
  }

  const isChat = pathname === "/chat";

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 selection:bg-sky-500/20 selection:text-sky-500 transition-colors duration-200">
      {/* Top Header */}
      <Header />

      {/* Main layout container with desktop navigation */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto min-h-0">
        {/* Desktop / Tablet Sidebar */}
        <DesktopNav />

        {/* Dynamic page content */}
        <main
          className={
            isChat
              ? "flex-1 w-full min-w-0 flex flex-col px-3 sm:px-6 lg:px-8 pt-2 pb-[4.75rem] md:py-5 md:pb-8 h-[calc(100dvh-4rem)] md:h-auto overflow-hidden md:overflow-visible"
              : "flex-1 w-full min-w-0 px-3 sm:px-6 lg:px-8 py-3 sm:py-5 bottom-nav-safe md:pb-8"
          }
        >
          {children}
        </main>
      </div>

      {/* Fixed bottom navigation on mobile devices */}
      <BottomNav />
    </div>
  );
}
