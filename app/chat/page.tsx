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
      <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800/80 mb-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <Sparkles className="h-4.5 w-4.5 text-sky-500" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-white">
              Campus AI Companion
            </h1>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Grounded in verified institutional policies & database records
            </p>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors min-h-[38px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
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
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sky-500 shadow-xs">
                <Bot className="h-7 w-7" />
              </div>

              <div className="space-y-1.5">
                <h2 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-white">
                  How can CampusSaathi assist you?
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Inquire about attendance rules, exam timetables, invigilation duties, student marks, or institutional regulations.
                </p>
              </div>

              {/* Suggested Prompt Chips */}
              <div className="pt-2">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2.5">
                  Suggested Questions
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {SUGGESTED_QUESTIONS.map((q, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSend(q)}
                      className="rounded-lg bg-zinc-50 dark:bg-zinc-900/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 hover:border-sky-500/40 px-3 py-2 text-xs text-zinc-700 dark:text-zinc-300 hover:text-sky-500 dark:hover:text-sky-400 transition-all text-left active:scale-95 min-h-[38px] flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 shadow-xs"
                    >
                      <Sparkles className="h-3 w-3 text-sky-500 shrink-0" />
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
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-xs mt-1">
                    <Bot className="h-4 w-4 text-sky-500" />
                  </div>
                )}

                {/* Bubble */}
                <div
                  className={`max-w-[85%] sm:max-w-[80%] rounded-xl p-4 text-xs sm:text-sm leading-relaxed ${
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
                    <div className="mt-3 pt-2.5 border-t border-zinc-200 dark:border-zinc-800/80 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-[10px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                        <BookOpen className="h-3 w-3" />
                        <span>Verified College Sources:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {m.citations.map((c, i) => (
                          <div
                            key={i}
                            className="inline-flex items-center gap-1 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-2 py-0.5 text-[10px] text-zinc-700 dark:text-zinc-300"
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
                  <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-400">
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
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 shadow-xs mt-1">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {loading && (
              <div className="flex gap-3 justify-start items-center">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-xs">
                  <Bot className="h-4 w-4 text-sky-500" />
                </div>
                <div className="rounded-xl rounded-tl-xs bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 px-4 py-2.5 text-xs text-zinc-600 dark:text-zinc-400 flex items-center gap-2 shadow-xs">
                  <span className="flex space-x-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-bounce"></span>
                    <span className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-bounce [animation-delay:0.2s]"></span>
                    <span className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-bounce [animation-delay:0.4s]"></span>
                  </span>
                  <span>Researching verified college documents & records...</span>
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
        className="pt-3 border-t border-zinc-200 dark:border-zinc-800/80 shrink-0"
      >
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask an academic question, policy rule, or student marks..."
            disabled={loading}
            className="w-full min-h-[46px] rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 pl-4 pr-14 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-colors shadow-xs"
          />

          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="absolute right-1.5 flex h-8 w-8 items-center justify-center rounded-md bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 disabled:opacity-40 transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
            aria-label="Send message"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="mt-1.5 text-center text-[10px] text-zinc-400 dark:text-zinc-500">
          CampusSaathi AI Engine • Grounded in Verified Documents • Zero Hallucination
        </div>
      </form>
    </div>
  );
}
