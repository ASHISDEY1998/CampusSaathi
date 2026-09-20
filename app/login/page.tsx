"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanId = identifier.trim();
    if (!cleanId || !password) {
      setErrorMessage("Please enter both your ID and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: cleanId,
          password,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const user = data.data?.user || data.user;
        setSuccessMessage(`Welcome back, ${user.name}. Redirecting...`);

        // Server-verified role determines landing destination
        const destination =
          callbackUrl ||
          (user.role === "ADMIN" ? "/admin" : "/dashboard");

        setTimeout(() => {
          router.push(destination);
          router.refresh();
        }, 500);
      } else {
        const message =
          data.error?.message ||
          (res.status === 401 ? "Invalid ID or password." : "Unable to sign in right now. Please try again.");
        setErrorMessage(message);
      }
    } catch {
      setErrorMessage("Unable to sign in right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Brand Header */}
      <div className="text-center mb-6">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm mb-3 overflow-hidden p-1.5 transition-colors">
          <Image
            src="/branding/campussaathi-mark.svg"
            alt="CampusSaathi Mark"
            width={48}
            height={48}
            className="h-full w-full object-contain"
            priority
          />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center justify-center gap-1">
          Campus<span className="text-sky-500">Saathi</span>
        </h1>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 font-medium tracking-wide">
          Your Intelligent Campus Companion
        </p>
      </div>

      {/* Production Login Card */}
      <Card className="p-6 sm:p-8">
        <div className="mb-5">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
            Welcome back
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Sign in with your institutional credentials
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Unified Identifier Input */}
          <div>
            <label
              htmlFor="identifier"
              className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
            >
              Student ID / Employee ID
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400 dark:text-zinc-500">
                <User className="h-4 w-4" />
              </div>
              <input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. STU2024CSE001 or EMP1001"
                required
                autoComplete="username"
                className="w-full min-h-[44px] rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 pl-10 pr-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-colors"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowHelpModal(true)}
                className="text-[11px] font-medium text-sky-500 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400 dark:text-zinc-500">
                <Lock className="h-4 w-4" />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                className="w-full min-h-[44px] rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 pl-10 pr-10 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
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
            className="w-full min-h-[44px] font-semibold text-sm justify-center mt-2"
            disabled={loading}
          >
            <span>{loading ? "Authenticating..." : "Sign In"}</span>
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </form>
      </Card>

      {/* Forgot Password Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <Card className="max-w-sm w-full p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-sky-500" />
                <h3 className="font-semibold text-sm text-zinc-900 dark:text-white">
                  Credential Assistance
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
              For security reasons, password resets are handled through your campus administration. Please contact your institution&apos;s Academic Office or IT Helpdesk with your student ID or employee number.
            </p>
            <Button
              type="button"
              variant="outline"
              className="w-full text-xs min-h-[38px] justify-center"
              onClick={() => setShowHelpModal(false)}
            >
              Close
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="py-12 text-center text-xs text-zinc-400">
          Loading CampusSaathi Portal...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
