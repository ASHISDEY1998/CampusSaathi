"use client";

import { useState } from "react";
import Link from "next/link";
import {
  LifeBuoy,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

interface ExampleTicket {
  id: string;
  category: string;
  title: string;
  description: string;
  location: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED";
  createdAt: string;
}

const EXAMPLE_TICKETS: ExampleTicket[] = [
  {
    id: "CS-TKT-1042",
    category: "Classroom Equipment",
    title: "Projector flickering in Room 402",
    description: "The HDMI projector resets periodically during morning lectures.",
    location: "Academic Block B, Room 402",
    priority: "HIGH",
    status: "OPEN",
    createdAt: "2 hours ago (Example)",
  },
  {
    id: "CS-TKT-1019",
    category: "Internet & Wi-Fi",
    title: "Hostel Block C 3rd Floor Wi-Fi Outage",
    description: "Intermittent connectivity observed across rooms 301-315.",
    location: "Hostel Block C, 3rd Floor",
    priority: "MEDIUM",
    status: "IN_PROGRESS",
    createdAt: "Yesterday (Example)",
  },
  {
    id: "CS-TKT-0988",
    category: "Electrical",
    title: "Lab 3 Air Conditioning cooling issue",
    description: "AC unit 2 in CSE Lab 3 is blowing ambient air.",
    location: "Computing Block, Lab 3",
    priority: "LOW",
    status: "RESOLVED",
    createdAt: "3 days ago (Example)",
  },
];

export default function TicketsPage() {
  const [filter, setFilter] = useState<"ALL" | "OPEN" | "IN_PROGRESS" | "RESOLVED">("ALL");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredTickets = EXAMPLE_TICKETS.filter((t) => {
    if (filter === "ALL") return true;
    return t.status === filter;
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-4">
      {/* Page Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-900/60 border border-indigo-500/30 text-cyan-400">
              <LifeBuoy className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">
              Campus Helpdesk
            </h1>
            <Badge variant="emerald">Live Support</Badge>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Submit equipment issues, facility requests, and track maintenance resolution in real time.
          </p>
        </div>

        {/* Raise a Ticket CTA */}
        <Button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="shrink-0 font-bold text-xs"
        >
          <Plus className="h-4 w-4" />
          <span>Raise a Ticket</span>
        </Button>
      </div>

      {/* Ticket Creation Dialog */}
      {showCreateModal && (
        <Card className="p-5 bg-slate-900/95 border-indigo-500/40 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
              <LifeBuoy className="h-4 w-4 text-cyan-400" />
              <span>Raise a Helpdesk Ticket</span>
            </div>
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded"
            >
              ✕ Close
            </button>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Report classroom, lab, or hostel equipment issues directly to facility management. You can also file tickets naturally by asking the AI Companion in chat.
          </p>
          <div className="pt-1 flex items-center gap-2">
            <Link
              href="/chat"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 underline"
            >
              <span>File via AI Companion &rarr;</span>
            </Link>
          </div>
        </Card>
      )}

      {/* Category / Status Filter System */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none" role="tablist">
        {(["ALL", "OPEN", "IN_PROGRESS", "RESOLVED"] as const).map((status) => (
          <button
            key={status}
            type="button"
            role="tab"
            aria-selected={filter === status}
            onClick={() => setFilter(status)}
            className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
              filter === status
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            {status === "ALL" && "All Tickets (3)"}
            {status === "OPEN" && "Open (1)"}
            {status === "IN_PROGRESS" && "In Progress (1)"}
            {status === "RESOLVED" && "Resolved (1)"}
          </button>
        ))}
      </div>

      {/* Example Ticket Card Structure */}
      <div className="space-y-3">
        {filteredTickets.map((ticket) => {
          return (
            <Card
              key={ticket.id}
              className="p-4 sm:p-5 hover:border-slate-700 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-cyan-400">
                      {ticket.id}
                    </span>
                    <Badge variant="outline">{ticket.category}</Badge>
                    <Badge
                      variant={
                        ticket.priority === "HIGH"
                          ? "rose"
                          : ticket.priority === "MEDIUM"
                          ? "amber"
                          : "default"
                      }
                    >
                      {ticket.priority} PRIORITY
                    </Badge>
                  </div>

                  <h2 className="mt-2 text-sm sm:text-base font-bold text-white">
                    {ticket.title}
                  </h2>
                  <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                    {ticket.description}
                  </p>
                </div>

                {/* Status Visual Indicator */}
                <div className="shrink-0 self-start">
                  <Badge
                    variant={
                      ticket.status === "OPEN"
                        ? "amber"
                        : ticket.status === "IN_PROGRESS"
                        ? "cyan"
                        : "emerald"
                    }
                    className="text-xs px-2.5 py-1"
                  >
                    {ticket.status === "OPEN" && <AlertCircle className="h-3 w-3" />}
                    {ticket.status === "IN_PROGRESS" && <Clock className="h-3 w-3" />}
                    {ticket.status === "RESOLVED" && <CheckCircle2 className="h-3 w-3" />}
                    <span>{ticket.status.replace("_", " ")}</span>
                  </Badge>
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-slate-500" />
                    {ticket.location}
                  </span>
                  <span>• {ticket.createdAt}</span>
                </div>

                <span className="text-cyan-400/90 font-medium hover:text-cyan-300 transition-colors">
                  View Ticket History →
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
