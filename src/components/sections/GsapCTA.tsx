"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
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
      className="relative bg-zinc-900 text-white py-32 md:py-48 flex flex-col items-center justify-center text-center overflow-hidden rounded-[3rem] mx-4 md:mx-8 mb-12 shadow-2xl"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-6 px-6">
        <h2
          data-cta-direct
          className="font-display font-bold text-5xl md:text-8xl lg:text-[10rem] leading-[0.9] tracking-tight will-change-transform"
          style={{ opacity: 0 }}
        >
          Elevate Your
        </h2>
        <h2
          data-cta-toyou
          className="font-display font-medium text-4xl md:text-7xl lg:text-[9rem] leading-[0.9] tracking-tight text-white/50 italic will-change-transform"
          style={{ opacity: 0 }}
        >
          Everyday Style.
        </h2>

        <div data-cta-btn className="mt-12 md:mt-16" style={{ opacity: 0 }}>
          <MagneticElement strength={0.2}>
            <Link
              href="/products"
              className="group relative overflow-hidden bg-white text-zinc-900 px-8 py-4 md:px-10 md:py-5 rounded-full flex items-center justify-center hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all active:scale-95"
            >
              <span className="relative z-10 font-semibold text-sm md:text-base tracking-wide transition-all duration-300">
                Explore Collection
              </span>
            </Link>
          </MagneticElement>
        </div>
      </div>
    </div>
  );
}
