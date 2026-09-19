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
import { Badge } from "@/components/ui/Badge";

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
  "What is the minimum attendance required for exams?",
  "What are my marks?",
  "What is the fine for losing college ID card?",
  "Show my departmental timetable",
  "Has any examination been rescheduled?",
  "What are the uniform and dress code rules?",
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
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-5.5rem)] max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-cyan-400 text-white shadow-md shadow-cyan-500/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-white">
                CampusSaathi AI Companion
              </h1>
              <Badge variant="emerald" className="text-[10px] py-0.5">
                Gemini 3.6 Active
              </Badge>
            </div>
            <p className="text-[11px] text-slate-400">
              Grounded in verified institutional policies & database records
            </p>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-xl border border-slate-800 hover:bg-slate-900 transition-colors min-h-[38px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">New Chat</span>
          </button>
        )}
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.length === 0 ? (
          /* Empty State */
          <div className="h-full flex flex-col justify-center items-center text-center p-4">
            <div className="max-w-md space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 border border-indigo-500/40 text-cyan-400 shadow-xl shadow-indigo-950/60">
                <Bot className="h-8 w-8" />
              </div>

              <div className="space-y-1.5">
                <h2 className="text-lg font-bold text-white">
                  How can CampusSaathi assist you today?
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Ask any questions about attendance rules, exam timetables, invigilation duty, student grades, or campus policies.
                </p>
              </div>

              {/* Suggested Prompt Chips */}
              <div className="pt-2">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2.5">
                  Suggested Questions
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {SUGGESTED_QUESTIONS.map((q, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSend(q)}
                      className="rounded-xl bg-slate-900/90 hover:bg-indigo-950 border border-slate-800 hover:border-cyan-500/50 px-3 py-2 text-xs text-slate-300 hover:text-cyan-300 transition-all text-left active:scale-95 min-h-[40px] flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                    >
                      <Sparkles className="h-3 w-3 text-cyan-400 shrink-0" />
                      <span>{q}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Chat Bubble Thread */
          <div className="space-y-4 p-1">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 ${
                  m.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {/* Assistant Avatar */}
                {m.role === "assistant" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white shadow-sm mt-1">
                    <Bot className="h-4 w-4" />
                  </div>
                )}

                {/* Bubble */}
                <div
                  className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md rounded-tr-sm"
                      : "bg-slate-900/90 border border-slate-800/90 text-slate-100 shadow-sm rounded-tl-sm"
                  }`}
                >
                  {/* Content */}
                  <div className="whitespace-pre-wrap space-y-2">
                    {m.content}
                  </div>

                  {/* Grounded Citations Pill */}
                  {m.citations && m.citations.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                        <BookOpen className="h-3 w-3" />
                        <span>Verified College Sources:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {m.citations.map((c, i) => (
                          <div
                            key={i}
                            className="inline-flex items-center gap-1 rounded-md bg-slate-950/80 border border-slate-800 px-2 py-0.5 text-[10px] text-slate-300"
                          >
                            <CheckCircle2 className="h-2.5 w-2.5 text-emerald-400" />
                            <span>
                              {c.title} • <strong className="text-cyan-300">{c.section}</strong>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Timestamp & Actions */}
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                    <span>{m.timestamp}</span>
                    {m.role === "assistant" && (
                      <button
                        type="button"
                        onClick={() => handleCopy(m.content, m.id)}
                        className="hover:text-cyan-300 p-1 rounded transition-colors"
                        title="Copy text"
                      >
                        {copiedId === m.id ? (
                          <Check className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* User Avatar */}
                {m.role === "user" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-800 border border-slate-700 text-cyan-300 shadow-sm mt-1">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {loading && (
              <div className="flex gap-3 justify-start items-center">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white shadow-sm">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="rounded-2xl rounded-tl-sm bg-slate-900/90 border border-slate-800/90 px-4 py-3 text-xs text-cyan-300 flex items-center gap-2">
                  <span className="flex space-x-1">
                    <span className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce"></span>
                    <span className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]"></span>
                    <span className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]"></span>
                  </span>
                  <span>CampusSaathi is researching college documents & records...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Form Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="pt-3 border-t border-slate-800/80 shrink-0"
      >
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask an academic question, policy rule, or student marks..."
            disabled={loading}
            className="w-full min-h-[48px] rounded-2xl bg-slate-900/90 border border-slate-700/80 pl-4 pr-14 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 transition-colors shadow-inner"
          />

          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="absolute right-1.5 flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white transition-all shadow-md active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-1.5 text-center text-[10px] text-slate-500">
          CampusSaathi AI Engine • Grounded in Verified Documents • Zero Hallucination
        </div>
      </form>
    </div>
  );
}
