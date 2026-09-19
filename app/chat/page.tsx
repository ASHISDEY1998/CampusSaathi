"use client";

import { useState } from "react";
import {
  Sparkles,
  Send,
  Bot,
  RotateCcw,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const SUGGESTED_QUESTIONS = [
  "What are my marks?",
  "When is my next exam?",
  "What are the library timings?",
  "I have a classroom issue",
];

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [submittedPrompt, setSubmittedPrompt] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Do NOT generate fake AI responses. Clearly inform of Stage 1 status.
    setSubmittedPrompt(input.trim());
    setInput("");
  };

  const handleReset = () => {
    setSubmittedPrompt(null);
    setInput("");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] md:h-[calc(100vh-6.5rem)] max-w-4xl mx-auto">
      {/* AI Assistant Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-cyan-400 text-white shadow-md shadow-cyan-500/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-white">
                CampusSaathi AI Assistant
              </h1>
              <Badge variant="cyan">Stage 1 Shell</Badge>
            </div>
            <p className="text-[11px] text-slate-400">
              Future integration: Gemini Flash • College RAG • Intent Router
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-xl border border-slate-800 hover:bg-slate-900 transition-colors min-h-[38px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Reset View</span>
        </button>
      </div>

      {/* Chat Area (Empty Conversation State) */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 flex flex-col justify-center items-center text-center p-4">
        {/* Assistant Avatar & Welcoming Empty State */}
        <div className="max-w-md space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 border border-indigo-500/40 text-cyan-400 shadow-xl shadow-indigo-950/60">
            <Bot className="h-8 w-8" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-lg font-bold text-white">
              How can CampusSaathi assist you today?
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              This screen provides the visual structure for your conversational assistant. In Stage 4 & 5, natural language queries will be routed dynamically between MongoDB private data and vector-indexed college documents.
            </p>
          </div>

          {/* Suggested Question Chips */}
          <div className="pt-2">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2.5">
              Suggested Example Prompts
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTED_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setInput(q)}
                  className="rounded-xl bg-slate-900/90 hover:bg-indigo-950 border border-slate-800 hover:border-cyan-500/50 px-3 py-2 text-xs text-slate-300 hover:text-cyan-300 transition-all text-left active:scale-95 min-h-[44px] flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                >
                  <Sparkles className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                  <span>{q}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Input Feedback (No fake AI responses) */}
          {submittedPrompt && (
            <div className="mt-4 rounded-2xl bg-indigo-950/70 border border-indigo-500/40 p-4 text-left space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                <Info className="h-4 w-4 text-cyan-400 shrink-0" />
                <span>Input Registered: &quot;{submittedPrompt}&quot;</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Stage 1 Visual Shell Notice: No mock response is generated. Real-time Gemini 2.0/3.6 Flash streaming and grounded source citations will be connected in Stages 4 & 5.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Message Composer & Send Button (Fixed Bottom) */}
      <div className="pt-3 border-t border-slate-800/80 shrink-0">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type an academic question or classroom issue..."
              className="w-full min-h-[46px] rounded-2xl bg-slate-900/90 border border-slate-700/80 pl-4 pr-10 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-colors"
            />
          </div>

          <Button
            type="submit"
            size="md"
            disabled={!input.trim()}
            className="min-w-[46px] min-h-[46px] px-3.5 shrink-0 rounded-2xl"
            aria-label="Send Prompt"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>

        <div className="mt-2 text-center text-[10px] text-slate-500">
          CampusSaathi AI Engine • Zero Hallucination • Verified Institutional Context
        </div>
      </div>
    </div>
  );
}
