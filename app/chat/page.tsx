"use client";

import { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Send,
  Bot,
  User,
  RotateCcw,
  BookOpen,
  CheckCircle2,
  Copy,
  Check,
} from "lucide-react";

interface Citation {
  title: string;
  section: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  timestamp: string;
}

const SUGGESTED_QUESTIONS = [
  {
    icon: "📊",
    label: "What are my marks?",
    query: "What are my current internal and course marks?",
  },
  {
    icon: "⏱️",
    label: "Minimum attendance rule",
    query: "What is the minimum attendance required for semester exams?",
  },
  {
    icon: "📅",
    label: "Show my timetable",
    query: "Show my departmental timetable and schedule",
  },
  {
    icon: "📢",
    label: "Exam reschedules",
    query: "Has any examination been rescheduled recently?",
  },
  {
    icon: "🪪",
    label: "Lost ID card fine",
    query: "What is the fine for losing college ID card?",
  },
  {
    icon: "👔",
    label: "Dress code & uniform",
    query: "What are the uniform and dress code rules?",
  },
];

let messageCounter = 0;
function createMessageId(): string {
  messageCounter += 1;
  return `msg_${messageCounter}_${Math.random().toString(36).slice(2, 8)}`;
}

function getFormattedTime(): string {
  const d = new Date();
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMessage: Message = {
      id: createMessageId(),
      role: "user",
      content: query,
      timestamp: getFormattedTime(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const historyPayload = messages.slice(-4).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          history: historyPayload,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const assistantMessage: Message = {
          id: createMessageId(),
          role: "assistant",
          content: data.reply,
          citations: data.citations,
          timestamp: getFormattedTime(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        const errorMessage: Message = {
          id: createMessageId(),
          role: "assistant",
          content: `⚠️ **Error:** ${data.error || "Unable to reach CampusSaathi engine. Please check API key or database."}`,
          timestamp: getFormattedTime(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (err: unknown) {
      const error = err as Error;
      const errorMessage: Message = {
        id: createMessageId(),
        role: "assistant",
        content: `⚠️ **Network Error:** ${error.message || "Failed to connect to the server."}`,
        timestamp: getFormattedTime(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleReset = () => {
    setMessages([]);
    setInput("");
  };

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 sm:pb-3 border-b border-zinc-200 dark:border-zinc-800/80 mb-2 shrink-0">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <Sparkles className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-sky-500" />
          </div>
          <div>
            <h1 className="text-xs sm:text-base font-semibold text-zinc-900 dark:text-white flex items-center gap-1.5">
              <span>Campus AI Companion</span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Verified
              </span>
            </h1>
            <p className="hidden sm:block text-[11px] text-zinc-500 dark:text-zinc-400">
              Grounded in official institutional regulations and database records
            </p>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 text-[11px] sm:text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            <RotateCcw className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span>New Chat</span>
          </button>
        )}
      </div>

      {/* Message Area */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-1">
        {messages.length === 0 ? (
          /* Empty State - Mobile optimized */
          <div className="h-full flex flex-col justify-center items-center text-center px-2 py-4 my-auto">
            <div className="max-w-md w-full space-y-3 sm:space-y-4">
              <div className="mx-auto flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sky-500 shadow-xs">
                <Bot className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>

              <div className="space-y-1">
                <h2 className="text-sm sm:text-lg font-semibold text-zinc-900 dark:text-white">
                  How can CampusSaathi help?
                </h2>
                <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 max-w-xs sm:max-w-sm mx-auto leading-relaxed">
                  Ask about attendance rules, exam dates, internal marks, syllabus, or college regulations.
                </p>
              </div>

              {/* Quick Questions Grid / Chips */}
              <div className="pt-1 sm:pt-2">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
                  Suggested Questions
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 text-left">
                  {SUGGESTED_QUESTIONS.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSend(item.query)}
                      className="group flex items-center gap-2 rounded-lg bg-white dark:bg-zinc-900/70 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-800 hover:border-sky-500/40 p-2 sm:p-2.5 text-xs text-zinc-700 dark:text-zinc-300 hover:text-sky-500 dark:hover:text-sky-400 transition-all shadow-2xs active:scale-[0.98]"
                    >
                      <span className="text-xs sm:text-sm shrink-0">{item.icon}</span>
                      <span className="truncate flex-1 font-medium text-[11px] sm:text-xs">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Chat Bubble Thread */
          <div className="space-y-3 p-1">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2 sm:gap-3 ${
                  m.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {/* Assistant Avatar */}
                {m.role === "assistant" && (
                  <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-xs mt-1">
                    <Bot className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-sky-500" />
                  </div>
                )}

                {/* Bubble */}
                <div
                  className={`max-w-[88%] sm:max-w-[80%] rounded-xl p-3 sm:p-4 text-xs sm:text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-tr-xs shadow-xs"
                      : "bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 text-zinc-900 dark:text-zinc-100 rounded-tl-xs shadow-xs"
                  }`}
                >
                  {/* Content */}
                  <div className="whitespace-pre-wrap space-y-2">
                    {m.content}
                  </div>

                  {/* Grounded Citations Pill */}
                  {m.citations && m.citations.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-zinc-200 dark:border-zinc-800/80 space-y-1">
                      <div className="flex items-center gap-1 text-[10px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                        <BookOpen className="h-3 w-3" />
                        <span>Verified Sources:</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {m.citations.map((c, i) => (
                          <div
                            key={i}
                            className="inline-flex items-center gap-1 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-700 dark:text-zinc-300"
                          >
                            <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500" />
                            <span>
                              {c.title} • <strong className="text-zinc-900 dark:text-zinc-100">{c.section}</strong>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Timestamp & Actions */}
                  <div className="mt-1.5 flex items-center justify-between text-[10px] text-zinc-400">
                    <span>{m.timestamp}</span>
                    {m.role === "assistant" && (
                      <button
                        type="button"
                        onClick={() => handleCopy(m.content, m.id)}
                        className="hover:text-sky-500 p-1 rounded transition-colors"
                        title="Copy response"
                      >
                        {copiedId === m.id ? (
                          <Check className="h-3 w-3 text-emerald-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* User Avatar */}
                {m.role === "user" && (
                  <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 shadow-xs mt-1">
                    <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {loading && (
              <div className="flex gap-2 sm:gap-3 justify-start items-center">
                <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-xs">
                  <Bot className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-sky-500" />
                </div>
                <div className="rounded-xl rounded-tl-xs bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 px-3 py-2 sm:px-4 sm:py-2.5 text-xs text-zinc-600 dark:text-zinc-400 flex items-center gap-2 shadow-xs">
                  <span className="flex space-x-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-bounce"></span>
                    <span className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-bounce [animation-delay:0.2s]"></span>
                    <span className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-bounce [animation-delay:0.4s]"></span>
                  </span>
                  <span className="text-[11px] sm:text-xs">Consulting official institute records...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Form Box - Guaranteed clearance above bottom nav */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="pt-2 sm:pt-2.5 border-t border-zinc-200 dark:border-zinc-800/80 shrink-0"
      >
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about marks, attendance, exams..."
            disabled={loading}
            className="w-full min-h-[42px] sm:min-h-[46px] rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 pl-3.5 pr-12 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-colors shadow-xs"
          />

          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="absolute right-1.5 flex h-7.5 w-7.5 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 disabled:opacity-40 transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
            aria-label="Send message"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="mt-1 hidden sm:block text-center text-[10px] text-zinc-400 dark:text-zinc-500">
          CampusSaathi AI Engine • Grounded in Verified Documents • Zero Hallucination
        </div>
      </form>
    </div>
  );
}
