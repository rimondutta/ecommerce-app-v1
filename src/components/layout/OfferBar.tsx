"use client";

import React, { useState } from "react";
import { X } from "lucide-react";

const OFFERS = [
  "🎉 Free Shipping on orders over ৳1,500 — Shop Now",
  "🔥 Summer Sale: Up to 60% Off on selected toys!",
  "🎁 Buy 2 Get 1 Free on all Educational Toys this week",
];

export default function OfferBar() {
  const [currentOffer, setCurrentOffer] = useState(0);
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="w-full bg-black text-white text-center text-[13px] font-medium py-2.5 px-4 relative flex items-center justify-center gap-3">
      
      {/* Left Arrow */}
      <button
        onClick={() => setCurrentOffer((prev) => (prev - 1 + OFFERS.length) % OFFERS.length)}
        className="hidden sm:flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity text-white"
        aria-label="Previous offer"
      >
        ‹
      </button>

      {/* Offer Text */}
      <span className="transition-all duration-300">
        {OFFERS[currentOffer]}
      </span>

      {/* Right Arrow */}
      <button
        onClick={() => setCurrentOffer((prev) => (prev + 1) % OFFERS.length)}
        className="hidden sm:flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity text-white"
        aria-label="Next offer"
      >
        ›
      </button>

      {/* Close Button */}
      <button
        onClick={() => setVisible(false)}
        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 transition-opacity text-white"
        aria-label="Close offer bar"
      >
        <X size={14} />
      </button>
    </div>
  );
}
