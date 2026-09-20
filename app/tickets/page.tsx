"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  LifeBuoy,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

interface TicketItem {
  id?: string;
  ticketId: string;
  category: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED";
  createdAt: string;
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "OPEN" | "IN_PROGRESS" | "RESOLVED">("ALL");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form state
  const [category, setCategory] = useState("IT Support");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchTickets = async () => {
    try {
      const res = await fetch("/api/tickets");
      const data = await res.json();
      if (res.ok && data.success) {
        setTickets(data.data || []);
      }
    } catch {
      // empty state on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const res = await fetch("/api/tickets");
        const data = await res.json();
        if (isMounted && res.ok && data.success) {
          setTickets(data.data || []);
        }
      } catch {
        // empty state on error
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!description.trim()) {
      setFormError("Please provide a description of the issue.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          description: description.trim(),
          priority,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setDescription("");
        setShowCreateModal(false);
        fetchTickets();
      } else {
        setFormError(data.error?.message || "Failed to submit ticket.");
      }
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    if (filter === "ALL") return true;
    return t.status === filter;
  });

  const countByStatus = (status: "OPEN" | "IN_PROGRESS" | "RESOLVED") =>
    tickets.filter((t) => t.status === status).length;

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto pb-4">
      {/* Page Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
              <LifeBuoy className="h-4.5 w-4.5 text-sky-500" />
            </div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">
              Campus Helpdesk
            </h1>
          </div>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Submit equipment issues, facility requests, and track maintenance resolution in real time.
          </p>
        </div>

        {/* Raise a Ticket CTA */}
        <Button
          type="button"
          onClick={() => setShowCreateModal(true)}
          variant="primary"
          className="shrink-0 font-medium text-xs justify-center"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          <span>Raise a Ticket</span>
        </Button>
      </div>

      {/* Ticket Creation Dialog */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <Card className="max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <LifeBuoy className="h-4 w-4 text-sky-500" />
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                  New Helpdesk Request
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full min-h-[38px] rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 text-xs text-zinc-900 dark:text-white focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                >
                  <option value="IT Support">IT Support & Wi-Fi</option>
                  <option value="Classroom">Classroom & Lab Equipment</option>
                  <option value="Electrical">Electrical & Power</option>
                  <option value="Hostel">Hostel & Facilities</option>
                  <option value="Academic">Academic Queries</option>
                  <option value="Administration">Administrative Affairs</option>
                  <option value="Other">Other Issues</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as "LOW" | "MEDIUM" | "HIGH")}
                  className="w-full min-h-[38px] rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 text-xs text-zinc-900 dark:text-white focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Issue Description
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail the issue, location (e.g. Room 302), and equipment details..."
                  required
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              {formError && (
                <div className="rounded-md bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 p-2.5 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={submitting}
                  className="text-xs"
                >
                  {submitting ? "Submitting..." : "Submit Ticket"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none" role="tablist">
        {(["ALL", "OPEN", "IN_PROGRESS", "RESOLVED"] as const).map((status) => (
          <button
            key={status}
            type="button"
            role="tab"
            aria-selected={filter === status}
            onClick={() => setFilter(status)}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
              filter === status
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-semibold shadow-xs"
                : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-zinc-800"
            }`}
          >
            {status === "ALL" && `All Tickets (${tickets.length})`}
            {status === "OPEN" && `Open (${countByStatus("OPEN")})`}
            {status === "IN_PROGRESS" && `In Progress (${countByStatus("IN_PROGRESS")})`}
            {status === "RESOLVED" && `Resolved (${countByStatus("RESOLVED")})`}
          </button>
        ))}
      </div>

      {/* Tickets List or Empty State */}
      {loading ? (
        <div className="py-12 text-center text-xs text-zinc-400">
          Loading tickets...
        </div>
      ) : filteredTickets.length === 0 ? (
        <Card className="p-8 text-center space-y-3">
          <LifeBuoy className="h-8 w-8 mx-auto text-zinc-400 dark:text-zinc-600" />
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
            No support tickets submitted yet
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
            Submit equipment issues or facility requests to track resolution in real time.
          </p>
          <div className="pt-2">
            <Button
              type="button"
              onClick={() => setShowCreateModal(true)}
              variant="primary"
              className="text-xs inline-flex items-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Raise Ticket</span>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredTickets.map((ticket) => (
            <Card
              key={ticket.ticketId}
              className="p-4 sm:p-5 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-sky-500">
                      {ticket.ticketId}
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

                  <p className="mt-2 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 leading-relaxed font-medium">
                    {ticket.description}
                  </p>
                </div>

                {/* Status Indicator */}
                <div className="shrink-0 self-start">
                  <Badge
                    variant={
                      ticket.status === "OPEN"
                        ? "amber"
                        : ticket.status === "IN_PROGRESS"
                        ? "sky"
                        : "emerald"
                    }
                    className="text-xs px-2.5 py-1"
                  >
                    {ticket.status === "OPEN" && <AlertCircle className="h-3 w-3 mr-1" />}
                    {ticket.status === "IN_PROGRESS" && <Clock className="h-3 w-3 mr-1" />}
                    {ticket.status === "RESOLVED" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                    <span>{ticket.status.replace("_", " ")}</span>
                  </Badge>
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-3.5 pt-3 border-t border-zinc-200 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-400 dark:text-zinc-500">
                <span>
                  Submitted {new Date(ticket.createdAt).toLocaleDateString()}
                </span>
                <Link
                  href="/chat"
                  className="text-sky-500 font-medium hover:text-sky-600 transition-colors inline-flex items-center gap-1"
                >
                  <span>Ask AI for updates</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
