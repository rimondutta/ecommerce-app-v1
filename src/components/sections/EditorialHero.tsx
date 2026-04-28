"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import SplitTextAnimation from "@/components/ui/SplitTextAnimation";
import MagneticElement from "@/components/ui/MagneticElement";

export default function EditorialHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const cornerTLRef = useRef<HTMLDivElement>(null);
  const cornerBRRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // GSAP hero entrance + parallax + marquee
  useEffect(() => {
    const initGsap = async () => {
      const { gsap, ScrollTrigger } = await import("@/lib/gsap");

      if (!containerRef.current) return;

      const ctx = gsap.context(() => {
        // ── Hero image cinematic entrance ──
        if (imageRef.current) {
          gsap.fromTo(
            imageRef.current,
            { scale: 1.6, filter: "blur(20px)", opacity: 0 },
            { scale: 1, filter: "blur(0px)", opacity: 1, duration: 2.5, ease: "expo.out", delay: 1.5 }
          );

          // Parallax on scroll
          gsap.to(imageRef.current, {
            y: 300,
            scale: 1.1,
            ease: "none",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top top",
              end: "bottom top",
              scrub: true,
            },
          });
        }

        // ── HUD elements staggered entrance ──
        if (hudRef.current) {
          const hudElements = hudRef.current.querySelectorAll("[data-hud]");
          gsap.fromTo(
            hudElements,
            { opacity: 0, y: 20, scale: 0.9 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              stagger: 0.1,
              duration: 1,
              ease: "expo.out",
              delay: 2.5
            }
          );
        }

        // ── Fade all content on scroll ──
        ScrollTrigger.create({
          trigger: containerRef.current,
          start: "top top",
          end: "70% top",
          scrub: true,
          onUpdate: (self: any) => {
            const progress = self.progress;
            if (containerRef.current) {
              const content = containerRef.current.querySelector("[data-hero-content]") as HTMLElement;
              if (content) {
                gsap.set(content, {
                  opacity: 1 - progress * 1.5,
                  y: progress * 100,
                  filter: `blur(${progress * 10}px)`
                });
              }
            }
          },
        });
      }, containerRef);

      return () => ctx.revert();
    };

    initGsap();
  }, []);


  return (
    <section
      ref={containerRef}
      className="relative h-[100vh] md:h-[110vh] w-full overflow-hidden bg-black flex items-center justify-center pb-20 md:pb-0"
      data-cursor="SCROLL"
    >
      {/* Background Image with GSAP Parallax */}
      <div
        ref={imageRef}
        className="absolute inset-0 w-full h-full will-change-transform"
        style={{ opacity: 0 }}
      >
        <Image
          src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2040&auto=format&fit=crop"
          alt="Premium Fashion"
          fill
          className="object-cover opacity-60 grayscale contrast-125 mix-blend-luminosity"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/40 to-black" />
      </div>

      {/* Grid Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Corner Brackets */}
      <div ref={cornerTLRef} className="absolute top-6 left-6 md:top-12 md:left-12 w-12 h-12 border-t-2 border-l-2 border-white/30 pointer-events-none z-20" />
      <div ref={cornerBRRef} className="absolute bottom-6 right-6 md:bottom-12 md:right-12 w-12 h-12 border-b-2 border-r-2 border-white/30 pointer-events-none z-20" />

      {/* Decorative HUD Elements */}
      <motion.div
        ref={hudRef}
        className="absolute inset-0 pointer-events-none z-0 hidden md:block"
        animate={{ x: mousePosition.x * -1, y: mousePosition.y * -1 }}
        transition={{ type: "spring", stiffness: 50, damping: 20 }}
      >
        <div data-hud className="absolute top-[40%] right-[8%] flex flex-col gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={`h-px bg-white/20 ${i % 2 === 0 ? 'w-8' : 'w-4'}`} />
          ))}
        </div>
      </motion.div>

      {/* Hero Typography */}
      <div
        data-hero-content
        className="relative z-10 flex flex-col items-center md:items-start md:text-left px-6 md:px-24 w-full max-w-[1800px] mx-auto will-change-transform"
      >
        <div
          ref={badgeRef}
          className="overflow-hidden mb-8"
        >
          <div
            className="flex items-center gap-4 text-white/50 font-bold text-[10px] md:text-xs uppercase tracking-[0.6em] bg-white/5 px-4 py-2 border border-white/10 backdrop-blur-md"
          >
            <div className="w-1.5 h-1.5 bg-white animate-pulse" />
            PREMIUM COLLECTIONS // 2024
          </div>
        </div>

        <SplitTextAnimation
          text="MODERN. ELEGANT. TIMELESS."
          className="font-display font-black text-[10vw] md:text-[8vw] leading-[0.8] tracking-tighter text-white uppercase relative"
        />

        <p
          ref={descRef}
          className="mt-10 text-white/60 text-[10px] md:text-sm font-medium uppercase tracking-[0.2em] max-w-[280px] md:max-w-md leading-relaxed border-l border-white/20 pl-6"
        >
          Exquisite apparel designed for the modern individual. Merging superior comfort with contemporary silhouettes and premium craftsmanship.
        </p>

        <div
          ref={ctaRef}
          className="mt-16 flex flex-col md:flex-row gap-8 items-center"
        >
          <MagneticElement strength={0.2}>
            <Link
              href="/products"
              className="relative overflow-hidden group bg-transparent border border-white/30 px-14 py-6 flex items-center justify-center transition-all hover:border-white hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] active:scale-95 backdrop-blur-sm"
              data-cursor="CLICK"
            >
              <span className="relative z-10 font-black text-[11px] text-white uppercase tracking-[0.3em] group-hover:mix-blend-difference transition-all duration-300">
                Shop Collection
              </span>
              <div className="absolute inset-0 bg-white w-full h-full translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[0.16,1,0.3,1]" />
            </Link>
          </MagneticElement>

          <MagneticElement strength={0.15}>
            <Link
              href="/lookbook"
              className="text-white/40 hover:text-white font-black text-[10px] uppercase tracking-[0.4em] transition-all flex items-center gap-4 group"
            >
              <div className="w-8 h-px bg-white/20 group-hover:w-16 group-hover:bg-white transition-all duration-500" />
              VIEW LOOKBOOK
            </Link>
          </MagneticElement>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        ref={scrollIndicatorRef}
        className="absolute bottom-20 right-8 md:bottom-24 md:right-12 flex flex-col items-end gap-3"
      >
        <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md px-4 py-2 border border-white/10">
          <span className="font-bold text-[9px] text-white/50 uppercase tracking-[0.4em]">
            SCROLL TO EXPLORE
          </span>
          <div className="flex gap-1.5">
            <div className="w-1.5 h-1.5 bg-white animate-pulse" />
            <div className="w-1.5 h-1.5 bg-white/20" />
            <div className="w-1.5 h-1.5 bg-white/20" />
          </div>
        </div>
        <div className="w-px h-12 bg-gradient-to-b from-white/30 to-transparent mr-6 animate-bounce" />
      </div>
    </section>
  );
}
