"use client";

import { useEffect, useRef } from "react";
import { Camera } from "lucide-react";
import Image from "next/image";

const images = [
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1529139574466-a303027c028c?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=800&auto=format&fit=crop"
];

export default function ShopGram() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    const initGsap = async () => {
      const { gsap } = await import("@/lib/gsap");

      if (!sectionRef.current) return;

      const ctx = gsap.context(() => {
        // Horizontal Scroll
        if (trackRef.current) {
          const totalScrollWidth = trackRef.current.scrollWidth - trackRef.current.offsetWidth;
          
          if (window.innerWidth > 768) {
            gsap.to(trackRef.current, {
              x: -totalScrollWidth,
              ease: "none",
              scrollTrigger: {
                trigger: sectionRef.current,
                start: "top 60%",
                end: `+=${totalScrollWidth}`,
                scrub: 1,
                invalidateOnRefresh: true,
              },
            });
          }
        }

        // Cards fade up
        cardsRef.current.forEach((card, idx) => {
          if (!card) return;

          gsap.fromTo(
            card,
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              duration: 1.2,
              ease: "expo.out",
              scrollTrigger: {
                trigger: card,
                start: "left 90%",
                toggleActions: "play none none none",
                horizontal: false,
              },
              delay: idx * 0.1,
            }
          );
        });
      }, sectionRef);

      return () => ctx.revert();
    };

    initGsap();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-24 md:py-40 bg-[#0a0a0a] overflow-hidden border-t border-white/5">
      {/* Scanlines Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] z-20 scanlines" />

      <div className="max-w-[1800px] mx-auto px-6 md:px-16 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-24 md:mb-32 gap-12 relative z-20">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-[1px] bg-[#333]" />
              <span className="label-tiny text-[#555]">Visual Archive</span>
            </div>
            <h2 className="leading-[0.85]">
              <span className="font-serif text-5xl md:text-8xl text-white block">Community</span>
              <span className="font-serif italic text-5xl md:text-8xl text-[#555] block">Network.</span>
            </h2>
          </div>

          <a 
            href="#" 
            className="label-tiny text-white border border-white/20 px-10 py-5 hover:bg-white hover:text-black transition-all"
          >
            FOLLOW @AVANT_GARDE
          </a>
        </div>

        <div ref={trackRef} className="flex gap-4 overflow-x-auto md:overflow-visible pb-10 no-scrollbar">
          {images.map((src, i) => {
            return (
              <a
                href="#"
                key={i}
                ref={(el) => { cardsRef.current[i] = el; }}
                className="relative flex-none w-[80vw] sm:w-[60vw] md:w-[40vw] lg:w-[32vw] aspect-[4/5] overflow-hidden bg-[#111] group"
                data-cursor-text="OBSERVE"
              >
                <Image
                  src={src}
                  alt={`Social Post ${i}`}
                  fill
                  className="object-cover grayscale transition-all duration-[1s] ease-[0.16,1,0.3,1] group-hover:scale-105 group-hover:grayscale-0"
                />
                
                <div className="absolute inset-0 bg-[#0a0a0a]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                <div className="absolute inset-0 flex items-center justify-center translate-y-10 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-700 ease-[0.16,1,0.3,1]">
                   <div className="w-16 h-16 border border-white/20 flex items-center justify-center text-white">
                     <Camera size={24} strokeWidth={1} />
                   </div>
                </div>

                <div className="absolute bottom-8 left-8 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                  <span className="label-tiny text-white" style={{ fontSize: '7px' }}>ARCHIVAL LOG 00{i+1}</span>
                  <span className="label-tiny text-white/40">© 2026 AVANT</span>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
