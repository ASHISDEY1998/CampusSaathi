"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  GraduationCap,
  Sparkles,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  AlertCircle,
  CheckCircle2,
  KeyRound,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const [role, setRole] = useState<"STUDENT" | "TEACHER" | "ADMIN">("STUDENT");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fillCredentials = (
    selectedRole: "STUDENT" | "TEACHER" | "ADMIN",
    id: string,
    pass: string
  ) => {
    setRole(selectedRole);
    setIdentifier(id);
    setPassword(pass);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!identifier.trim() || !password) {
      setErrorMessage("Please enter both ID and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: identifier.trim(),
          password,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMessage(`Signed in as ${data.user.name}. Redirecting...`);

        // Redirect based on role or callbackUrl
        const destination =
          callbackUrl ||
          (data.user.role === "ADMIN" ? "/admin" : "/dashboard");

        setTimeout(() => {
          router.push(destination);
          router.refresh();
        }, 600);
      } else {
        setErrorMessage(data.error || "Authentication failed. Please try again.");
      }
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(error.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
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
        <div
          className="flex rounded-xl bg-slate-900/90 p-1 border border-slate-800 mb-5"
          role="tablist"
          aria-label="Login Role Selection"
        >
          <button
            type="button"
            role="tab"
            aria-selected={role === "STUDENT"}
            onClick={() => {
              setRole("STUDENT");
              setErrorMessage(null);
            }}
            className={`flex-1 min-h-[40px] rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
              role === "STUDENT"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <GraduationCap className="h-3.5 w-3.5" />
            Student
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={role === "TEACHER"}
            onClick={() => {
              setRole("TEACHER");
              setErrorMessage(null);
            }}
            className={`flex-1 min-h-[40px] rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
              role === "TEACHER"
                ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <User className="h-3.5 w-3.5" />
            Teacher
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={role === "ADMIN"}
            onClick={() => {
              setRole("ADMIN");
              setErrorMessage(null);
            }}
            className={`flex-1 min-h-[40px] rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
              role === "ADMIN"
                ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Shield className="h-3.5 w-3.5" />
            Admin
          </button>
        </div>

        {/* Quick Demo Autofill Bar */}
        <div className="mb-5 rounded-xl bg-slate-900/50 border border-slate-800/80 p-2.5">
          <div className="flex items-center justify-between text-[11px] mb-2 px-1">
            <span className="text-slate-400 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-cyan-400" />
              1-Tap Demo Credentials:
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => fillCredentials("ADMIN", "admin", "admin")}
              className="py-1 px-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-[10px] font-semibold text-amber-300 transition-colors text-center"
            >
              👑 Admin (admin)
            </button>
            <button
              type="button"
              onClick={() =>
                fillCredentials("STUDENT", "STU2024CSE001", "DemoPass@2024")
              }
              className="py-1 px-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-[10px] font-semibold text-indigo-300 transition-colors text-center"
            >
              🎓 Student
            </button>
            <button
              type="button"
              onClick={() =>
                fillCredentials("TEACHER", "EMP1001", "FacultyPass@2024")
              }
              className="py-1 px-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-[10px] font-semibold text-cyan-300 transition-colors text-center"
            >
              👨‍🏫 Teacher
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Identifier Input */}
          <div>
            <label
              htmlFor="identifier"
              className="block text-xs font-semibold text-slate-300 mb-1.5"
            >
              {role === "STUDENT"
                ? "Student ID / Roll No."
                : role === "TEACHER"
                ? "Employee ID"
                : "Administrator ID"}
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                {role === "ADMIN" ? (
                  <KeyRound className="h-4 w-4" />
                ) : (
                  <User className="h-4 w-4" />
                )}
              </div>
              <input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={
                  role === "STUDENT"
                    ? "e.g. STU2024CSE001"
                    : role === "TEACHER"
                    ? "e.g. EMP1001"
                    : "e.g. admin"
                }
                className="w-full min-h-[44px] rounded-xl bg-slate-900/90 border border-slate-700/80 pl-9 pr-3 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-colors font-mono"
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
                className="w-full min-h-[44px] rounded-xl bg-slate-900/90 border border-slate-700/80 pl-9 pr-11 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-colors font-mono"
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

          {/* Error Message */}
          {errorMessage && (
            <div className="rounded-xl bg-rose-950/70 border border-rose-500/40 p-3 text-xs text-rose-300 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="rounded-xl bg-emerald-950/70 border border-emerald-500/40 p-3 text-xs text-emerald-300 flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full min-h-[48px] font-bold text-sm"
            disabled={loading}
          >
            <span>{loading ? "Verifying Credentials..." : "Sign In to CampusSaathi"}</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>

        {/* Security / Architecture Footer */}
        <div className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-slate-500">
          <Shield className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
          <span>MongoDB Atlas Bcrypt & Stateless JWT Session</span>
        </div>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="py-12 text-center text-xs text-slate-400">
          Loading CampusSaathi Portal...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
