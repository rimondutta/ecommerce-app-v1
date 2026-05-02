"use client";

import { useState, useEffect, useRef } from "react";
import AnimatedLogo from "@/components/ui/AnimatedLogo";

export default function Preloader() {
  const [visible, setVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const topWipeRef = useRef<HTMLDivElement>(null);
  const bottomWipeRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);
  const lineLeftRef = useRef<HTMLDivElement>(null);
  const lineRightRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Dynamic import to avoid SSR
    const initAnimation = async () => {
      const { gsap } = await import("@/lib/gsap");

      const tl = gsap.timeline({
        onComplete: () => {
          setVisible(false);
          document.body.style.overflow = "";
        },
      });

      document.body.style.overflow = "hidden";

      // Counter animation 0 → 100
      const counter = { val: 0 };
      tl.to(counter, {
        val: 100,
        duration: 2.2,
        ease: "power2.inOut",
        onUpdate: () => {
          if (counterRef.current) {
            counterRef.current.textContent = Math.floor(counter.val)
              .toString()
              .padStart(3, "0");
          }
        },
      });

      // Animate brand text in
      tl.fromTo(
        brandRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "expo.out" },
        0.3
      );

      // Animate status line
      tl.fromTo(
        statusRef.current,
        { width: 0 },
        { width: "100%", duration: 2, ease: "power2.inOut" },
        0.2
      );

      // Expanding lines
      tl.to(
        lineLeftRef.current,
        { scaleX: 1, duration: 0.6, ease: "expo.inOut" },
        "-=0.5"
      );
      tl.to(
        lineRightRef.current,
        { scaleX: 1, duration: 0.6, ease: "expo.inOut" },
        "-=0.5"
      );

      // Wipe out — split curtain
      tl.to(
        topWipeRef.current,
        { yPercent: -100, duration: 1, ease: "expo.inOut" },
        "-=0.2"
      );
      tl.to(
        bottomWipeRef.current,
        { yPercent: 100, duration: 1, ease: "expo.inOut" },
        "-=1"
      );
    };

    initAnimation();

    // Safety timeout: Ensure preloader hides even if GSAP fails
    const timeout = setTimeout(() => {
      setVisible(false);
      document.body.style.overflow = "";
    }, 5000);

    return () => clearTimeout(timeout);
  }, []);

  if (!visible) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[99999] pointer-events-auto flex flex-col"
      aria-label="Loading"
    >
      {/* Top Wipe */}
      <div
        ref={topWipeRef}
        className="absolute inset-x-0 top-0 h-1/2 bg-black z-[2] flex flex-col items-center justify-end pb-0"
      >
        {/* Grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Bottom Wipe */}
      <div
        ref={bottomWipeRef}
        className="absolute inset-x-0 bottom-0 h-1/2 bg-black z-[2]"
      />

      {/* Center Content (above wipes) */}
      <div className="absolute inset-0 z-[3] flex flex-col items-center justify-center gap-8">
        {/* Brand */}
        <div ref={brandRef} className="opacity-0 flex flex-col items-center gap-4">
          <AnimatedLogo size="lg" className="text-white" />
          <p className="font-mono text-[9px] uppercase tracking-[0.5em] text-white/40">
            Archival System Initializing
          </p>
        </div>

        {/* Counter */}
        <div className="flex items-center gap-6">
          <div
            ref={lineLeftRef}
            className="w-16 md:w-32 h-px bg-white/30 origin-right"
            style={{ transform: "scaleX(0)" }}
          />
          <span
            ref={counterRef}
            className="font-display font-black text-7xl md:text-[10rem] text-white leading-none tracking-tighter tabular-nums"
          >
            000
          </span>
          <div
            ref={lineRightRef}
            className="w-16 md:w-32 h-px bg-white/30 origin-left"
            style={{ transform: "scaleX(0)" }}
          />
        </div>

        {/* Status bar */}
        <div className="w-48 md:w-80 h-px bg-white/10 relative overflow-hidden">
          <div ref={statusRef} className="absolute inset-y-0 left-0 bg-white" style={{ width: 0 }} />
        </div>

        <p className="font-mono text-[8px] uppercase tracking-[0.4em] text-white/30">
          LOADING EXPERIENCE...
        </p>
      </div>
    </div>
  );
}
