"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  UserPlus,
  Shield,
  Briefcase,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  Users,
  Check,
  XCircle,
} from "lucide-react";

interface StaffUser {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "manager";
  createdAt?: string;
}

export default function AddUserPage() {
  const { data: session } = useSession();
  const currentUserRole = session?.user?.role || "admin";
  const currentUserId = session?.user?.id;

  // Form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "manager">("manager");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // States
  const [loading, setLoading] = useState(false);
  const [fetchingStaff, setFetchingStaff] = useState(true);
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ── Load staff users ────────────────────────────────────────────────────────
  const loadStaffUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setStaffUsers(data.users || []);
      }
    } catch (err) {
      console.error("Failed to load staff users:", err);
    } finally {
      setFetchingStaff(false);
    }
  }, []);

  useEffect(() => {
    loadStaffUsers();
  }, [loadStaffUsers]);

  // ── Submit create user ──────────────────────────────────────────────────────
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();

    if (!cleanFirstName) {
      setError("Please provide a first name.");
      return;
    }
    if (!cleanEmail) {
      setError("Please provide a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: cleanFirstName,
          lastName: cleanLastName,
          name: `${cleanFirstName} ${cleanLastName}`.trim(),
          email: cleanEmail,
          password,
          role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create user.");
      }

      setSuccess(
        `Successfully created ${role === "admin" ? "Administrator" : "Manager"} account for ${cleanEmail}!`
      );
      // Reset form
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setRole("manager");

      // Refresh list
      loadStaffUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // ── Delete staff user ───────────────────────────────────────────────────────
  const handleDeleteUser = async (user: StaffUser) => {
    if (currentUserRole !== "admin") {
      alert("Managers do not have permission to remove users.");
      return;
    }

    if (user._id === currentUserId) {
      alert("You cannot remove your own administrator account.");
      return;
    }

    if (!confirm(`Are you sure you want to remove ${user.name} (${user.email})?`)) {
      return;
    }

    setDeletingId(user._id);
    try {
      const res = await fetch(`/api/admin/users?id=${user._id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to remove user.");
      }

      setStaffUsers((prev) => prev.filter((u) => u._id !== user._id));
      setSuccess(`Removed ${user.name} from staff.`);
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to remove user.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      {/* ── Page Header ── */}
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 bg-gray-900 text-white rounded-xl flex items-center justify-center shadow-xs">
          {currentUserRole === "admin" ? <UserPlus size={20} /> : <Users size={20} />}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {currentUserRole === "admin" ? "Add New User" : "Staff Directory"}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {currentUserRole === "admin" ? (
              <>
                Create store staff accounts: <strong className="text-gray-700">Administrator</strong> or <strong className="text-gray-700">Manager</strong>
              </>
            ) : (
              "View store staff accounts and role assignments"
            )}
          </p>
        </div>
      </div>

      {/* ── Feedback Alerts ── */}
      {error && (
        <div className="flex items-center gap-2.5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl animate-in fade-in">
          <AlertCircle size={18} className="shrink-0 text-red-500" />
          <p className="flex-1 font-medium">{error}</p>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
            <XCircle size={16} />
          </button>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2.5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl animate-in fade-in">
          <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
          <p className="flex-1 font-medium">{success}</p>
          <button onClick={() => setSuccess(null)} className="text-emerald-400 hover:text-emerald-600">
            <XCircle size={16} />
          </button>
        </div>
      )}

      {/* ── Add User Form (Admins Only - Completely Hidden for Managers) ── */}
      {currentUserRole === "admin" ? (
        <div className="bg-white p-6 sm:p-7 rounded-2xl shadow-sm border border-gray-200">
          <form onSubmit={handleCreateUser} className="space-y-5">
            {/* First & Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 block uppercase tracking-wider">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all placeholder:text-gray-400"
                  placeholder="Rimon"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 block uppercase tracking-wider">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all placeholder:text-gray-400"
                  placeholder="Dutta"
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 block uppercase tracking-wider">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all placeholder:text-gray-400"
                placeholder="manager@example.com"
              />
            </div>

            {/* Role Selection (Option 1: Admin, Option 2: Manager) */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700 block uppercase tracking-wider">
                Role <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Option 1: Administrator */}
                <label
                  onClick={() => setRole("admin")}
                  className={`relative flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                    role === "admin"
                      ? "border-gray-900 bg-gray-50/80 shadow-xs"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      role === "admin" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <Shield size={16} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-900">Administrator</span>
                      {role === "admin" && <Check size={16} className="text-gray-900" />}
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1 leading-snug">
                      Full access. Can upload products, setup pixel/courier, and manage or remove staff accounts.
                    </p>
                  </div>
                </label>

                {/* Option 2: Manager */}
                <label
                  onClick={() => setRole("manager")}
                  className={`relative flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                    role === "manager"
                      ? "border-indigo-600 bg-indigo-50/50 shadow-xs"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      role === "manager" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <Briefcase size={16} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-900">Manager</span>
                      {role === "manager" && <Check size={16} className="text-indigo-600" />}
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1 leading-snug">
                      Can upload products, setup pixel & courier. <strong>Cannot remove anyone.</strong>
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 block uppercase tracking-wider">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg py-2.5 px-3 pr-10 text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all placeholder:text-gray-400"
                  placeholder="At least 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Creating user...</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={16} />
                    <span>Create {role === "admin" ? "Administrator" : "Manager"}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3.5">
          <Shield size={20} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-amber-900">Administrator Access Required</h3>
            <p className="text-xs text-amber-700 mt-1 leading-relaxed">
              You are signed in with a <strong>Manager</strong> account. Creating, inviting, or modifying staff accounts is restricted to Administrators only.
            </p>
          </div>
        </div>
      )}

      {/* ── Current Staff Team List ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-gray-500" />
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
              Store Staff Members ({staffUsers.length})
            </h2>
          </div>
          <span className="text-[11px] text-gray-400">
            Admins have full access · Managers cannot remove users
          </span>
        </div>

        {fetchingStaff ? (
          <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-2">
            <Loader2 size={20} className="animate-spin text-gray-600" />
            <span className="text-xs">Loading staff accounts...</span>
          </div>
        ) : staffUsers.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-xs">
            No staff accounts found. Create one above.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {staffUsers.map((user) => {
              const isAdmin = user.role === "admin";
              const isSelf = user._id === currentUserId;

              return (
                <div
                  key={user._id}
                  className="px-6 py-3.5 flex items-center justify-between gap-4 hover:bg-gray-50/60 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs uppercase shrink-0 ${
                        isAdmin
                          ? "bg-gray-900 text-white"
                          : "bg-indigo-100 text-indigo-700"
                      }`}
                    >
                      {user.name ? user.name.slice(0, 2) : "ST"}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900 truncate">
                          {user.name}
                        </span>
                        {isSelf && (
                          <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {/* Role badge */}
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        isAdmin
                          ? "bg-gray-900 text-white"
                          : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                      }`}
                    >
                      {isAdmin ? <Shield size={12} /> : <Briefcase size={12} />}
                      <span>{isAdmin ? "Administrator" : "Manager"}</span>
                    </span>

                    {/* Delete action: Only Admin can remove; Manager cannot remove anyone */}
                    {currentUserRole === "admin" && !isSelf && (
                      <button
                        type="button"
                        onClick={() => handleDeleteUser(user)}
                        disabled={deletingId === user._id}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title={`Remove ${user.name}`}
                      >
                        {deletingId === user._id ? (
                          <Loader2 size={16} className="animate-spin text-red-600" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
