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

  useEffect(() => {
    const initGsap = async () => {
      const { gsap } = await import("@/lib/gsap");

      if (!containerRef.current) return;

      const ctx = gsap.context(() => {
        if (textBlockRef.current) {
          gsap.fromTo(
            textBlockRef.current,
            { y: 50, opacity: 0 },
            { 
              y: 0, opacity: 1, duration: 1, ease: "power3.out",
              scrollTrigger: {
                trigger: containerRef.current,
                start: "top 75%",
              }
            }
          );
        }

        if (descRef.current) {
          gsap.fromTo(
            descRef.current,
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              duration: 1,
              ease: "power3.out",
              delay: 0.2,
              scrollTrigger: {
                trigger: containerRef.current,
                start: "top 75%",
              },
            }
          );
        }

        if (imageInnerRef.current) {
          gsap.fromTo(
            imageInnerRef.current,
            { scale: 1.1, opacity: 0 },
            {
              scale: 1,
              opacity: 1,
              duration: 1.5,
              ease: "power3.out",
              scrollTrigger: {
                trigger: imageRef.current,
                start: "top 80%",
              },
            }
          );

          gsap.to(imageInnerRef.current, {
            y: 40,
            ease: "none",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            }
          });
        }
      }, containerRef);

      return () => ctx.revert();
    };

    initGsap();
  }, []);

  return (
    <section 
      ref={containerRef}
      className="relative min-h-[80vh] bg-zinc-50 py-24 md:py-32 px-6 md:px-16 overflow-hidden flex flex-col justify-center rounded-[2.5rem] mt-12 mx-4 md:mx-8"
    >
      <div className="max-w-[1800px] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center relative z-10">
        
        {/* Philosophy Text */}
        <div className="z-20 relative text-zinc-900 order-2 lg:order-1">
             <div ref={textBlockRef} className="lg:block will-change-transform mb-8">
                <span className="text-zinc-500 font-semibold text-xs tracking-wider uppercase mb-4 block">Our Philosophy</span>
                <h2 className="font-display font-bold text-4xl md:text-6xl tracking-tight leading-[1.1] mb-6">
                  Design that feels as good as it looks.
                </h2>
             </div>
             
             <div 
               ref={descRef}
               className="relative"
               style={{ opacity: 0 }}
             >
                <p className="text-zinc-600 text-lg md:text-xl leading-relaxed max-w-lg mb-8">
                  We construct garments not as mere coverings, but as architectural extensions of the self. Every thread is considered. Every silhouette is intentional. 
                </p>
                <div className="flex gap-6 text-sm font-semibold text-zinc-900">
                  <span className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-900" /> Craftsmanship
                  </span>
                  <span className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-900" /> Precision
                  </span>
                  <span className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-900" /> Elegance
                  </span>
                </div>
             </div>
        </div>

        {/* Parallax Image Block */}
        <div ref={imageRef} className="relative h-[60vh] md:h-[70vh] w-full rounded-3xl overflow-hidden shadow-soft-2xl order-1 lg:order-2">
           <div 
             ref={imageInnerRef}
             className="absolute inset-0 w-full h-[120%] -top-[10%] will-change-transform"
             style={{ opacity: 0 }}
           >
              <Image 
                  src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop" 
                  alt="Philosophy Visual"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
              />
           </div>
        </div>

      </div>
    </section>
  );
}
