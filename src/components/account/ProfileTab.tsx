"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { m } from "framer-motion";
import {
  Camera,
  User as UserIcon,
  Mail,
  ShieldCheck,
  KeyRound,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { useToast } from "@/components/playshelf/Toast";
import { formatShortDate } from "./types";

interface ProfileTabProps {
  name: string;
  email: string;
  image: string | null;
  role: string;
  createdAt: string | null;
  onProfileUpdated: (updates: { name?: string; image?: string }) => Promise<void>;
}

function getInitials(name: string, email: string): string {
  const source = name.trim() || email.trim() || "U";
  const parts = source.split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

export default function ProfileTab({
  name,
  email,
  image,
  role,
  createdAt,
  onProfileUpdated,
}: ProfileTabProps) {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState(name);
  const [savingName, setSavingName] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      showToast("Please upload a JPG, PNG, or WebP image", "error");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      showToast("Image must be smaller than 3MB", "error");
      return;
    }

    setUploadingPhoto(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
      });

      const res = await fetch("/api/users/profile/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64 }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        showToast(data.error || "Could not upload profile photo", "error");
        return;
      }

      await onProfileUpdated({ image: data.imageUrl });
      showToast("Profile photo updated!", "success");
    } catch {
      showToast("Failed to upload photo. Please try again.", "error");
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = fullName.trim();
    if (trimmed.length < 2) {
      showToast("Name must be at least 2 characters", "error");
      return;
    }

    setSavingName(true);
    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        showToast(data.error || "Failed to update profile", "error");
        return;
      }

      await onProfileUpdated({ name: data.user.name });
      showToast("Profile updated successfully!", "success");
    } catch {
      showToast("Network error updating profile", "error");
    } finally {
      setSavingName(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      showToast("Please fill in your current and new password", "error");
      return;
    }
    if (newPassword.length < 6) {
      showToast("New password must be at least 6 characters", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("New passwords do not match", "error");
      return;
    }

    setSavingPassword(true);
    try {
      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        showToast(data.error || "Failed to update password", "error");
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showToast("Password changed successfully!", "success");
    } catch {
      showToast("Network error changing password", "error");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <m.div
      key="profile"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      {/* ─── Avatar & Profile Information Card ─── */}
      <div className="bg-white/95 backdrop-blur-md rounded-[26px] border border-[#EDE4D8] p-6 sm:p-8 shadow-[0_4px_20px_rgba(44,36,22,0.04)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 pb-6 border-b border-[#F3ECE2]">
          {/* Avatar Upload Trigger */}
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-[#5428D8] to-[#7C3AED] text-white flex items-center justify-center shadow-[0_8px_20px_rgba(84,40,216,0.25)] overflow-hidden shrink-0">
            {image ? (
              <Image
                src={image}
                alt={fullName || email}
                fill
                sizes="80px"
                className="object-cover"
              />
            ) : (
              <span className="text-xl font-extrabold tracking-tight">
                {getInitials(fullName, email)}
              </span>
            )}

            <button
              type="button"
              disabled={uploadingPhoto}
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/45 opacity-0 hover:opacity-100 focus:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-bold transition-opacity cursor-pointer"
              aria-label="Upload new profile photo"
            >
              {uploadingPhoto ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <Camera size={16} />
                  <span className="mt-0.5">Change</span>
                </>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handlePhotoSelect}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-extrabold text-[#2C2416] truncate">
                {fullName || "Customer"}
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#F3F0FE] text-[#5428D8] border border-[#DFD6FE] capitalize">
                <CheckCircle2 size={11} />
                {role}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#7A6E62] truncate mt-0.5">{email}</p>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <button
                type="button"
                disabled={uploadingPhoto}
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5428D8] hover:underline cursor-pointer"
              >
                <Camera size={13} />
                {uploadingPhoto ? "Uploading photo..." : "Upload new photo"}
              </button>
              {createdAt && (
                <span className="inline-flex items-center gap-1 text-xs text-[#9A8F83]">
                  <Calendar size={12} />
                  Member since {formatShortDate(createdAt)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#7A6E62]">
            Personal Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2C2416] flex items-center gap-1.5">
                <UserIcon size={13} className="text-[#5428D8]" />
                Full Name
              </label>
              <input
                type="text"
                required
                minLength={2}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full human-input px-4 py-2.5 text-sm text-[#2C2416]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2C2416] flex items-center gap-1.5">
                <Mail size={13} className="text-[#9A8F83]" />
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full bg-[#F5F1EB] text-[#7A6E62] rounded-xl border border-[#E8DDD0] px-4 py-2.5 text-sm cursor-not-allowed"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingName || fullName.trim() === name.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5428D8] hover:bg-[#4318C4] text-white text-xs font-bold shadow-[0_2px_10px_rgba(84,40,216,0.22)] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {savingName && <Loader2 size={14} className="animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>

      {/* ─── Security & Password Card ─── */}
      <div className="bg-white/95 backdrop-blur-md rounded-[26px] border border-[#EDE4D8] p-6 sm:p-8 shadow-[0_4px_20px_rgba(44,36,22,0.04)] space-y-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/70 flex items-center justify-center text-emerald-600 shrink-0">
            <ShieldCheck size={19} />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-[#2C2416]">
              Password & Security
            </h3>
            <p className="text-xs text-[#7A6E62] mt-0.5">
              Update your account password regularly to keep your orders secure. Signed in with Google?{" "}
              <Link
                href="/forgot-password"
                className="text-[#5428D8] font-semibold hover:underline"
              >
                Set a password via Forgot Password
              </Link>
              .
            </p>
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2C2416] flex items-center gap-1.5">
                <KeyRound size={12} className="text-[#9A8F83]" />
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPw ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full human-input px-4 py-2.5 pr-10 text-sm text-[#2C2416]"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A8F83] hover:text-[#2C2416] cursor-pointer"
                  aria-label={showCurrentPw ? "Hide password" : "Show password"}
                >
                  {showCurrentPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2C2416] block">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPw ? "text" : "password"}
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full human-input px-4 py-2.5 pr-10 text-sm text-[#2C2416]"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A8F83] hover:text-[#2C2416] cursor-pointer"
                  aria-label={showNewPw ? "Hide new password" : "Show new password"}
                >
                  {showNewPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2C2416] block">
                Confirm New Password
              </label>
              <input
                type={showNewPw ? "text" : "password"}
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full human-input px-4 py-2.5 text-sm text-[#2C2416]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={savingPassword || !currentPassword || !newPassword || !confirmPassword}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2C2416] hover:bg-black text-white text-xs font-bold disabled:opacity-45 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {savingPassword && <Loader2 size={14} className="animate-spin" />}
              Update Password
            </button>
          </div>
        </form>
      </div>
    </m.div>
  );
}
