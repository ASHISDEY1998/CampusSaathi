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
      <main className="min-h-screen w-full flex flex-col justify-center items-center bg-[#0a0f1d] px-4 py-8">
        {children}
      </main>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0f1d] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Header */}
      <Header />

      {/* Main layout container with desktop navigation */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop / Tablet Sidebar */}
        <DesktopNav />

        {/* Dynamic page content */}
        <main className="flex-1 w-full min-w-0 px-4 py-5 sm:px-6 lg:px-8 bottom-nav-safe md:pb-8">
          {children}
        </main>
      </div>

      {/* Fixed bottom navigation on mobile devices */}
      <BottomNav />
    </div>
  );
}
