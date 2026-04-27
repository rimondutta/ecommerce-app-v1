"use client";

import { useState, useEffect } from "react";
import { UserPlus, Trash2, Shield, ShieldCheck, Loader2, Copy, CheckCircle, AlertCircle, KeyRound } from "lucide-react";

interface Admin {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function InviteAdminPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("manager");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string; tempPassword?: string } | null>(null);

  useEffect(() => {
    fetchAdmins();
  }, []);

  async function fetchAdmins() {
    try {
      const res = await fetch("/api/admin/invite");
      const data = await res.json();
      if (data.admins) setAdmins(data.admins);
    } catch {
      console.error("Failed to fetch admins");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Something went wrong" });
        return;
      }

      setMessage({
        type: "success",
        text: data.message,
        tempPassword: data.tempPassword,
      });
      setName("");
      setEmail("");
      setRole("manager");
      fetchAdmins();
    } catch {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove(id: string, adminName: string) {
    if (!confirm(`Are you sure you want to remove ${adminName}?`)) return;

    try {
      const res = await fetch(`/api/admin/invite?id=${id}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.error });
        return;
      }

      setMessage({ type: "success", text: `${adminName} has been removed` });
      fetchAdmins();
    } catch {
      setMessage({ type: "error", text: "Failed to remove admin" });
    }
  }

  async function handleResetPassword(id: string, adminName: string) {
    if (!confirm(`Reset password for ${adminName}? They will receive a new temporary password via email.`)) return;

    setMessage(null);

    try {
      const res = await fetch("/api/admin/invite", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: id }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Failed to reset password" });
        return;
      }

      setMessage({
        type: "success",
        text: data.message,
        tempPassword: data.tempPassword,
      });
    } catch {
      setMessage({ type: "error", text: "Network error. Please try again." });
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setMessage(prev => prev ? { ...prev, text: prev.text + " (Copied!)" } : null);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#202223]">Admin Management</h1>
      </div>

      {/* Status Message */}
      {message && (
        <div
          className={`flex items-start gap-3 p-4 rounded-xl border ${
            message.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle size={20} className="mt-0.5 shrink-0" />
          ) : (
            <AlertCircle size={20} className="mt-0.5 shrink-0" />
          )}
          <div className="flex-1">
            <p className="text-sm font-medium">{message.text}</p>
            {message.tempPassword && (
              <div className="mt-2 flex items-center gap-2 bg-white p-2 rounded border">
                <span className="text-xs text-gray-500">Temp Password:</span>
                <code className="text-sm font-mono font-bold">{message.tempPassword}</code>
                <button
                  onClick={() => copyToClipboard(message.tempPassword!)}
                  className="ml-auto p-1 hover:bg-gray-100 rounded"
                  title="Copy password"
                >
                  <Copy size={14} />
                </button>
              </div>
            )}
          </div>
          <button onClick={() => setMessage(null)} className="text-sm opacity-50 hover:opacity-100">
            ✕
          </button>
        </div>
      )}

      {/* Invite Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-6">
        <div className="flex items-center gap-2 mb-4">
          <UserPlus size={20} className="text-[#008060]" />
          <h2 className="text-lg font-semibold text-[#202223]">Invite New Admin</h2>
        </div>
        <p className="text-gray-500 text-sm mb-6">
          Send an invitation to a new administrator. They will receive an email with login credentials.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008060] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008060] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008060] focus:border-transparent"
            >
              <option value="admin">Full Admin</option>
              <option value="manager">Manager (Products & Orders)</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={submitting || !name.trim() || !email.trim()}
            className="bg-[#008060] hover:bg-[#006e52] disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <UserPlus size={16} />
                Send Invitation
              </>
            )}
          </button>
        </form>
      </div>

      {/* Admin List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-[#202223]">Current Admins</h2>
          <p className="text-sm text-gray-500 mt-1">
            {admins.length} administrator{admins.length !== 1 ? "s" : ""} with dashboard access
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-gray-400" />
          </div>
        ) : admins.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Shield size={40} className="mx-auto mb-3 opacity-30" />
            <p>No admins found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {admins.map((admin) => (
              <div
                key={admin._id}
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#008060]/10 flex items-center justify-center">
                    {admin.role === "admin" ? (
                      <ShieldCheck size={18} className="text-[#008060]" />
                    ) : (
                      <Shield size={18} className="text-blue-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-[#202223]">{admin.name}</p>
                    <p className="text-sm text-gray-500">{admin.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      admin.role === "admin"
                        ? "bg-[#008060]/10 text-[#008060]"
                        : "bg-blue-50 text-blue-600"
                    }`}
                  >
                    {admin.role === "admin" ? "Full Admin" : "Manager"}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(admin.createdAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => handleResetPassword(admin._id, admin.name)}
                    className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                    title="Reset password"
                  >
                    <KeyRound size={16} />
                  </button>
                  <button
                    onClick={() => handleRemove(admin._id, admin.name)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove admin"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
