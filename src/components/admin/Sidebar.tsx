"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { 
  Home, ShoppingCart, Tag, Users, Inbox, BarChart2, 
  Megaphone, Ticket, Settings, Store, Search, Bell,
  LogOut, Plus, ChevronRight, UserPlus, Image as ImageIcon
} from "lucide-react"

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const links = [
    { name: "Dashboard", href: "/admin", icon: Home },
    { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { name: "Products", href: "/admin/products", icon: Tag },
    { name: "Media Library", href: "/admin/media", icon: ImageIcon },
    { name: "Customers", href: "/admin/customers", icon: Users },
    { name: "Discounts", href: "/admin/coupons", icon: Ticket },
    { name: "Admins", href: "/admin/invite", icon: UserPlus },
  ]

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin"
    return pathname.startsWith(href)
  }

  return (
    <aside className="w-[260px] bg-black text-white min-h-screen flex flex-col hidden md:flex border-r-4 border-black">
      {/* Logo Area */}
      <div className="p-6 border-b-4 border-white/10">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 border-2 border-white bg-white text-black flex items-center justify-center font-black text-xl shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]">
              F
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black uppercase tracking-tighter leading-none">FlexWear</span>
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">Admin Pro</span>
            </div>
        </div>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-4 px-2">Main Navigation</p>
        {links.map((link) => {
          const active = isActive(link.href)
          const Icon = link.icon
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-4 px-4 py-3 border-2 transition-all group ${
                active 
                  ? "bg-white text-black border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)] translate-x-1" 
                  : "text-gray-400 border-transparent hover:text-white hover:border-white/20 hover:translate-x-1"
              }`}
            >
              <Icon size={20} className={active ? "text-black" : "text-gray-500 group-hover:text-white"} />
              <span className="text-xs font-black uppercase tracking-widest">{link.name}</span>
            </Link>
          )
        })}

        <div className="pt-8">
           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-4 px-2">Sales Channels</p>
           <div className="flex items-center gap-4 px-4 py-3 border-2 border-transparent text-gray-400 hover:text-white hover:border-white/20 hover:translate-x-1 cursor-pointer transition-all">
              <Store size={20} className="text-gray-500" />
              <span className="text-xs font-black uppercase tracking-widest">Online Store</span>
           </div>
        </div>
      </nav>

      {/* Footer Nav */}
      <div className="p-4 space-y-2 border-t-4 border-white/10 bg-white/5">
        <Link
          href="/admin/settings"
          className={`flex items-center gap-4 px-4 py-2 border-2 transition-all ${
            pathname.startsWith("/admin/settings") 
              ? "bg-white text-black border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)]" 
              : "text-gray-400 border-transparent hover:text-white hover:border-white/20"
          }`}
        >
          <Settings size={18} />
          <span className="text-xs font-black uppercase tracking-widest">Settings</span>
        </Link>
        <button
          onClick={() => signOut()}
          className="flex items-center gap-4 px-4 py-2 border-2 border-transparent text-gray-400 hover:text-red-400 hover:border-red-400/20 transition-all w-full text-left"
        >
          <LogOut size={18} />
          <span className="text-xs font-black uppercase tracking-widest">Logout</span>
        </button>
      </div>

      {/* User Info */}
      <div className="p-4 bg-white text-black border-t-4 border-black">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 border-2 border-black flex items-center justify-center font-black text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] overflow-hidden bg-gray-100">
            {(session?.user as any)?.image ? (
              <img src={(session?.user as any).image} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              session?.user?.name?.charAt(0) || "A"
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-black uppercase tracking-tight truncate">{session?.user?.name || "Admin"}</span>
            <span className="text-[9px] font-bold text-gray-500 truncate">{session?.user?.email || "admin@example.com"}</span>
          </div>
        </div>
      </div>
    </aside>

  )
}
