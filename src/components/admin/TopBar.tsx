"use client"

import { useSession } from "next-auth/react"
import { Search, Bell, HelpCircle, User, Menu } from "lucide-react"

export default function TopBar() {
  const { data: session } = useSession()

  return (
    <header className="h-20 bg-white border-b-4 border-black px-8 flex items-center justify-between sticky top-0 z-50">
      <div className="flex-1 max-w-[600px]">
        <div className="relative group">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-black" />
          <input
            type="text"
            placeholder="SEARCH ANYTHING..."
            className="w-full bg-gray-50 border-2 border-black focus:bg-white focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] py-3 pl-12 pr-4 text-xs font-black uppercase tracking-[0.1em] transition-all outline-none placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
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
        
        <button className="flex items-center gap-4 pl-4 pr-1 py-1 border-2 border-transparent hover:border-black transition-all group">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-xs font-black uppercase tracking-tight text-black">{session?.user?.name || "Admin User"}</span>
            <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">Store Manager</span>
          </div>
          <div className="w-10 h-10 border-2 border-black flex items-center justify-center font-black text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] overflow-hidden bg-black text-white">
            {(session?.user as any)?.image ? (
              <img src={(session?.user as any).image} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              session?.user?.name?.charAt(0) || "A"
            )}
          </div>
        </button>
        
        <button className="md:hidden p-2 border-2 border-black">
           <Menu size={24} />
        </button>
      </div>
    </header>
  )
}
