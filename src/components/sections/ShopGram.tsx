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
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div>
            <div className="flex items-center gap-2 text-zinc-500 mb-3">
              <Camera size={16} />
              <span className="font-semibold text-xs tracking-wider uppercase">Follow Us</span>
            </div>
            <h2 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-zinc-900 tracking-tight leading-tight">
              Community Feed
            </h2>
          </div>

          <a 
            href="#" 
            className="group flex items-center gap-2 bg-zinc-900 text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-zinc-800 transition-all shadow-soft"
          >
            @flexwear
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </a>
        </div>

        <div ref={trackRef} className="flex gap-6 overflow-x-auto md:overflow-visible pb-10 no-scrollbar">
          {images.map((src, i) => {
            return (
              <a
                href="#"
                key={i}
                ref={(el) => { cardsRef.current[i] = el; }}
                className="relative flex-none w-[70vw] sm:w-[50vw] md:w-[30vw] lg:w-[22vw] aspect-[4/5] rounded-3xl overflow-hidden bg-zinc-100 group shadow-soft"
              >
                <Image
                  src={src}
                  alt={`Social Post ${i}`}
                  fill
                  className="object-cover transition-transform duration-700 ease-[0.16,1,0.3,1] group-hover:scale-105"
                />
                
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                   <div className="w-12 h-12 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white shadow-soft">
                     <Camera size={24} />
                   </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
