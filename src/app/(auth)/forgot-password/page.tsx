"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, X, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to request password reset.");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/reset-password?email=${encodeURIComponent(email)}`);
      }, 1500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center p-4 py-12">
      <div className="relative w-full max-w-[440px] bg-white rounded-[32px] p-7 sm:p-9 shadow-2xl border border-[#F4ECE6]">
        {/* Top-Right Circular Close / Home Button */}
        <Link
          href="/login"
          className="absolute top-5 right-5 sm:top-6 sm:right-6 w-10 h-10 rounded-full bg-[#F5EDE8] hover:bg-[#EBDDD4] flex items-center justify-center text-[#2A1810] transition-colors"
          aria-label="Back to sign in"
        >
          <X className="w-4 h-4" strokeWidth={2.5} />
        </Link>

        {/* Top-Left Decorative Double Slanted Accent */}
        <div className="flex items-center gap-1 mb-3 text-[#2A1810]">
          <svg width="22" height="18" viewBox="0 0 22 18" fill="none">
            <line x1="6" y1="2" x2="2" y2="16" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="16" y1="2" x2="12" y2="16" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
          </svg>
        </div>

        {/* Header: Title & Subtitle */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-[28px] font-bold text-[#2A1810] tracking-tight">
            Forgot Password
          </h1>
          <p className="text-sm text-[#78716C] mt-1 font-normal">
            Enter your email to receive a password reset code
          </p>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-2xl text-xs sm:text-sm font-medium mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
            <span>Code sent! Redirecting...</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-medium mb-4">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#2A1810] mb-1.5">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={loading}
              className="w-full bg-white text-[#2A1810] placeholder:text-[#A8A29E] text-sm rounded-full border border-gray-200 hover:border-gray-300 focus:border-[#2A1810] focus:ring-1 focus:ring-[#2A1810] px-5 py-3 outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full bg-[#2A1810] hover:bg-[#1E110A] text-white font-bold py-3.5 rounded-full text-sm sm:text-base shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sending Code...</span>
              </>
            ) : (
              "Send Reset Code"
            )}
          </button>

          <div className="pt-2 text-center text-xs sm:text-sm text-[#78716C]">
            Remember your password?{" "}
            <Link
              href="/login"
              className="font-bold text-[#2A1810] underline underline-offset-2 hover:opacity-80 transition-opacity ml-1"
            >
              Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
