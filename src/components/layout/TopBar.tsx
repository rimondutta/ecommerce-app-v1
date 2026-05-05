"use client";

import { useState, useEffect } from "react";

const announcements = [
  "New Collection — Monochrome Editorial Now Available",
  "Complimentary Worldwide Shipping on Orders Over ৳8,000",
  "Subscribe for Private Access to Limited Releases",
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
    <div className="absolute top-0 left-0 w-full bg-[#0e0e0e] text-[#e5e2e1] h-[40px] flex items-center justify-between px-6 md:px-16 z-[600] overflow-hidden border-b border-white/5">
      {/* Left: Info */}
      <div className="hidden lg:flex items-center gap-8">
        <a href="#" className="label-tiny text-[#8e9192] hover:text-white transition-all duration-300">
          Stores
        </a>
        <a href="#" className="label-tiny text-[#8e9192] hover:text-white transition-all duration-300">
          Support
        </a>
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
        <a href="#" className="label-tiny text-[#8e9192] hover:text-white transition-all duration-300">
          Login
        </a>
      </div>
    </div>
  );
}
