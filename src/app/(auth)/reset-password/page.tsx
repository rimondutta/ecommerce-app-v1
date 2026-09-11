"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowLeft, CheckCircle } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") || "";
  
  // Steps: 1 = OTP, 2 = New Password, 3 = Success
  const [step, setStep] = useState(1);
  
  // Step 1 State
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  
  // Step 2 State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialEmail) setEmail(initialEmail);
  }, [initialEmail]);

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
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
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
      setTimeout(() => router.push("/login"), 3000);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (step === 3) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="text-green-600 w-8 h-8" />
        </div>
        <h1 className="text-2xl font-semibold text-gray-900">Password Reset!</h1>
        <p className="text-sm text-gray-500">Your password has been successfully updated.</p>
        <p className="text-sm text-gray-400">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          {step === 1 ? "Enter Reset Code" : "Set New Password"}
        </h1>
        <p className="text-sm text-gray-500">
          {step === 1 
            ? "We sent a 6-digit code to your email. Enter it below to verify your identity."
            : "Please enter your new password below."}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm font-medium mb-6">
          {error}
        </div>
      )}

      {step === 1 ? (
        <form onSubmit={handleVerifyOtp} className="space-y-5">
          {!initialEmail && (
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-900">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white text-gray-900 rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none"
                placeholder="you@example.com"
                required
                disabled={loading}
              />
            </div>
          )}
          
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-900">6-Digit Code</label>
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // only numbers
              className="w-full bg-white text-gray-900 rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-center tracking-[0.5em] text-lg font-mono focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none"
              placeholder="000000"
              required
              disabled={loading}
            />
          </div>

          <button 
            type="submit"
            disabled={loading || otp.length !== 6 || !email}
            className="w-full bg-gray-900 text-white font-medium rounded-lg py-2.5 text-sm hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</> : "Verify Code"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-900">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-white text-gray-900 rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none"
              placeholder="At least 8 characters"
              minLength={8}
              required
              disabled={loading}
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-900">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-white text-gray-900 rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none"
              placeholder="Confirm new password"
              minLength={8}
              required
              disabled={loading}
            />
          </div>

          <button 
            type="submit"
            disabled={loading || !newPassword || !confirmPassword}
            className="w-full bg-gray-900 text-white font-medium rounded-lg py-2.5 text-sm hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</> : "Reset Password"}
          </button>
        </form>
      )}
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        
        <Link href="/login" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to login
        </Link>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
          <Suspense fallback={
            <div className="flex items-center justify-center text-gray-500 gap-2 h-32">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          }>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
