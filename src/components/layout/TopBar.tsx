"use client";

import { useState, useEffect } from "react";
import { ChevronDown, Zap } from "lucide-react";

const announcements = [
  "Spring Fashion Sale — Up to 50% Off Selected Items",
  "Summer sale discount off 70%",
  "Time to refresh your wardrobe",
];

const currencies = ["USD", "EUR France", "EUR Germany", "VND"];
const languages = ["English", "العربية", "简体中文", "اردو"];

function SocialIcon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
      <path d={d} />
    </svg>
  );
}

const socialIcons = [
  // Facebook
  "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z",
  // Twitter/X
  "M4 4l6.5 8L4 20h2l5.5-6.5L16 20h4l-7-8.5L19.5 4H18l-5 5.5L9 4H4z",
  // Instagram
  "M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 01-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 017.8 2m-.2 2A3.6 3.6 0 004 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 003.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5M12 7a5 5 0 110 10 5 5 0 010-10m0 2a3 3 0 100 6 3 3 0 000-6z",
  // TikTok
  "M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.86a8.28 8.28 0 004.76 1.49v-3.4a4.85 4.85 0 01-1-.26z",
  // Pinterest
  "M12 2C6.477 2 2 6.477 2 12c0 4.236 2.636 7.855 6.356 9.312-.088-.791-.167-2.005.035-2.868.181-.78 1.172-4.97 1.172-4.97s-.299-.6-.299-1.486c0-1.39.806-2.428 1.81-2.428.852 0 1.264.64 1.264 1.408 0 .858-.546 2.14-.828 3.33-.236.995.5 1.807 1.48 1.807 1.778 0 3.144-1.874 3.144-4.58 0-2.393-1.72-4.068-4.176-4.068-2.845 0-4.516 2.135-4.516 4.34 0 .859.331 1.781.745 2.281a.3.3 0 01.069.288l-.278 1.133c-.044.183-.145.222-.335.134-1.249-.581-2.03-2.407-2.03-3.874 0-3.154 2.292-6.052 6.608-6.052 3.469 0 6.165 2.473 6.165 5.776 0 3.447-2.173 6.22-5.19 6.22-1.013 0-1.965-.527-2.291-1.148l-.623 2.378c-.226.869-.835 1.958-1.244 2.621.937.29 1.931.446 2.962.446 5.523 0 10-4.477 10-10S17.523 2 12 2z",
];

export default function TopBar() {
  const [currentAnnouncement, setCurrentAnnouncement] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAnnouncement((prev) => (prev + 1) % announcements.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-black text-white h-[40px] flex items-center justify-between px-8 border-b-2 border-black relative z-50 overflow-hidden">
      {/* Socials / Info */}
      <div className="hidden lg:flex items-center gap-6">
        <a href="#" className="text-[10px] font-bold uppercase tracking-widest hover:text-gray-400 transition-colors">Instagram</a>
        <a href="#" className="text-[10px] font-bold uppercase tracking-widest hover:text-gray-400 transition-colors">Chattogram Store</a>
      </div>

      {/* Announcement Slider */}
      <div className="flex-1 text-center flex items-center justify-center">
        <p className="font-display font-black text-xs uppercase tracking-[0.2em] animate-fade-in-up" key={currentAnnouncement}>
          ✳ {announcements[currentAnnouncement]}
        </p>
      </div>

      {/* Region / Help */}
      <div className="hidden lg:flex items-center gap-6">
        <button className="text-[10px] font-bold uppercase tracking-widest hover:text-gray-400 transition-colors flex items-center gap-1">
          BANGLADESH / BDT <ChevronDown size={10} />
        </button>
        <a href="#" className="text-[10px] font-bold uppercase tracking-widest hover:text-gray-400 transition-colors">HAVE A QUESTION?</a>
      </div>
    </div>
  );
}
