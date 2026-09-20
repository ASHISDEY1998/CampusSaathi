"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  GraduationCap,
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
      <div className="text-center mb-6">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm mb-3 transition-colors">
          <GraduationCap className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center justify-center gap-1">
          Campus<span className="text-sky-500">Saathi</span>
        </h1>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Official Academic Portal Authentication
        </p>
      </div>

      {/* Login Card */}
      <Card className="p-6 sm:p-8">
        {/* Role Selection Tabs */}
        <div
          className="flex rounded-lg bg-zinc-100 dark:bg-zinc-900 p-1 border border-zinc-200 dark:border-zinc-800 mb-5"
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
            className={`flex-1 min-h-[38px] rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
              role === "STUDENT"
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-semibold shadow-xs"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
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
            className={`flex-1 min-h-[38px] rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
              role === "TEACHER"
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-semibold shadow-xs"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            <User className="h-3.5 w-3.5" />
            Faculty
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={role === "ADMIN"}
            onClick={() => {
              setRole("ADMIN");
              setErrorMessage(null);
            }}
            className={`flex-1 min-h-[38px] rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
              role === "ADMIN"
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-semibold shadow-xs"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            <Shield className="h-3.5 w-3.5" />
            Admin
          </button>
        </div>

        {/* Quick Credentials Autofill */}
        <div className="mb-5 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 p-2.5">
          <div className="flex items-center justify-between text-[11px] mb-2 px-1">
            <span className="text-zinc-500 dark:text-zinc-400">
              Quick Test Credentials:
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => fillCredentials("ADMIN", "admin", "admin")}
              className="py-1 px-2 rounded-md bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-[10px] font-medium text-zinc-800 dark:text-zinc-200 transition-colors text-center shadow-xs"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() =>
                fillCredentials("STUDENT", "STU2024CSE001", "DemoPass@2024")
              }
              className="py-1 px-2 rounded-md bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-[10px] font-medium text-zinc-800 dark:text-zinc-200 transition-colors text-center shadow-xs"
            >
              Student
            </button>
            <button
              type="button"
              onClick={() =>
                fillCredentials("TEACHER", "EMP1001", "FacultyPass@2024")
              }
              className="py-1 px-2 rounded-md bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-[10px] font-medium text-zinc-800 dark:text-zinc-200 transition-colors text-center shadow-xs"
            >
              Faculty
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Identifier Input */}
          <div>
            <label
              htmlFor="identifier"
              className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
            >
              {role === "STUDENT"
                ? "Student ID / Roll No."
                : role === "TEACHER"
                ? "Employee ID"
                : "Administrator ID"}
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400 dark:text-zinc-500">
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
                className="w-full min-h-[44px] rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 pl-9 pr-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-colors font-mono"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400 dark:text-zinc-500">
                <Lock className="h-4 w-4" />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full min-h-[44px] rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 pl-9 pr-11 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-colors font-mono"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 min-h-[44px] min-w-[44px] justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-lg"
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
            <div className="rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 p-3 text-xs text-rose-600 dark:text-rose-400 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 p-3 text-xs text-emerald-600 dark:text-emerald-400 flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            className="w-full min-h-[44px] font-semibold text-sm"
            disabled={loading}
          >
            <span>{loading ? "Authenticating..." : "Sign In to CampusSaathi"}</span>
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </form>

        {/* Security Footer */}
        <div className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-zinc-400 dark:text-zinc-500">
          <Shield className="h-3.5 w-3.5 text-sky-500 shrink-0" />
          <span>MongoDB Atlas Bcrypt & Stateless JWT Authentication</span>
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
