"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { 
  Home, ShoppingCart, Tag, Users, Inbox, BarChart2, 
  Megaphone, Ticket, Settings, Store, Search, Bell,
  LogOut, Plus, ChevronRight, UserPlus
} from "lucide-react"

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const links = [
    { name: "Home", href: "/admin", icon: Home },
    { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { name: "Products", href: "/admin/products", icon: Tag },
    { name: "Customers", href: "/admin/customers", icon: Users },
    { name: "Discounts", href: "/admin/coupons", icon: Ticket },
    { name: "Invite Admin", href: "/admin/invite", icon: UserPlus },
  ]

  const salesChannels = [
    { name: "Online Store", icon: Store },
  ]

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin"
    return pathname.startsWith(href)
  }

  return (
    <aside className="w-[240px] bg-[#1a1a1b] text-[#e3e3e3] min-h-screen flex flex-col hidden md:flex border-r border-white/5">
      {/* Store Switcher */}
      <div className="p-4">
        <div className="flex items-center justify-between bg-white/5 p-2 rounded-lg cursor-pointer hover:bg-white/10 transition-all border border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#008060] flex items-center justify-center text-white font-bold shadow-lg">
              F
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-white leading-tight">FlexWear</span>
              <span className="text-[11px] text-[#8c9196]">Online Store</span>
            </div>
          </div>
          <ChevronRight size={14} className="text-[#8c9196]" />
        </div>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto custom-scrollbar">
        {links.map((link) => {
          const active = isActive(link.href)
          const Icon = link.icon
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-all duration-200 ${
                active 
                  ? "bg-white/10 text-white shadow-sm ring-1 ring-white/10" 
                  : "text-[#e3e3e3] hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon size={18} className={active ? "text-[#008060]" : "text-[#8c9196]"} />
              <span>{link.name}</span>
            </Link>
          )
        })}

        <div className="mt-8 px-3 mb-2 flex items-center justify-between">
          <span className="text-[11px] font-semibold text-[#8c9196] uppercase tracking-[0.05em]">Sales channels</span>
          <button className="text-[#8c9196] hover:text-white transition-colors"><Plus size={14} /></button>
        </div>
        {salesChannels.map((channel) => (
          <div
            key={channel.name}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium text-[#e3e3e3] hover:bg-white/5 hover:text-white cursor-pointer transition-all"
          >
            <channel.icon size={18} className="text-[#8c9196]" />
            <span>{channel.name}</span>
          </div>
        ))}
      </nav>

      {/* Footer Nav */}
      <div className="p-3 space-y-0.5 border-t border-white/5">
        <Link
          href="/admin/settings"
          className={`flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium text-[#e3e3e3] hover:bg-white/5 hover:text-white transition-all ${
            pathname.startsWith("/admin/settings") ? "bg-white/10 text-white" : ""
          }`}
        >
          <Settings size={18} className="text-[#8c9196]" />
          <span>Settings</span>
        </Link>
        <button
          onClick={() => signOut()}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium text-[#e3e3e3] hover:bg-red-500/10 hover:text-red-400 transition-all w-full text-left group"
        >
          <LogOut size={18} className="text-[#8c9196] group-hover:text-red-400" />
          <span>Logout</span>
        </button>
      </div>

      {/* User Info */}
      <div className="p-4 bg-black/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md overflow-hidden bg-gradient-to-br from-[#008060] to-[#004c3f]">
            {(session?.user as any)?.image ? (
              <img src={(session?.user as any).image} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              session?.user?.name?.charAt(0) || "A"
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[12px] font-bold text-white truncate">{session?.user?.name || "Admin"}</span>
            <span className="text-[10px] text-[#8c9196] truncate">{session?.user?.email || "admin@example.com"}</span>
          </div>
        </div>
      </div>
    </aside>

  )
}
