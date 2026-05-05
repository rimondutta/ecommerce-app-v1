"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function GsapCTA() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    let ctx: any;
    
    const initGsap = async () => {
      const { gsap } = await import("@/lib/gsap");
      if (!sectionRef.current) return;

      ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            end: "bottom 20%",
            scrub: 1,
          },
        });

        const mainText = sectionRef.current!.querySelector("[data-cta-main]");
        if (mainText) {
          tl.fromTo(mainText,
            { y: 100, opacity: 0 },
            { y: 0, opacity: 1, ease: "power4.out" }
          );
        }

        const subText = sectionRef.current!.querySelector("[data-cta-sub]");
        if (subText) {
          tl.fromTo(subText,
            { y: 50, opacity: 0 },
            { y: 0, opacity: 1, ease: "power4.out" },
            0.1
          );
        }

        const ctaBtn = sectionRef.current!.querySelector("[data-cta-btn]");
        if (ctaBtn) {
          gsap.fromTo(ctaBtn,
            { opacity: 0, y: 30 },
            {
              opacity: 1, y: 0, duration: 1.5, ease: "expo.out",
              scrollTrigger: { trigger: ctaBtn, start: "top 95%" },
            }
          );
        }
      }, sectionRef);
    };

    initGsap();
    return () => {
      if (ctx) ctx.revert();
    };
  }, []);

  return (
    <div
      ref={sectionRef}
      className="relative bg-[#0a0a0a] py-32 md:py-60 flex flex-col items-center justify-center text-center overflow-hidden border-t border-white/5"
    >
      {/* Scanlines Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-20 scanlines" />

      {/* Massive Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <div className="font-serif text-[40vw] text-white/[0.01] leading-none select-none">
              AVANT
          </div>
      </div>

      <div className="relative z-10 flex flex-col items-center px-6">
        <div className="flex flex-col items-center gap-2 mb-12">
           <div className="w-12 h-[1px] bg-[#333] mb-6" />
           <p className="label-tiny text-[#555]">Final ARCHIVAL ACCESS</p>
        </div>

        <h2
          data-cta-main
          className="font-serif text-6xl md:text-9xl lg:text-[14rem] text-white leading-[0.8] tracking-tighter mb-4"
          style={{ opacity: 0 }}
        >
          OWN THE<br/>
          <span className="italic text-[#555]">MOMENT.</span>
        </h2>
        
        <p
          data-cta-sub
          className="label-tiny leading-[2] text-[#8e9192] max-w-lg mx-auto mb-16"
          style={{ opacity: 0 }}
        >
          A study in brutalist minimalism. Stripped of the superficial, leaving only the essential structure of the modern nomadic state.
        </p>

        <div data-cta-btn style={{ opacity: 0 }}>
            <Link
              href="/products"
              className="btn-pill-primary group px-16 py-6"
            >
              SECURE ACCESS
            </Link>
        </div>

        {/* Technical Markers */}
        <div className="absolute bottom-12 left-12 hidden md:block">
            <span className="label-tiny text-[#333]" style={{ fontSize: '7px' }}>BUREAU / SYSTEM-09</span>
        </div>

        <div className="absolute bottom-12 right-12 hidden md:block">
            <span className="label-tiny text-[#333]" style={{ fontSize: '7px' }}>©2026 AVANT GARDE</span>
        </div>
      </div>
    </div>
  );
}
