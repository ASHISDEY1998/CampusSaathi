"use client";

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

const NAV_ITEMS = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "AI Assistant",
    href: "/chat",
    icon: Sparkles,
    badge: "Stage 4",
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
  {
    name: "Admin Portal",
    href: "/admin",
    icon: ShieldCheck,
    badge: "Admin",
  },
];

export default function DesktopNav() {
  const pathname = usePathname();

  // Hide on login page
  if (pathname === "/login") {
    return null;
  }

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-slate-800 bg-slate-950/60 backdrop-blur-xl min-h-[calc(100vh-4rem)] p-4 justify-between">
      <div className="space-y-6">
        {/* Institution Placeholder Box */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-4">
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <Building2 className="h-3.5 w-3.5 text-cyan-400" />
            Institution Portal
          </div>
          <p className="mt-1 text-sm font-bold text-slate-100 truncate">
            CampusSaathi Demonstration
          </p>
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Stage 1 UI Shell Active</span>
          </div>
        </div>

        {/* Navigation Group */}
        <nav aria-label="Desktop Sidebar Navigation" className="space-y-1.5">
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Menu
          </div>

          {NAV_ITEMS.map((item) => {
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
                  <Badge variant="cyan" className="text-[10px]">
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
            AI Companion
          </div>
          <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
            Science exhibition prototype combining conversational AI with verified college documents and helpdesk automation.
          </p>
          <Link
            href="/chat"
            className="mt-3.5 flex items-center justify-center gap-1.5 w-full rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 min-h-[40px] py-2 text-xs font-bold text-cyan-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            Explore AI Chat UI
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Footer / Account Placeholder */}
      <div className="border-t border-slate-800/80 pt-4">
        <Link
          href="/profile"
          className="flex items-center gap-3 rounded-xl p-2 hover:bg-slate-800/50 transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-900 to-slate-800 border border-indigo-700/50 text-xs font-bold text-cyan-300">
            CS
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-slate-200 truncate">
              Demo Profile
            </span>
            <span className="text-[10px] text-slate-400 truncate">
              Stage 1 Placeholder
            </span>
          </div>
        </Link>
      </div>
    </aside>
  );
}
