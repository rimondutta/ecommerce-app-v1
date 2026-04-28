"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import MagneticElement from "@/components/ui/MagneticElement";

export default function GsapCTA() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initGsap = async () => {
      const { gsap, ScrollTrigger } = await import("@/lib/gsap");
      if (!sectionRef.current) return;

      const ctx = gsap.context(() => {
        // Pin and scrub the text reveal
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            end: "top 20%",
            scrub: 1,
          },
        });

        // "DIRECT" text — slides in from right
        const directText = sectionRef.current!.querySelector("[data-cta-direct]");
        if (directText) {
          tl.fromTo(directText,
            { x: 200, opacity: 0, skewX: -10 },
            { x: 0, opacity: 1, skewX: 0, ease: "expo.out" },
            0
          );
        }

        // "TO YOU" text — slides in from left
        const toYouText = sectionRef.current!.querySelector("[data-cta-toyou]");
        if (toYouText) {
          tl.fromTo(toYouText,
            { x: -200, opacity: 0, skewX: 10 },
            { x: 0, opacity: 1, skewX: 0, ease: "expo.out" },
            0.1
          );
        }

        // CTA button
        const ctaBtn = sectionRef.current!.querySelector("[data-cta-btn]");
        if (ctaBtn) {
          gsap.fromTo(ctaBtn,
            { opacity: 0, y: 40 },
            {
              opacity: 1, y: 0, duration: 1.2, ease: "expo.out",
              scrollTrigger: { trigger: ctaBtn, start: "top 90%" },
            }
          );
        }

        // Decorative lines
        const lines = sectionRef.current!.querySelectorAll("[data-cta-line]");
        gsap.fromTo(lines, { scaleX: 0 }, {
          scaleX: 1, stagger: 0.2, duration: 1.5, ease: "expo.inOut",
          scrollTrigger: { trigger: sectionRef.current, start: "top 70%" },
        });
      }, sectionRef);

      return () => ctx.revert();
    };

    initGsap();
  }, []);

  return (
    <div
      ref={sectionRef}
      className="relative z-10 bg-black text-white py-32 md:py-48 flex flex-col items-center justify-center text-center overflow-hidden"
      data-cursor="EXPLORE"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
           style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Decorative lines */}
      <div data-cta-line className="absolute top-1/3 left-0 right-0 h-px bg-white/10 origin-left" style={{ transform: "scaleX(0)" }} />
      <div data-cta-line className="absolute top-2/3 left-0 right-0 h-px bg-white/10 origin-right" style={{ transform: "scaleX(0)" }} />

      <div className="relative z-10 flex flex-col items-center gap-6">
        <h2
          data-cta-direct
          className="font-display font-black text-6xl md:text-[18rem] uppercase leading-none tracking-tighter mix-blend-difference will-change-transform"
          style={{ opacity: 0 }}
        >
          DIRECT
        </h2>
        <h2
          data-cta-toyou
          className="font-display font-black text-6xl md:text-[12rem] uppercase leading-none tracking-tighter italic text-white/50 will-change-transform"
          style={{ opacity: 0 }}
        >
          TO YOU
        </h2>

        <div data-cta-btn className="mt-16" style={{ opacity: 0 }}>
          <MagneticElement strength={0.25}>
            <Link
              href="/products"
              className="group relative overflow-hidden border border-white/30 px-16 py-6 flex items-center justify-center hover:border-white hover:shadow-[0_0_40px_rgba(255,255,255,0.15)] transition-all active:scale-95 backdrop-blur-sm"
              data-cursor="CLICK"
            >
              <span className="relative z-10 font-black text-[11px] text-white uppercase tracking-[0.4em] group-hover:mix-blend-difference transition-all duration-300">
                Enter Archive
              </span>
              <div className="absolute inset-0 bg-white w-full h-full translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[0.16,1,0.3,1]" />
            </Link>
          </MagneticElement>
        </div>
      </div>
    </div>
  );
}
