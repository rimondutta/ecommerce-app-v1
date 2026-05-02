"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import MagneticElement from "@/components/ui/MagneticElement";

export default function GsapCTA() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initGsap = async () => {
      const { gsap } = await import("@/lib/gsap");
      if (!sectionRef.current) return;

      const ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            end: "top 20%",
            scrub: 1,
          },
        });

        const directText = sectionRef.current!.querySelector("[data-cta-direct]");
        if (directText) {
          tl.fromTo(directText,
            { y: 50, opacity: 0 },
            { y: 0, opacity: 1, ease: "power2.out" },
            0
          );
        }

        const toYouText = sectionRef.current!.querySelector("[data-cta-toyou]");
        if (toYouText) {
          tl.fromTo(toYouText,
            { y: 50, opacity: 0 },
            { y: 0, opacity: 1, ease: "power2.out" },
            0.1
          );
        }

        const ctaBtn = sectionRef.current!.querySelector("[data-cta-btn]");
        if (ctaBtn) {
          gsap.fromTo(ctaBtn,
            { opacity: 0, y: 30 },
            {
              opacity: 1, y: 0, duration: 1, ease: "power3.out",
              scrollTrigger: { trigger: ctaBtn, start: "top 90%" },
            }
          );
        }
      }, sectionRef);

      return () => ctx.revert();
    };

    initGsap();
  }, []);

  return (
    <div
      ref={sectionRef}
      className="relative bg-zinc-950 text-white py-32 md:py-56 flex flex-col items-center justify-center text-center overflow-hidden rounded-[4rem] mx-4 md:mx-10 mb-16 shadow-2xl perspective-1000"
    >
      {/* 3D Animated Sphere Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
           animate={{ 
             scale: [1, 1.2, 1],
             rotate: [0, 180, 360],
             opacity: [0.1, 0.2, 0.1]
           }}
           transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
           className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-white/20 to-transparent blur-3xl"
        />
        <motion.div 
           animate={{ 
             scale: [1.2, 1, 1.2],
             rotate: [360, 180, 0],
             opacity: [0.1, 0.15, 0.1]
           }}
           transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
           className="absolute -bottom-[20%] -left-[10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-zinc-500/20 to-transparent blur-3xl"
        />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 px-6 preserve-3d">
        <div className="flex flex-col items-center gap-2 mb-4">
           <div className="w-12 h-[1px] bg-white/20 mb-4" />
           <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/50">Final Call</p>
        </div>

        <h2
          data-cta-direct
          className="font-display font-bold text-6xl md:text-8xl lg:text-[12rem] leading-[0.85] tracking-tighter will-change-transform"
          style={{ opacity: 0, transform: "translateZ(100px)" }}
        >
          OWN THE<br/>
          MOMENT.
        </h2>
        
        <h2
          data-cta-toyou
          className="font-display font-medium text-4xl md:text-7xl lg:text-[8rem] leading-[0.9] tracking-tight text-zinc-500 italic will-change-transform"
          style={{ opacity: 0, transform: "translateZ(50px)" }}
        >
          Style Re-imagined.
        </h2>

        <div data-cta-btn className="mt-16 md:mt-24" style={{ opacity: 0, transform: "translateZ(80px)" }}>
          <MagneticElement strength={0.25}>
            <Link
              href="/products"
              className="group relative overflow-hidden bg-white text-zinc-950 px-14 py-6 rounded-full flex items-center justify-center hover:shadow-[0_0_60px_rgba(255,255,255,0.4)] transition-all active:scale-95"
            >
              <span className="relative z-10 font-bold text-sm md:text-base tracking-[0.1em] uppercase">
                Shop the Drop
              </span>
            </Link>
          </MagneticElement>
        </div>
      </div>
    </div>
  );
}
