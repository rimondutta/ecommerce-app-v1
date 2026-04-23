"use client";

import { Zap } from "lucide-react";

export default function MarqueeBanner() {
  const items = Array.from({ length: 10 }, (_, i) => i);

  return (
    <section className="bg-yellow-2 py-3 overflow-hidden" aria-label="Promotional banner">
      <div className="flex animate-marquee whitespace-nowrap">
        {items.map((i) => (
          <span key={i} className="flex items-center gap-2 mx-8 text-sm font-semibold text-primary shrink-0">
            <Zap size={16} className="text-primary" />
            Spring Clearance Event: Save Up to 70%
          </span>
        ))}
      </div>
    </section>
  );
}
