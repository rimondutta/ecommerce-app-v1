"use client"

import { Search, Bell, HelpCircle, User } from "lucide-react"

export default function TopBar() {
  return (
    <header className="h-14 bg-white border-b border-[#d2d2d2] px-6 flex items-center justify-between sticky top-0 z-50 shadow-[0_1px_0_rgba(0,0,0,0.05)]">
      <div className="flex-1 max-w-[560px]">
        <div className="relative group">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8c9196] group-focus-within:text-[#008060] transition-colors" />
          <input
            type="text"
            placeholder="Search"
            className="w-full bg-[#f1f1f1] border border-transparent hover:border-[#616161] focus:bg-white focus:border-[#008060] focus:ring-4 focus:ring-[#008060]/10 rounded-lg py-2 pl-10 pr-4 text-[13px] text-[#202223] placeholder:text-[#8c9196] transition-all outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <button className="p-2.5 text-[#616161] hover:bg-[#f6f6f6] rounded-lg transition-all relative group">
          <Bell size={20} strokeWidth={1.5} className="group-hover:text-[#202223]" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#d82c0d] border-2 border-white rounded-full" />
        </button>
        <button className="p-2.5 text-[#616161] hover:bg-[#f6f6f6] rounded-lg transition-all group">
          <HelpCircle size={20} strokeWidth={1.5} className="group-hover:text-[#202223]" />
        </button>
        <div className="w-px h-6 bg-[#d2d2d2] mx-2" />
        <button className="flex items-center gap-3 pl-3 pr-1 py-1 hover:bg-[#f6f6f6] rounded-lg transition-all group border border-transparent hover:border-[#d2d2d2]">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-[12px] font-bold text-[#202223]">Admin</span>
            <span className="text-[10px] text-[#8c9196]">Store Owner</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-[#008060] flex items-center justify-center text-white font-bold text-xs shadow-md">
            A
          </div>
        </button>
      </div>
    </header>
  )
}
