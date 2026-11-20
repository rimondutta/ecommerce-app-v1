"use client";

import React, { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { X, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { useUIStore, AuthModalMode } from "@/store/uiStore";

export default function AuthModal() {
  const { isAuthModalOpen, authModalMode, closeAuthModal, openAuthModal } = useUIStore();
  const router = useRouter();

  const [mode, setMode] = useState<AuthModalMode>(authModalMode || "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToPolicy, setAgreedToPolicy] = useState(true);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<"google" | "github" | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Sync mode with store when opened
  useEffect(() => {
    if (isAuthModalOpen) {
      setMode(authModalMode || "signin");
      setError("");
      setSuccess("");
    }
  }, [isAuthModalOpen, authModalMode]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isAuthModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isAuthModalOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isAuthModalOpen) {
        closeAuthModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToPolicy) {
      setError("Please agree to the Privacy Policy to proceed");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: email.trim().toLowerCase(),
        password,
      });

      if (res?.error) {
        setError("Invalid email or password");
      } else {
        closeAuthModal();
        router.refresh();
        window.location.reload();
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToPolicy) {
      setError("Please agree to the Privacy Policy to proceed");
      return;
    }
    if (!name.trim()) {
      setError("Please enter your full name");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      setSuccess("Account created successfully! Signing you in...");
      // Auto sign in
      const loginRes = await signIn("credentials", {
        redirect: false,
        email: email.trim().toLowerCase(),
        password,
      });

      if (!loginRes?.error) {
        setTimeout(() => {
          closeAuthModal();
          router.refresh();
          window.location.reload();
        }, 800);
      } else {
        setMode("signin");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registration failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to send reset link");
      }

      setSuccess("If an account exists, a password reset link has been sent to your email.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error sending reset link";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setSocialLoading("google");
    setError("");
    try {
      await signIn("google", { callbackUrl: window.location.pathname });
    } catch {
      setError("Google sign-in failed. Please try again.");
      setSocialLoading(null);
    }
  };

  const handleGitHubSignIn = async () => {
    setSocialLoading("github");
    setError("");
    try {
      const res = await signIn("github", { callbackUrl: window.location.pathname, redirect: false });
      if (res?.error) {
        setError("GitHub sign-in is not configured yet. Please use Google or Email.");
        setSocialLoading(null);
      }
    } catch {
      setError("GitHub sign-in failed. Please use Google or Email.");
      setSocialLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Dimmed backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity duration-300"
        onClick={closeAuthModal}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-[440px] bg-white rounded-[32px] p-7 sm:p-9 shadow-2xl z-10 transition-all duration-300 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto no-scrollbar"
      >
        {/* Top-Right Circular Close Button */}
        <button
          type="button"
          onClick={closeAuthModal}
          className="absolute top-5 right-5 sm:top-6 sm:right-6 w-10 h-10 rounded-full bg-[#F5EDE8] hover:bg-[#EBDDD4] flex items-center justify-center text-[#2A1810] transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" strokeWidth={2.5} />
        </button>

        {/* Top-Left Decorative Double Slanted Accent */}
        <div className="flex items-center gap-1 mb-3 text-[#2A1810]">
          <svg width="22" height="18" viewBox="0 0 22 18" fill="none">
            <line x1="6" y1="2" x2="2" y2="16" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="16" y1="2" x2="12" y2="16" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
          </svg>
        </div>

        {/* Header: Title & Subtitle */}
        <div className="mb-6">
          <h2 className="text-2xl sm:text-[28px] font-bold text-[#2A1810] tracking-tight">
            {mode === "signin" && "Sign In"}
            {mode === "signup" && "Create Account"}
            {mode === "forgot" && "Reset Password"}
          </h2>
          <p className="text-sm text-[#78716C] mt-1 font-normal">
            {mode === "signin" && "Continue to access your dashboard"}
            {mode === "signup" && "Join us to manage orders and track shipments"}
            {mode === "forgot" && "Enter your email to receive a password reset link"}
          </p>
        </div>

        {/* Alert Notifications */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-medium mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-medium mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Social Login Buttons (for Sign In & Sign Up) */}
        {mode !== "forgot" && (
          <div className="space-y-3 mb-5">
            {/* Google Pill */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={socialLoading !== null || loading}
              className="w-full flex items-center justify-center gap-3 border border-gray-200 hover:border-gray-300 bg-white rounded-full py-3 px-4 text-sm font-semibold text-[#2A1810] hover:bg-gray-50/80 transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              {socialLoading === "google" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              <span>{mode === "signin" ? "Sign in with Google" : "Sign up with Google"}</span>
            </button>

            {/* GitHub Pill */}
            <button
              type="button"
              onClick={handleGitHubSignIn}
              disabled={socialLoading !== null || loading}
              className="w-full flex items-center justify-center gap-3 border border-gray-200 hover:border-gray-300 bg-white rounded-full py-3 px-4 text-sm font-semibold text-[#2A1810] hover:bg-gray-50/80 transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              {socialLoading === "github" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <svg className="w-4 h-4 shrink-0 fill-[#2A1810]" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              )}
              <span>{mode === "signin" ? "Sign in with GitHub" : "Sign up with GitHub"}</span>
            </button>

            {/* "or" Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-[#78716C] font-normal">or</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
          </div>
        )}

        {/* Forms */}
        {mode === "signin" && (
          <form onSubmit={handleSignIn} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-[#2A1810] mb-1.5">Email</label>
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

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[#2A1810]">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setMode("forgot");
                  }}
                  className="text-xs font-bold text-[#2A1810] underline underline-offset-2 hover:opacity-80 transition-opacity cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                  className="w-full bg-white text-[#2A1810] placeholder:text-[#A8A29E] text-sm rounded-full border border-gray-200 hover:border-gray-300 focus:border-[#2A1810] focus:ring-1 focus:ring-[#2A1810] px-5 py-3 pr-11 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#2A1810] transition-colors p-1 cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Privacy Policy Checkbox */}
            <div className="flex items-center gap-2.5 pt-1">
              <input
                type="checkbox"
                id="modal-privacy-policy"
                checked={agreedToPolicy}
                onChange={(e) => setAgreedToPolicy(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-[#2A1810] accent-[#2A1810] focus:ring-[#2A1810] cursor-pointer"
              />
              <label
                htmlFor="modal-privacy-policy"
                className="text-xs sm:text-sm font-medium text-[#2A1810] cursor-pointer select-none"
              >
                I agree with the Privacy Policy
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2A1810] hover:bg-[#1E110A] text-white font-bold py-3.5 rounded-full text-sm sm:text-base shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                "Sign In"
              )}
            </button>

            {/* Footer */}
            <div className="pt-2 text-center text-xs sm:text-sm text-[#78716C]">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setMode("signup");
                }}
                className="font-bold text-[#2A1810] underline underline-offset-2 hover:opacity-80 transition-opacity cursor-pointer ml-1"
              >
                Create an Account
              </button>
            </div>
          </form>
        )}

        {mode === "signup" && (
          <form onSubmit={handleSignUp} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-[#2A1810] mb-1.5">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
                disabled={loading}
                className="w-full bg-white text-[#2A1810] placeholder:text-[#A8A29E] text-sm rounded-full border border-gray-200 hover:border-gray-300 focus:border-[#2A1810] focus:ring-1 focus:ring-[#2A1810] px-5 py-3 outline-none transition-all"
              />
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-[#2A1810] mb-1.5">Email</label>
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

            {/* Password Field */}
            <div>
              <label className="block text-xs font-bold text-[#2A1810] mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  required
                  disabled={loading}
                  className="w-full bg-white text-[#2A1810] placeholder:text-[#A8A29E] text-sm rounded-full border border-gray-200 hover:border-gray-300 focus:border-[#2A1810] focus:ring-1 focus:ring-[#2A1810] px-5 py-3 pr-11 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#2A1810] transition-colors p-1 cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Privacy Policy Checkbox */}
            <div className="flex items-center gap-2.5 pt-1">
              <input
                type="checkbox"
                id="modal-signup-privacy-policy"
                checked={agreedToPolicy}
                onChange={(e) => setAgreedToPolicy(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-[#2A1810] accent-[#2A1810] focus:ring-[#2A1810] cursor-pointer"
              />
              <label
                htmlFor="modal-signup-privacy-policy"
                className="text-xs sm:text-sm font-medium text-[#2A1810] cursor-pointer select-none"
              >
                I agree with the Privacy Policy
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2A1810] hover:bg-[#1E110A] text-white font-bold py-3.5 rounded-full text-sm sm:text-base shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                "Create Account"
              )}
            </button>

            {/* Footer */}
            <div className="pt-2 text-center text-xs sm:text-sm text-[#78716C]">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setMode("signin");
                }}
                className="font-bold text-[#2A1810] underline underline-offset-2 hover:opacity-80 transition-opacity cursor-pointer ml-1"
              >
                Sign In
              </button>
            </div>
          </form>
        )}

        {mode === "forgot" && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#2A1810] mb-1.5">Email</label>
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
              disabled={loading}
              className="w-full bg-[#2A1810] hover:bg-[#1E110A] text-white font-bold py-3.5 rounded-full text-sm sm:text-base shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                "Send Reset Link"
              )}
            </button>

            <div className="pt-2 text-center text-xs sm:text-sm text-[#78716C]">
              Remember your password?{" "}
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setMode("signin");
                }}
                className="font-bold text-[#2A1810] underline underline-offset-2 hover:opacity-80 transition-opacity cursor-pointer ml-1"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
