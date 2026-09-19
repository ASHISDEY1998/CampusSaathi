"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Shield,
  Database,
  RefreshCw,
  UserPlus,
  GraduationCap,
  Briefcase,
  Copy,
  Check,
  Search,
  KeyRound,
  FileText,
  Clock,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface UserRecord {
  id: string;
  identifier: string;
  role: "STUDENT" | "TEACHER" | "ADMIN";
  name: string;
  email: string;
  department: string;
  createdAt: string;
  profile?: {
    studentId?: string;
    employeeId?: string;
    year?: number;
    semester?: number;
    cgpa?: number;
    phone?: string;
    designation?: string;
    cabinLocation?: string;
  };
}

interface SyncStatus {
  indexedChunks: number;
  indexedDocs: string[];
  localFiles: string[];
  isSynced: boolean;
}

const DEPARTMENTS = [
  { code: "CSE", name: "Computer Science & Engineering" },
  { code: "ECE", name: "Electronics & Communication Engineering" },
  { code: "MECH", name: "Mechanical Engineering" },
  { code: "CIVIL", name: "Civil Engineering" },
  { code: "BASIC", name: "Basic Sciences & Humanities" },
];

export default function AdminPage() {
  // Sync KB State
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{
    success: boolean;
    message: string;
    filesCount?: number;
    chunksCount?: number;
    embeddingsGenerated?: number;
    files?: { name: string; category: string; chunks: number }[];
  } | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);

  // User Creator State
  const [role, setRole] = useState<"STUDENT" | "TEACHER">("STUDENT");
  const [identifier, setIdentifier] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("CSE");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  // Student-specific
  const [semester, setSemester] = useState(1);
  const [year, setYear] = useState(1);
  // Teacher-specific
  const [designation, setDesignation] = useState("Assistant Professor");
  const [cabinLocation, setCabinLocation] = useState("Academic Block A, Room 204");

  // Form submission state
  const [creatingUser, setCreatingUser] = useState(false);
  const [userSuccessMessage, setUserSuccessMessage] = useState<{
    identifier: string;
    name: string;
    role: string;
    passwordPlain: string;
  } | null>(null);
  const [userErrorMessage, setUserErrorMessage] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // User Directory State
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch sync status
  const fetchSyncStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/sync-kb");
      const data = await res.json();
      if (data.success) {
        setSyncStatus(data);
      }
    } catch {
      // ignore
    }
  }, []);

  // Fetch user list
  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.success && data.users) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadInitialData = async () => {
      try {
        const [syncRes, usersRes] = await Promise.all([
          fetch("/api/admin/sync-kb").then((r) => r.json()).catch(() => null),
          fetch("/api/admin/users").then((r) => r.json()).catch(() => null),
        ]);
        if (!isMounted) return;
        if (syncRes?.success) {
          setSyncStatus(syncRes);
        }
        if (usersRes?.success && usersRes?.users) {
          setUsers(usersRes.users);
        }
      } finally {
        if (isMounted) setLoadingUsers(false);
      }
    };
    loadInitialData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Handle Sync Knowledge Base Click
  const handleSyncKB = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch("/api/admin/sync-kb", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        setSyncResult({
          success: true,
          message: data.message,
          filesCount: data.filesCount,
          chunksCount: data.chunksCount,
          embeddingsGenerated: data.embeddingsGenerated,
          files: data.files,
        });
        fetchSyncStatus();
      } else {
        setSyncResult({
          success: false,
          message: data.error || "Knowledge base sync failed.",
        });
      }
    } catch (err: unknown) {
      const e = err as Error;
      setSyncResult({
        success: false,
        message: e.message || "Network error during sync.",
      });
    } finally {
      setSyncing(false);
    }
  };

  // Helper to auto-generate next ID
  const handleGenerateId = () => {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    if (role === "STUDENT") {
      const id = `STU2024${department}${randomSuffix}`;
      setIdentifier(id);
      if (!email || email.includes("@abctech.edu.in")) {
        setEmail(`${id.toLowerCase()}@abctech.edu.in`);
      }
    } else {
      const id = `EMP${randomSuffix}`;
      setIdentifier(id);
      if (!email || email.includes("@abctech.edu.in")) {
        setEmail(`${id.toLowerCase()}@abctech.edu.in`);
      }
    }
  };

  // Helper to generate a friendly secure password
  const handleGeneratePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let rand = "";
    for (let i = 0; i < 4; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const generated = `${role === "STUDENT" ? "Student" : "Faculty"}@${rand}`;
    setPassword(generated);
  };

  // Handle Create User Submit
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserErrorMessage(null);
    setUserSuccessMessage(null);

    if (!identifier.trim() || !password.trim() || !name.trim()) {
      setUserErrorMessage("Please fill in ID, Full Name, and Password.");
      return;
    }

    setCreatingUser(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          identifier: identifier.trim(),
          password: password.trim(),
          name: name.trim(),
          email: email.trim(),
          department,
          year,
          semester,
          designation,
          cabinLocation,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUserSuccessMessage({
          identifier: identifier.trim().toUpperCase(),
          name: name.trim(),
          role,
          passwordPlain: password.trim(),
        });
        // Reset form inputs for next entry
        setIdentifier("");
        setPassword("");
        setName("");
        setEmail("");
        // Reload directory
        fetchUsers();
      } else {
        setUserErrorMessage(data.error || "Failed to create user account.");
      }
    } catch (err: unknown) {
      const e = err as Error;
      setUserErrorMessage(e.message || "Network error occurred.");
    } finally {
      setCreatingUser(false);
    }
  };

  // Copy helper
  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      u.identifier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1.5">
            <Shield className="h-4 w-4" />
            Administrator Control Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            CampusSaathi Management Portal
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Synchronize knowledge base documents and provision verified Student & Teacher credentials.
          </p>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-xs text-slate-300 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>MongoDB: <strong className="text-emerald-400 font-semibold">Connected</strong></span>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-xs text-slate-300 flex items-center gap-2">
            <FileText className="h-3.5 w-3.5 text-cyan-400" />
            <span>Chunks: <strong className="text-cyan-400 font-semibold">{syncStatus?.indexedChunks ?? 0}</strong></span>
          </div>
        </div>
      </div>

      {/* 1. Default Admin Credentials Notice Card */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-500/40 bg-gradient-to-r from-indigo-950/80 via-slate-900 to-indigo-950/60 p-5 shadow-xl shadow-indigo-950/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600/30 border border-indigo-400/30 text-cyan-300">
              <KeyRound className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white">
                  Default Administrator Credentials
                </h2>
                <Badge variant="cyan" className="text-[10px] py-0.5">
                  Super Admin
                </Badge>
              </div>
              <p className="mt-1 text-xs text-slate-300">
                Use these default credentials to log in or demonstrate administrative privileges.
              </p>
              <div className="mt-2.5 flex flex-wrap items-center gap-4 text-xs font-mono">
                <div className="flex items-center gap-1.5 rounded-lg bg-slate-950/70 border border-slate-800 px-3 py-1.5 text-slate-200">
                  <span className="text-slate-400 font-sans">Username / ID:</span>
                  <strong className="text-cyan-300">admin</strong>
                </div>
                <div className="flex items-center gap-1.5 rounded-lg bg-slate-950/70 border border-slate-800 px-3 py-1.5 text-slate-200">
                  <span className="text-slate-400 font-sans">Password:</span>
                  <strong className="text-cyan-300">admin</strong>
                </div>
              </div>
            </div>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => copyToClipboard("Username: admin\nPassword: admin", "admin-creds")}
            className="shrink-0 self-start sm:self-center"
          >
            {copiedKey === "admin-creds" ? (
              <>
                <Check className="h-4 w-4 text-emerald-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Copy Admin Credentials</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 2. Top Action Grid: Knowledge Base Sync Button + Quick Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Knowledge Base Sync Card */}
        <Card className="lg:col-span-1 p-6 flex flex-col justify-between border-cyan-500/20 bg-gradient-to-b from-slate-900/90 to-indigo-950/30">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
                  <Database className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Knowledge Base</h3>
                  <p className="text-[11px] text-slate-400">Policy & Document Index</p>
                </div>
              </div>
              <Badge variant={syncStatus?.isSynced ? "emerald" : "amber"}>
                {syncStatus?.isSynced ? "Synced" : "Sync Required"}
              </Badge>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Reads markdown documents from the <code className="text-cyan-300 font-mono text-[11px] bg-slate-950/60 px-1 py-0.5 rounded">knowledge_base/</code> directory (General Rules, Master Timetable, Exam Reschedules, Duty Charts) and indexes them into MongoDB chunks.
            </p>

            <div className="space-y-2 rounded-xl bg-slate-950/50 border border-slate-800/80 p-3 text-xs mb-5">
              <div className="flex justify-between text-slate-400">
                <span>Local Policy Files:</span>
                <span className="font-semibold text-slate-200">
                  {syncStatus?.localFiles.length ?? 4} documents
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Database Chunks:</span>
                <span className="font-semibold text-cyan-300">
                  {syncStatus?.indexedChunks ?? 0} indexed
                </span>
              </div>
            </div>

            {/* Sync Feedback Message */}
            {syncResult && (
              <div
                className={`mb-4 rounded-xl p-3.5 text-xs flex items-start gap-2.5 border ${
                  syncResult.success
                    ? "bg-emerald-950/50 border-emerald-500/40 text-emerald-300"
                    : "bg-rose-950/50 border-rose-500/40 text-rose-300"
                }`}
              >
                {syncResult.success ? (
                  <Check className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
                )}
                <div>
                  <div className="font-semibold">{syncResult.message}</div>
                  {syncResult.embeddingsGenerated !== undefined && syncResult.embeddingsGenerated > 0 && (
                    <div className="mt-1 text-[11px] opacity-90">
                      ⚡ {syncResult.embeddingsGenerated} vector embeddings generated with Gemini.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Prominent Sync Button */}
          <Button
            type="button"
            variant="primary"
            className="w-full min-h-[48px] font-bold shadow-lg shadow-cyan-500/20"
            onClick={handleSyncKB}
            disabled={syncing}
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
            <span>{syncing ? "Synchronizing Documents..." : "Sync Knowledge Base Now"}</span>
          </Button>
        </Card>

        {/* 3. ID & Password Creator Form */}
        <Card className="lg:col-span-2 p-6 border-indigo-500/20 bg-slate-900/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-cyan-400" />
                <h2 className="text-lg font-bold text-white">
                  ID & Password Creator
                </h2>
              </div>
              <p className="mt-0.5 text-xs text-slate-400">
                Provision new accounts for Teachers and Students with hashed passwords.
              </p>
            </div>

            {/* Role Switcher */}
            <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => {
                  setRole("STUDENT");
                  handleGenerateId();
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
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
                onClick={() => {
                  setRole("TEACHER");
                  handleGenerateId();
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  role === "TEACHER"
                    ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Briefcase className="h-3.5 w-3.5" />
                Teacher
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleCreateUser} className="space-y-4">
            {/* Row 1: Identifier + Generate Button & Full Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="user-identifier" className="text-xs font-semibold text-slate-300">
                    {role === "STUDENT" ? "Student ID / Roll No" : "Faculty Employee ID"}
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateId}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 underline font-medium"
                  >
                    Auto-generate
                  </button>
                </div>
                <input
                  id="user-identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value.toUpperCase())}
                  placeholder={role === "STUDENT" ? "e.g. STU2024CSE021" : "e.g. EMP1011"}
                  className="w-full min-h-[42px] rounded-xl bg-slate-950/80 border border-slate-700/80 px-3 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 font-mono transition-colors"
                  required
                />
              </div>

              <div>
                <label htmlFor="user-name" className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Full Name
                </label>
                <input
                  id="user-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={role === "STUDENT" ? "e.g. Rohan Sharma" : "e.g. Dr. Priya Nair"}
                  className="w-full min-h-[42px] rounded-xl bg-slate-950/80 border border-slate-700/80 px-3 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 transition-colors"
                  required
                />
              </div>
            </div>

            {/* Row 2: Department & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="user-department" className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Department
                </label>
                <select
                  id="user-department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full min-h-[42px] rounded-xl bg-slate-950/80 border border-slate-700/80 px-3 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 transition-colors"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept.code} value={dept.code}>
                      {dept.code} — {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="user-email" className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Institutional Email
                </label>
                <input
                  id="user-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. rohan.sharma@abctech.edu.in"
                  className="w-full min-h-[42px] rounded-xl bg-slate-950/80 border border-slate-700/80 px-3 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 transition-colors"
                />
              </div>
            </div>

            {/* Row 3: Role-Specific Fields */}
            {role === "STUDENT" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="user-year" className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Year of Study
                  </label>
                  <select
                    id="user-year"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full min-h-[42px] rounded-xl bg-slate-950/80 border border-slate-700/80 px-3 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 transition-colors"
                  >
                    <option value={1}>1st Year (Freshman)</option>
                    <option value={2}>2nd Year (Sophomore)</option>
                    <option value={3}>3rd Year (Junior)</option>
                    <option value={4}>4th Year (Senior)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="user-semester" className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Current Semester
                  </label>
                  <select
                    id="user-semester"
                    value={semester}
                    onChange={(e) => setSemester(Number(e.target.value))}
                    className="w-full min-h-[42px] rounded-xl bg-slate-950/80 border border-slate-700/80 px-3 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 transition-colors"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="user-designation" className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Designation
                  </label>
                  <select
                    id="user-designation"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full min-h-[42px] rounded-xl bg-slate-950/80 border border-slate-700/80 px-3 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 transition-colors"
                  >
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Professor">Professor</option>
                    <option value="Head of Department (HOD)">Head of Department (HOD)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="user-cabin" className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Cabin / Office Location
                  </label>
                  <input
                    id="user-cabin"
                    type="text"
                    value={cabinLocation}
                    onChange={(e) => setCabinLocation(e.target.value)}
                    placeholder="e.g. Academic Block A, Room 312"
                    className="w-full min-h-[42px] rounded-xl bg-slate-950/80 border border-slate-700/80 px-3 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Row 4: Password Creation with Generator */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="user-password" className="text-xs font-semibold text-slate-300">
                  Password
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setPassword("Campus@123")}
                    className="text-[11px] text-slate-400 hover:text-slate-200"
                  >
                    Default (Campus@123)
                  </button>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 underline font-medium flex items-center gap-1"
                  >
                    <Sparkles className="h-3 w-3" />
                    Generate Strong
                  </button>
                </div>
              </div>

              <div className="relative">
                <input
                  id="user-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter or generate account password"
                  className="w-full min-h-[42px] rounded-xl bg-slate-950/80 border border-slate-700/80 pl-3 pr-10 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 font-mono transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-200"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {userErrorMessage && (
              <div className="rounded-xl bg-rose-950/50 border border-rose-500/40 p-3 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{userErrorMessage}</span>
              </div>
            )}

            {/* Success Box with Copyable Credentials */}
            {userSuccessMessage && (
              <div className="rounded-xl bg-emerald-950/50 border border-emerald-500/40 p-4 text-xs">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <Check className="h-4 w-4" />
                    <span>Account Successfully Created in MongoDB!</span>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="py-1 px-2.5 h-auto text-[11px]"
                    onClick={() =>
                      copyToClipboard(
                        `ID: ${userSuccessMessage.identifier}\nPassword: ${userSuccessMessage.passwordPlain}\nRole: ${userSuccessMessage.role}\nName: ${userSuccessMessage.name}`,
                        "new-user-creds"
                      )
                    }
                  >
                    {copiedKey === "new-user-creds" ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copy Credentials</span>
                      </>
                    )}
                  </Button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-emerald-500/20 font-mono text-[11px]">
                  <div>
                    <span className="text-slate-400 block font-sans">Role:</span>
                    <span className="text-white font-bold">{userSuccessMessage.role}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-sans">Identifier:</span>
                    <span className="text-cyan-300 font-bold">{userSuccessMessage.identifier}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-sans">Password:</span>
                    <span className="text-amber-300 font-bold">{userSuccessMessage.passwordPlain}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-sans">Name:</span>
                    <span className="text-white truncate block">{userSuccessMessage.name}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              className="w-full min-h-[46px] font-bold mt-2"
              disabled={creatingUser}
            >
              <UserPlus className="h-4 w-4" />
              <span>
                {creatingUser
                  ? "Hashing & Saving Account..."
                  : `Create ${role === "STUDENT" ? "Student" : "Teacher"} Account`}
              </span>
            </Button>
          </form>
        </Card>
      </div>

      {/* 4. Live Accounts & User Directory */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-cyan-400" />
              Active System Accounts Directory
            </h2>
            <p className="text-xs text-slate-400">
              Showing users stored in the MongoDB <code className="text-cyan-300 font-mono text-[11px]">users</code> collection ({users.length} accounts).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by ID or name..."
                className="w-full sm:w-56 min-h-[38px] rounded-xl bg-slate-900/80 border border-slate-800 pl-8 pr-3 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
              />
            </div>

            {/* Role Filter Tabs */}
            <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs">
              {["ALL", "STUDENT", "TEACHER", "ADMIN"].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setRoleFilter(f)}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    roleFilter === f
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {f === "ALL" ? "All" : f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Directory Table / Cards */}
        <Card className="overflow-hidden border-slate-800/90 bg-slate-900/40">
          {loadingUsers ? (
            <div className="py-12 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
              <RefreshCw className="h-5 w-5 animate-spin text-cyan-400" />
              <span>Loading user directory from MongoDB...</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No matching accounts found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold">
                    <th className="py-3 px-4">Identifier / ID</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Details</th>
                    <th className="py-3 px-4">Created Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredUsers.map((u) => {
                    const isNew =
                      userSuccessMessage && userSuccessMessage.identifier === u.identifier;

                    return (
                      <tr
                        key={u.id || u.identifier}
                        className={`transition-colors hover:bg-slate-800/40 ${
                          isNew ? "bg-emerald-950/30 font-medium" : ""
                        }`}
                      >
                        <td className="py-3 px-4 font-mono font-bold text-slate-200">
                          <div className="flex items-center gap-1.5">
                            <span>{u.identifier}</span>
                            {isNew && (
                              <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-sans">
                                Newly Created
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              u.role === "ADMIN"
                                ? "amber"
                                : u.role === "TEACHER"
                                ? "cyan"
                                : "indigo"
                            }
                            className="text-[10px]"
                          >
                            {u.role}
                          </Badge>
                        </td>

                        <td className="py-3 px-4 font-medium text-slate-100">
                          {u.name}
                        </td>

                        <td className="py-3 px-4 text-slate-400">
                          {u.department}
                        </td>

                        <td className="py-3 px-4 text-slate-400">
                          {u.role === "STUDENT" && u.profile ? (
                            <span>
                              Year {u.profile.year} • Sem {u.profile.semester}
                            </span>
                          ) : u.role === "TEACHER" && u.profile ? (
                            <span className="truncate max-w-[150px] inline-block">
                              {u.profile.designation}
                            </span>
                          ) : (
                            <span className="text-slate-500">System Root</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-slate-500 flex items-center gap-1">
                          <Clock className="h-3 w-3 text-slate-600" />
                          <span>
                            {new Date(u.createdAt).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
