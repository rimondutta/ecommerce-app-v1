"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, Zap } from "lucide-react";

const announcements = [
  "Spring Fashion Sale — Up to 50% Off Selected Items",
  "Summer sale discount off 70%",
  "Time to refresh your wardrobe",
];

export default function TopBar() {
  const [currentAnnouncement, setCurrentAnnouncement] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAnnouncement((prev) => (prev + 1) % announcements.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY < 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div 
      ref={barRef}
      className={`fixed top-0 left-0 w-full bg-black text-white h-[40px] flex items-center justify-between px-8 border-b-2 border-black z-[600] overflow-hidden transition-transform duration-500 ease-[0.16,1,0.3,1] ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}
    >
      {/* Socials / Info */}
      <div className="hidden lg:flex items-center gap-6">
        <a href="#" className="text-[11px] font-bold uppercase tracking-widest hover:text-gray-400 transition-colors">Instagram</a>
        <a href="#" className="text-[11px] font-bold uppercase tracking-widest hover:text-gray-400 transition-colors">Our Stores</a>
      </div>

      {/* Announcement Slider */}
      <div className="flex-1 text-center flex items-center justify-center">
        <p className="font-display font-black text-xs uppercase tracking-[0.2em] animate-fade-in-up" key={currentAnnouncement}>
          ✳ {announcements[currentAnnouncement]}
        </p>
      </div>

      {/* Region / Help */}
      <div className="hidden lg:flex items-center gap-6">
        <button className="text-[11px] font-bold uppercase tracking-widest hover:text-gray-400 transition-colors flex items-center gap-1">
          BANGLADESH / BDT <ChevronDown size={10} />
        </button>
        <a href="#" className="text-[11px] font-bold uppercase tracking-widest hover:text-gray-400 transition-colors">HAVE A QUESTION?</a>
      </div>
    </div>
  );
}
