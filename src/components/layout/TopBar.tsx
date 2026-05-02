"use client";

import { useState, useEffect } from "react";
import { ChevronDown, Globe, HelpCircle } from "lucide-react";

const announcements = [
  "New Collection — Soft Modern Minimalism Out Now",
  "Free Express Shipping on Orders Over ৳8,000",
  "Subscribe for 10% Off Your First Purchase",
];

export default function TopBar() {
  const [currentAnnouncement, setCurrentAnnouncement] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAnnouncement((prev) => (prev + 1) % announcements.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute top-0 left-0 w-full bg-zinc-900 text-white h-[40px] flex items-center justify-between px-6 md:px-12 z-[600] overflow-hidden border-b border-white/5">
      {/* Left: Info */}
      <div className="hidden lg:flex items-center gap-6">
        <a href="#" className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400 hover:text-white transition-all">
          <Globe size={12} />
          Stores
        </a>
        <a href="#" className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400 hover:text-white transition-all">
          <HelpCircle size={12} />
          Support
        </a>
      </div>

      {/* Center: Announcement Slider */}
      <div className="flex-1 text-center flex items-center justify-center">
        <div className="h-full flex items-center justify-center overflow-hidden">
          <p 
            className="font-sans font-bold text-[10px] md:text-[11px] uppercase tracking-[0.25em] animate-fade-in-up text-zinc-100" 
            key={currentAnnouncement}
          >
            {announcements[currentAnnouncement]}
          </p>
        </div>
      </div>

      {/* Right: Settings */}
      <div className="hidden lg:flex items-center gap-8">
        <button className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400 hover:text-white transition-all flex items-center gap-1.5">
          BD / BDT
          <ChevronDown size={10} className="text-zinc-500" />
        </button>
        <span className="text-zinc-800">|</span>
        <a href="#" className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400 hover:text-white transition-all">
          Login
        </a>
      </div>
    </div>
  );
}
