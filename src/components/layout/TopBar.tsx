"use client";

import { useState, useEffect } from "react";

const announcements = [
  "New Collection — Monochrome Editorial Now Available",
  "Complimentary Worldwide Shipping on Orders Over ৳8,000",
  "Subscribe for Private Access to Limited Releases",
];

export default function TopBar() {
  const [currentAnnouncement, setCurrentAnnouncement] = useState(0);
  const [time, setTime] = useState(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }));

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }));
    }, 1000);
    
    const interval = setInterval(() => {
      setCurrentAnnouncement((prev) => (prev + 1) % announcements.length);
    }, 5000);
    
    return () => {
      clearInterval(timer);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="absolute top-0 left-0 w-full bg-[#0e0e0e] text-[#e5e2e1] h-[40px] flex items-center justify-between px-6 md:px-16 z-[600] overflow-hidden border-b border-white/5">
      {/* Left: Info */}
      <div className="hidden lg:flex items-center gap-8">
        <div className="flex items-center gap-3">
          <span className="label-tiny text-[#333]">LOC</span>
          <span className="label-tiny text-[#8e9192]">23.8103° N, 90.4125° E</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="label-tiny text-[#333]">SYS</span>
          <span className="label-tiny text-[#8e9192]">{time}</span>
        </div>
      </div>

      {/* Center: Announcement Slider */}
      <div className="flex-1 text-center flex items-center justify-center">
        <div className="h-full flex items-center justify-center overflow-hidden">
          <p 
            className="label-tiny text-[#c4c7c8] animate-fade-in-up" 
            key={currentAnnouncement}
          >
            {announcements[currentAnnouncement]}
          </p>
        </div>
      </div>

      {/* Right: Settings */}
      <div className="hidden lg:flex items-center gap-8">
        <button className="label-tiny text-[#8e9192] hover:text-white transition-all duration-300">
          BD / BDT
        </button>
        <span className="text-[#333333]">|</span>
        <a href="/account" className="label-tiny text-[#8e9192] hover:text-white transition-all duration-300">
          ARCHIVE_LOG
        </a>
      </div>
    </div>
  );
}
