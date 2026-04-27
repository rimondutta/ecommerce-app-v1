"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { 
  User, 
  Store, 
  CreditCard, 
  Bell, 
  Lock, 
  Globe, 
  Truck, 
  DollarSign,
  ChevronRight,
  Camera,
  Check,
  KeyRound,
  Eye,
  EyeOff,
  Loader2
} from "lucide-react"

export default function AdminSettingsPage() {
  const { data: session, update } = useSession()
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [name, setName] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "")
      setImageUrl((session.user as any).image || "")
    }
  }, [session])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData
      })
      
      const data = await res.json()
      if (res.ok) {
        setImageUrl(data.url)
      } else {
        alert(data.error || "Failed to upload image")
      }
    } catch (err) {
      console.error(err)
      alert("Error uploading image")
    } finally {
      setIsUploading(false)
    }
  }

  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, image: imageUrl })
      })
      
      if (res.ok) {
        await update({ name, image: imageUrl })
        setIsEditingProfile(false)
      } else {
        const data = await res.json()
        alert(data.error || "Failed to update profile")
      }
    } catch (err) {
      console.error(err)
      alert("Error updating profile")
    } finally {
      setIsSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordMsg(null)

    if (newPassword.length < 6) {
      setPasswordMsg({ type: "error", text: "New password must be at least 6 characters" })
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "New passwords do not match" })
      return
    }

    setChangingPassword(true)
    try {
      const res = await fetch("/api/admin/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json()

      if (!res.ok) {
        setPasswordMsg({ type: "error", text: data.error || "Failed to change password" })
        return
      }

      setPasswordMsg({ type: "success", text: "Password changed successfully!" })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch {
      setPasswordMsg({ type: "error", text: "Network error. Please try again." })
    } finally {
      setChangingPassword(false)
    }
  }

  const settingsGroups = [
    {
      title: "Store details",
      description: "Manage your store's name, email, and currency.",
      icon: <Store className="text-[#008060]" size={20} />,
    },
    {
      title: "Plan",
      description: "View your current plan and update billing frequency.",
      icon: <CreditCard className="text-[#008060]" size={20} />,
    },
    {
      title: "Users and permissions",
      description: "Manage what people can see and do in your store.",
      icon: <User className="text-[#008060]" size={20} />,
    },
    {
      title: "Payments",
      description: "Manage how you get paid by your customers.",
      icon: <DollarSign className="text-[#008060]" size={20} />,
    },
    {
      title: "Shipping and delivery",
      description: "Manage shipping rates, methods, and delivery options.",
      icon: <Truck className="text-[#008060]" size={20} />,
    },
    {
      title: "Notifications",
      description: "Manage emails sent to you and your customers.",
      icon: <Bell className="text-[#008060]" size={20} />,
    },
  ]

  return (
    <div className="max-w-[1000px] mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-[20px] font-bold text-[#202223]">Settings</h1>
      </div>

      {/* Admin Profile Quick View */}
      <div className="bg-white rounded-lg border border-[#d2d2d2] shadow-sm p-6">
        {isEditingProfile ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <h2 className="text-[16px] font-bold text-[#202223]">Edit Profile</h2>
              <button 
                onClick={() => {
                  setIsEditingProfile(false);
                  setName(session?.user?.name || "");
                  setImageUrl((session?.user as any)?.image || "");
                }}
                className="text-sm text-gray-500 hover:text-black"
              >
                Cancel
              </button>
            </div>
            
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Avatar Uploader */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative group w-24 h-24 rounded-full border border-gray-300 overflow-hidden bg-gray-50 flex items-center justify-center">
                  {imageUrl ? (
                    <img src={imageUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User size={32} className="text-gray-400" />
                  )}
                  <div 
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="text-white" size={24} />
                  </div>
                  {isUploading && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-[#008060] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-medium text-[#005bd3] hover:underline"
                >
                  Change Avatar
                </button>
              </div>

              {/* Name and Details Input */}
              <div className="flex-1 space-y-4 w-full">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#008060]/20 focus:border-[#008060]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input 
                    type="email" 
                    value={session?.user?.email || ""}
                    disabled
                    className="w-full max-w-md px-3 py-2 border border-gray-200 bg-gray-50 text-gray-500 rounded-md cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed directly.</p>
                </div>
                <div className="pt-2">
                  <button 
                    onClick={handleSaveProfile}
                    disabled={isSaving || isUploading}
                    className="bg-[#008060] hover:bg-[#006e52] disabled:opacity-50 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    {isSaving ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Check size={16} />
                    )}
                    Save Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#f6f6f7] rounded-full flex items-center justify-center border border-[#d2d2d2] overflow-hidden shadow-sm">
                {(session?.user as any)?.image ? (
                  <img src={(session?.user as any).image} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#008060] to-[#004c3f] flex items-center justify-center text-white font-bold text-sm">
                    {session?.user?.name?.charAt(0) || "A"}
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-[14px] font-bold text-[#202223]">{session?.user?.name || "Admin"}</h2>
                <p className="text-[13px] text-[#616161]">{session?.user?.email || "admin@example.com"}</p>
              </div>
            </div>
            <button 
              onClick={() => setIsEditingProfile(true)}
              className="text-[13px] font-medium text-[#008060] hover:underline"
            >
              Manage account
            </button>
          </div>
        )}
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-lg border border-[#d2d2d2] shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4 border-b pb-4">
          <div className="w-10 h-10 bg-[#f6f6f7] rounded-md flex items-center justify-center border border-[#d2d2d2]">
            <KeyRound className="text-[#008060]" size={20} />
          </div>
          <div>
            <h2 className="text-[16px] font-bold text-[#202223]">Change Password</h2>
            <p className="text-[13px] text-[#616161]">Update your login password</p>
          </div>
        </div>

        {passwordMsg && (
          <div className={`mb-4 p-3 rounded-md text-sm font-medium ${
            passwordMsg.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}>
            {passwordMsg.text}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <div className="relative">
              <input
                type={showCurrentPw ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#008060]/20 focus:border-[#008060]"
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPw(!showCurrentPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <div className="relative">
              <input
                type={showNewPw ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#008060]/20 focus:border-[#008060]"
                placeholder="Enter new password (min 6 chars)"
              />
              <button
                type="button"
                onClick={() => setShowNewPw(!showNewPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#008060]/20 focus:border-[#008060] ${
                confirmPassword && confirmPassword !== newPassword
                  ? "border-red-400"
                  : "border-gray-300"
              }`}
              placeholder="Confirm new password"
            />
            {confirmPassword && confirmPassword !== newPassword && (
              <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
            )}
          </div>
          <button
            type="submit"
            disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
            className="bg-[#008060] hover:bg-[#006e52] disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
          >
            {changingPassword ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Lock size={16} />
            )}
            {changingPassword ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {settingsGroups.map((group, index) => (
          <div 
            key={index} 
            className="group bg-white p-5 rounded-lg border border-[#d2d2d2] shadow-sm hover:border-[#008060] transition-all cursor-pointer flex gap-4"
          >
            <div className="flex-shrink-0 w-10 h-10 bg-[#f6f6f7] rounded-md flex items-center justify-center border border-[#d2d2d2] group-hover:border-[#008060]/30 transition-colors">
              {group.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-[14px] font-bold text-[#202223] group-hover:text-[#008060] transition-colors">{group.title}</h3>
                <ChevronRight size={16} className="text-[#616161] group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-[13px] text-[#616161] mt-1 pr-6">{group.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Secondary Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-lg border border-[#d2d2d2] shadow-sm hover:border-[#008060] transition-all cursor-pointer">
           <Globe className="text-[#616161] mb-3" size={20} />
           <h3 className="text-[14px] font-bold text-[#202223]">Languages</h3>
           <p className="text-[12px] text-[#616161] mt-1">Manage the languages your store is available in.</p>
        </div>
        <div className="bg-white p-5 rounded-lg border border-[#d2d2d2] shadow-sm hover:border-[#008060] transition-all cursor-pointer">
           <Lock className="text-[#616161] mb-3" size={20} />
           <h3 className="text-[14px] font-bold text-[#202223]">Privacy and security</h3>
           <p className="text-[12px] text-[#616161] mt-1">Manage your customer privacy and security settings.</p>
        </div>
        <div className="bg-white p-5 rounded-lg border border-[#d2d2d2] shadow-sm hover:border-[#008060] transition-all cursor-pointer">
           <Tag className="text-[#616161] mb-3" size={20} />
           <h3 className="text-[14px] font-bold text-[#202223]">Gift cards</h3>
           <p className="text-[12px] text-[#616161] mt-1">Set up and manage gift cards for your store.</p>
        </div>
      </div>
    </div>
  )
}

function Tag({ className, size }: { className?: string, size?: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l4.29-4.29c.94-.94.94-2.48 0-3.42L12 2Z" />
      <path d="M7 7h.01" />
    </svg>
  )
}
