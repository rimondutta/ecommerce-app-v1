"use client";

import { useEffect, useRef } from "react";

const items = [
  "WEAR THE SILENCE",
  "BRUTALIST MINIMALISM",
  "STRIPPED OF EXCESS",
  "STRUCTURE & INTENT",
  "MODERN ASCETIC",
  "AVANT GARDE"
];

export default function KineticMarquee() {
  const marqueeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initMarquee = async () => {
      const { gsap } = await import("@/lib/gsap");
      if (!marqueeRef.current) return;

      const marquee = marqueeRef.current;
      const track = marquee.querySelector(".marquee-track") as HTMLElement;
      if (!track) return;

      // Duplicate the content to create seamless loop
      const clone = track.cloneNode(true) as HTMLElement;
      marquee.appendChild(clone);

      const totalWidth = track.offsetWidth;

      gsap.to([track, clone], {
        xPercent: -100,
        repeat: -1,
        duration: 30,
        ease: "none",
        onUpdate: function() {
           // Optional: Speed up on scroll could be added here
        }
      });
    };

    initMarquee();
  }, []);

  return (
    <div className="relative w-full py-12 md:py-24 overflow-hidden bg-[#0a0a0a] text-white border-y border-white/5" ref={marqueeRef}>
      <div className="flex whitespace-nowrap marquee-track">
        {[...items, ...items].map((item, i) => (
          <div key={i} className="flex items-center gap-16 px-8">
            <span className={`text-4xl md:text-[8rem] tracking-[-0.04em] leading-none ${i % 2 === 0 ? 'font-serif text-white/[0.06]' : 'font-serif italic text-white/[0.03]'}`}>
              {item}
            </span>
            <div className="w-1.5 h-1.5 bg-white/10 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
