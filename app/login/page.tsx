"use client";

import { useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Sparkles,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function LoginPage() {
  const [role, setRole] = useState<"STUDENT" | "TEACHER">("STUDENT");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Do not fake authentication. Inform user of Stage 1 status.
    setSubmittedMessage(
      "Stage 1 UI Preview: Real JWT authentication and bcrypt verification will be connected in Stage 3."
    );
  };

  return (
    <div className="w-full max-w-md">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 border border-indigo-500/40 shadow-xl shadow-indigo-950/60 mb-4">
          <GraduationCap className="h-7 w-7 text-cyan-400" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center justify-center gap-1.5">
          Campus<span className="text-cyan-400">Saathi</span>
        </h1>
        <p className="mt-1 text-xs font-medium text-slate-400">
          Your Intelligent College Companion • Science Exhibition Prototype
        </p>
      </div>

      {/* Login Card */}
      <Card className="p-6 sm:p-8">
        {/* Role Toggle */}
        <div className="flex rounded-xl bg-slate-900/90 p-1 border border-slate-800 mb-6" role="tablist" aria-label="Login Role Selection">
          <button
            type="button"
            role="tab"
            aria-selected={role === "STUDENT"}
            onClick={() => {
              setRole("STUDENT");
              setSubmittedMessage(null);
            }}
            className={`flex-1 min-h-[44px] rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
              role === "STUDENT"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <GraduationCap className="h-4 w-4" />
            Student Login
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={role === "TEACHER"}
            onClick={() => {
              setRole("TEACHER");
              setSubmittedMessage(null);
            }}
            className={`flex-1 min-h-[44px] rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
              role === "TEACHER"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <User className="h-4 w-4" />
            Teacher Login
          </button>
        </div>

        {/* Future Demo Login Information Box */}
        <div className="mb-6 rounded-xl bg-slate-900/60 border border-slate-800/80 p-3.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 mb-1">
            <Sparkles className="h-3.5 w-3.5" />
            Stage 1 Architecture Preview
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Role-based authentication via MongoDB and stateless JWT cookies will be activated in Stage 3. For Stage 1 UI review, you can inspect this interface or proceed to the dashboard.
          </p>
        </div>

        {/* Form Placeholder */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Identifier Input */}
          <div>
            <label
              htmlFor="identifier"
              className="block text-xs font-semibold text-slate-300 mb-1.5"
            >
              {role === "STUDENT" ? "Student ID / Roll No." : "Employee ID"}
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <User className="h-4 w-4" />
              </div>
              <input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={
                  role === "STUDENT" ? "e.g. STU2024CSE012" : "e.g. EMP1024"
                }
                className="w-full min-h-[44px] rounded-xl bg-slate-900/90 border border-slate-700/80 pl-9 pr-3 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-colors"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-semibold text-slate-300 mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <Lock className="h-4 w-4" />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full min-h-[44px] rounded-xl bg-slate-900/90 border border-slate-700/80 pl-9 pr-11 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-300 min-h-[44px] min-w-[44px] justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-lg"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Feedback message on submit (No fake authentication) */}
          {submittedMessage && (
            <div className="rounded-xl bg-indigo-950/70 border border-indigo-500/40 p-3 text-xs text-cyan-300 flex items-start gap-2">
              <Info className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>{submittedMessage}</span>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full min-h-[48px] font-bold text-sm"
          >
            <span>Sign In (Stage 1 Preview)</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>

        {/* Security / Architecture Footer */}
        <div className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-slate-500">
          <Shield className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
          <span>Stage 3 RBAC • No plaintext credentials</span>
        </div>
      </Card>

      {/* Direct link to explore dashboard */}
      <div className="mt-6 text-center">
        <Link
          href="/dashboard"
          className="text-xs text-cyan-400/90 hover:text-cyan-300 transition-colors inline-flex items-center gap-1.5 min-h-[44px] px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-lg"
        >
          <span>Continue to Dashboard Preview</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
