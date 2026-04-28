"use client";

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Search, Bell, HelpCircle, Menu } from "lucide-react"
import AdminMobileSidebar from "./AdminMobileSidebar"

export default function TopBar() {
  const { data: session } = useSession()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <>
      <AdminMobileSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <header className="h-20 bg-white border-b-4 border-black px-4 md:px-8 flex items-center justify-between">
        <div className="flex-1 max-w-[600px] hidden sm:block">
          <div className="relative group">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-black" />
            <input
              type="text"
              placeholder="SEARCH ANYTHING..."
              className="w-full bg-gray-50 border-2 border-black focus:bg-white focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] py-3 pl-12 pr-4 text-xs font-black uppercase tracking-[0.1em] transition-all outline-none placeholder:text-gray-400"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 border-2 border-black bg-black text-white active:bg-white active:text-black transition-all"
          >
            <Menu size={24} />
          </button>
          <span className="font-black uppercase tracking-tighter text-lg">FlexWear</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden md:flex items-center gap-2">
              <button className="p-3 border-2 border-transparent hover:border-black hover:bg-gray-50 transition-all relative">
                <Bell size={22} className="text-black" />
                <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 border-2 border-black rounded-none" />
              </button>
              <button className="p-3 border-2 border-transparent hover:border-black hover:bg-gray-50 transition-all">
                <HelpCircle size={22} className="text-black" />
              </button>
          </div>
          
          <div className="w-1 h-10 bg-black/10 mx-2 hidden md:block" />
          
          <button className="flex items-center gap-3 md:gap-4 pl-4 pr-1 py-1 border-2 border-transparent hover:border-black transition-all group">
            <div className="flex flex-col items-end hidden lg:flex">
              <span className="text-xs font-black uppercase tracking-tight text-black">{session?.user?.name || "Admin User"}</span>
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">Store Manager</span>
            </div>
            <div className="w-9 h-9 md:w-10 md:h-10 border-2 border-black flex items-center justify-center font-black text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] overflow-hidden bg-black text-white">
              {(session?.user as any)?.image ? (
                <img src={(session?.user as any).image} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                session?.user?.name?.charAt(0) || "A"
              )}
            </div>
          </button>
        </div>
      </header>
    </>
  )
}
