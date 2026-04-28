"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import SplitTextAnimation from "@/components/ui/SplitTextAnimation";

export default function TechnicalBlueprint() {
  const containerRef = useRef<HTMLElement>(null);
  const textBlockRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const imageInnerRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const specTagsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initGsap = async () => {
      const { gsap, ScrollTrigger } = await import("@/lib/gsap");

      if (!containerRef.current) return;

      const ctx = gsap.context(() => {
        // ── Pin the section for a scrub-driven experience ──
        const pinTl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "+=150%",
            scrub: 1,
            pin: true,
            anticipatePin: 1,
          },
        });

        // ── Text block parallax ──
        if (textBlockRef.current) {
          pinTl.fromTo(
            textBlockRef.current,
            { y: 80 },
            { y: -120, ease: "none" },
            0
          );
        }

        // ── Description fade + slide ──
        if (descRef.current) {
          gsap.fromTo(
            descRef.current,
            { opacity: 0, x: -50, clipPath: "inset(0 100% 0 0)" },
            {
              opacity: 1,
              x: 0,
              clipPath: "inset(0 0% 0 0)",
              duration: 1.4,
              ease: "expo.out",
              scrollTrigger: {
                trigger: descRef.current,
                start: "top 85%",
                toggleActions: "play none none none",
              },
            }
          );
        }

        // ── Spec tags stagger ──
        if (specTagsRef.current) {
          const tags = specTagsRef.current.children;
          gsap.fromTo(
            tags,
            { opacity: 0, y: 20 },
            {
              opacity: 1,
              y: 0,
              stagger: 0.1,
              duration: 0.8,
              ease: "expo.out",
              scrollTrigger: {
                trigger: specTagsRef.current,
                start: "top 85%",
                toggleActions: "play none none none",
              },
            }
          );
        }

        // ── Image scale reveal ──
        if (imageInnerRef.current) {
          gsap.fromTo(
            imageInnerRef.current,
            { scale: 1.3, opacity: 0 },
            {
              scale: 1,
              opacity: 1,
              duration: 2,
              ease: "expo.out",
              scrollTrigger: {
                trigger: imageRef.current,
                start: "top 80%",
                toggleActions: "play none none none",
              },
            }
          );

          // Image parallax scrub
          pinTl.fromTo(
            imageInnerRef.current,
            { y: -50 },
            { y: 50, ease: "none" },
            0
          );
        }

        // ── Decorative frame parallax ──
        if (frameRef.current) {
          pinTl.fromTo(
            frameRef.current,
            { y: 0 },
            { y: 80, ease: "none" },
            0
          );
        }

        // ── Badge spring entrance ──
        if (badgeRef.current) {
          gsap.fromTo(
            badgeRef.current,
            { scale: 0, rotation: -45 },
            {
              scale: 1,
              rotation: 0,
              duration: 1.5,
              ease: "elastic.out(1, 0.5)",
              scrollTrigger: {
                trigger: badgeRef.current,
                start: "top 85%",
                toggleActions: "play none none none",
              },
            }
          );

          // Badge rotating dashed border
          const dashedBorder = badgeRef.current.querySelector("[data-dashed]");
          if (dashedBorder) {
            gsap.to(dashedBorder, {
              rotation: 360,
              ease: "none",
              scrollTrigger: {
                trigger: containerRef.current,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            });
          }
        }
      }, containerRef);

      return () => ctx.revert();
    };

    initGsap();
  }, []);

  return (
    <section 
      ref={containerRef}
      className="relative min-h-[90vh] bg-[#f0ece5] py-20 md:py-32 px-4 md:px-16 overflow-hidden flex flex-col justify-center"
    >
      {/* Blueprint Grid Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
           style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

      <div className="max-w-[1800px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
        
        {/* Abstract Philosophy Text */}
        <div className="lg:col-span-7 z-20 relative pointer-events-none text-black">
             <div ref={textBlockRef} className="lg:block will-change-transform">
                <div className="pb-4 mb-4">
                  <SplitTextAnimation 
                    text="Form"
                    className="font-display font-black text-5xl md:text-[11vw] uppercase tracking-tighter leading-[0.85]"
                    style={{ WebkitTextStroke: '1px rgba(0,0,0,0.3)', color: 'transparent' }}
                  />
                  <SplitTextAnimation 
                    text="Follows"
                    className="font-display italic font-light text-black text-5xl md:text-[11vw] uppercase tracking-tighter leading-[0.85]"
                    delay={0.4}
                  />
                  <SplitTextAnimation 
                    text="Feeling"
                    className="font-display font-black text-5xl md:text-[11vw] uppercase tracking-tighter leading-[0.85]"
                    style={{ WebkitTextStroke: '2px rgba(0,0,0,1)', color: 'transparent' }}
                    delay={0.6}
                  />
                </div>
             </div>
             
             <div 
               ref={descRef}
               className="relative border-l border-black/20 pl-6 ml-2 md:ml-12"
               style={{ opacity: 0 }}
             >
                <div className="absolute -left-[3px] top-0 w-1.5 h-1.5 bg-black" />
                <p className="font-mono text-sm md:text-lg uppercase tracking-widest leading-relaxed max-w-xl opacity-90">
                  We construct garments not as mere coverings, but as architectural extensions of the self. Every thread is considered. Every silhouette is intentional. 
                </p>
                <div ref={specTagsRef} className="mt-8 flex gap-4 font-mono text-[10px] text-black/50 tracking-widest">
                  <span>[ CRAFTSMANSHIP ]</span>
                  <span>[ PRECISION ]</span>
                  <span>[ ELEGANCE ]</span>
                </div>
             </div>
        </div>

        {/* Parallax Image Block */}
        <div ref={imageRef} className="lg:col-span-5 relative h-[70vh] w-full mt-20 lg:mt-0 group cursor-crosshair">
           {/* Decorative frame */}
           <div ref={frameRef} className="absolute inset-0 border border-black/10 -m-4 pointer-events-none hidden md:block will-change-transform" />
           
           <div 
             ref={imageInnerRef}
             className="relative w-full h-full overflow-hidden bg-black will-change-transform"
             style={{ opacity: 0 }}
           >
              <Image 
                  src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop" 
                  alt="Philosophy Visual"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover opacity-60 grayscale mix-blend-luminosity group-hover:opacity-100 group-hover:grayscale-0 group-hover:mix-blend-normal transition-all duration-1000 group-hover:scale-110"
              />
              
              {/* Decorative Crosshairs */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className="w-full h-[1px] bg-white/30 absolute top-1/2" />
                <div className="w-[1px] h-full bg-white/30 absolute left-1/2" />
                <div className="w-16 h-16 border border-white/50 flex items-center justify-center backdrop-blur-sm">
                  <div className="w-1 h-1 bg-white" />
                </div>
              </div>
           </div>
           
           {/* Rotating Badge */}
           <div 
             ref={badgeRef}
             className="absolute -bottom-12 -left-12 md:-left-24 bg-black text-white p-2 w-40 h-40 md:w-56 md:h-56 flex flex-col items-center justify-center text-center shadow-[0_0_40px_rgba(0,0,0,0.2)] border border-white/10 z-30 will-change-transform"
             style={{ transform: "scale(0)" }}
           >
               <div 
                  data-dashed
                  className="absolute inset-2 border border-dashed border-white/20 will-change-transform"
               />
               <div className="relative z-10 flex flex-col items-center">
                 <span className="font-display font-black text-4xl md:text-6xl mb-0 leading-none">FW</span>
                 <span className="font-mono text-[8px] md:text-[10px] uppercase tracking-[0.3em] opacity-60 mt-2 text-center">
                   Quality Over<br/>Quantity
                 </span>
               </div>
               
               {/* Circular Text */}
               <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full animate-[spin_20s_linear_infinite] opacity-30">
                 <path id="circlePath" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" fill="none" />
                 <text fontSize="8.5" fontFamily="monospace" letterSpacing="0.2em">
                   <textPath href="#circlePath" startOffset="0%">
                     • PREMIUM APPAREL • TIMELESS DESIGN •
                   </textPath>
                 </text>
               </svg>
           </div>
        </div>

      </div>
    </section>
  );
}
