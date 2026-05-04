"use client";

import { useEffect, useRef } from "react";
import { ArrowUpRight, Camera } from "lucide-react";
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
              duration: 1,
              ease: "power3.out",
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
    <section ref={sectionRef} className="relative py-24 md:py-32 bg-white overflow-hidden">
      <div className="max-w-[1800px] mx-auto px-6 md:px-16 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-12 relative z-20">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              <Camera size={14} className="text-zinc-400" />
              <span className="text-zinc-500 font-bold text-[10px] md:text-xs tracking-[0.3em] uppercase">Visual Journal</span>
            </div>
            <h2 className="font-display font-black text-5xl md:text-8xl text-zinc-900 tracking-tighter leading-[0.85]">
              Community<br/>
              <span className="text-zinc-400 italic">Feed.</span>
            </h2>
          </div>

          <a 
            href="#" 
            className="group relative flex items-center gap-4 bg-black text-white px-8 py-4 rounded-full text-[11px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-2xl overflow-hidden"
          >
            <span className="relative z-10">Follow @flexwear</span>
            <div className="absolute inset-0 bg-zinc-800 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[0.16,1,0.3,1]" />
          </a>
        </div>

        <div ref={trackRef} className="flex gap-6 overflow-x-auto md:overflow-visible pb-10 no-scrollbar">
          {images.map((src, i) => {
            return (
              <a
                href="#"
                key={i}
                ref={(el) => { cardsRef.current[i] = el; }}
                className="relative flex-none w-[80vw] sm:w-[60vw] md:w-[40vw] lg:w-[32vw] aspect-[4/5] rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden bg-zinc-100 group shadow-soft-xl"
                data-cursor-text="FOLLOW"
              >
                <Image
                  src={src}
                  alt={`Social Post ${i}`}
                  fill
                  className="object-cover transition-transform duration-1000 ease-[0.16,1,0.3,1] group-hover:scale-110"
                />
                
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="absolute inset-0 flex items-center justify-center translate-y-10 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-700 ease-[0.16,1,0.3,1]">
                   <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/30">
                     <Camera size={28} />
                   </div>
                </div>

                <div className="absolute bottom-10 left-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <span className="text-white text-[10px] font-black uppercase tracking-[0.2em]">Flexwear / Journal</span>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
