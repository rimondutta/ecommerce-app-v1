"use client"

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
  ChevronRight
} from "lucide-react"

export default function AdminSettingsPage() {
  const { data: session } = useSession()

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
      <div className="bg-white rounded-lg border border-[#d2d2d2] shadow-sm p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#f6f6f7] rounded-full flex items-center justify-center border border-[#d2d2d2]">
            <User size={24} className="text-[#616161]" />
          </div>
          <div>
            <h2 className="text-[14px] font-bold text-[#202223]">{session?.user?.name || "Admin"}</h2>
            <p className="text-[13px] text-[#616161]">{session?.user?.email || "admin@example.com"}</p>
          </div>
        </div>
        <button className="text-[13px] font-medium text-[#008060] hover:underline">
          Manage account
        </button>
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
