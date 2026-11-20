"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, X, CheckCircle } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") || "";

  // Steps: 1 = OTP, 2 = New Password, 3 = Success
  const [step, setStep] = useState(1);

  // Step 1 State
  const [email, setEmail] = useState(initialEmail);
  const [prevInitialEmail, setPrevInitialEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");

  if (initialEmail !== prevInitialEmail) {
    setPrevInitialEmail(initialEmail);
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }

  // Step 2 State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify-reset-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Invalid reset code.");
      }

      setResetToken(data.resetToken);
      setStep(2); // Move to password reset step
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetToken, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to reset password.");
      }

      setStep(3); // Success
      setTimeout(() => router.push("/login"), 2500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (step === 3) {
    return (
      <div className="text-center py-6 space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="text-green-600 w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-[#2A1810]">Password Reset!</h2>
        <p className="text-sm text-[#78716C]">Your password has been successfully updated.</p>
        <p className="text-xs text-gray-400">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-[28px] font-bold text-[#2A1810] tracking-tight">
          {step === 1 ? "Enter Reset Code" : "Set New Password"}
        </h1>
        <p className="text-sm text-[#78716C] mt-1 font-normal">
          {step === 1
            ? "We sent a 6-digit code to your email. Enter it below to verify your identity."
            : "Please enter your new password below."}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-medium mb-4">
          {error}
        </div>
      )}

      {step === 1 ? (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          {!initialEmail && (
            <div>
              <label className="block text-xs font-bold text-[#2A1810] mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white text-[#2A1810] placeholder:text-[#A8A29E] text-sm rounded-full border border-gray-200 hover:border-gray-300 focus:border-[#2A1810] focus:ring-1 focus:ring-[#2A1810] px-5 py-3 outline-none transition-all"
                placeholder="you@example.com"
                required
                disabled={loading}
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#2A1810] mb-1.5">6-Digit Code</label>
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className="w-full bg-white text-[#2A1810] rounded-full border border-gray-200 px-5 py-3 text-center tracking-[0.5em] text-lg font-mono focus:border-[#2A1810] focus:ring-1 focus:ring-[#2A1810] outline-none transition-all"
              placeholder="000000"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6 || !email}
            className="w-full bg-[#2A1810] hover:bg-[#1E110A] text-white font-bold py-3.5 rounded-full text-sm sm:text-base shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
              </>
            ) : (
              "Verify Code"
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#2A1810] mb-1.5">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-white text-[#2A1810] placeholder:text-[#A8A29E] text-sm rounded-full border border-gray-200 hover:border-gray-300 focus:border-[#2A1810] focus:ring-1 focus:ring-[#2A1810] px-5 py-3 outline-none transition-all"
              placeholder="At least 8 characters"
              minLength={8}
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2A1810] mb-1.5">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-white text-[#2A1810] placeholder:text-[#A8A29E] text-sm rounded-full border border-gray-200 hover:border-gray-300 focus:border-[#2A1810] focus:ring-1 focus:ring-[#2A1810] px-5 py-3 outline-none transition-all"
              placeholder="Confirm new password"
              minLength={8}
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !newPassword || !confirmPassword}
            className="w-full bg-[#2A1810] hover:bg-[#1E110A] text-white font-bold py-3.5 rounded-full text-sm sm:text-base shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Updating...
              </>
            ) : (
              "Reset Password"
            )}
          </button>
        </form>
      )}

      <div className="pt-4 text-center text-xs sm:text-sm text-[#78716C]">
        <Link
          href="/login"
          className="font-bold text-[#2A1810] underline underline-offset-2 hover:opacity-80 transition-opacity"
        >
          Back to Sign In
        </Link>
      </div>
    </>
  );
}

export default function ResetPasswordPage() {
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

        <Suspense
          fallback={
            <div className="flex items-center justify-center text-gray-500 gap-2 h-32">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
