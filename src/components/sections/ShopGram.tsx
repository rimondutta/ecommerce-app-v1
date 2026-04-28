"use client";

import { useEffect, useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import SplitTextAnimation from "@/components/ui/SplitTextAnimation";

const images = [
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1529139574466-a303027c028c?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=800&auto=format&fit=crop"
];

export default function ShopGram() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    const initGsap = async () => {
      const { gsap, ScrollTrigger } = await import("@/lib/gsap");

      if (!sectionRef.current) return;

      const ctx = gsap.context(() => {
        // ── Heading reveal ──
        if (headingRef.current) {
          gsap.fromTo(
            headingRef.current,
            { opacity: 0, y: 60 },
            {
              opacity: 1,
              y: 0,
              duration: 1.4,
              ease: "expo.out",
              scrollTrigger: {
                trigger: headingRef.current,
                start: "top 85%",
                toggleActions: "play none none none",
              },
            }
          );
        }

        // ── CTA button ──
        if (ctaRef.current) {
          gsap.fromTo(
            ctaRef.current,
            { opacity: 0, x: -30 },
            {
              opacity: 1,
              x: 0,
              duration: 1,
              ease: "expo.out",
              scrollTrigger: {
                trigger: ctaRef.current,
                start: "top 90%",
                toggleActions: "play none none none",
              },
            }
          );
        }

        // ── GSAP Horizontal Scroll on the image track ──
        if (trackRef.current) {
          const totalScrollWidth = trackRef.current.scrollWidth - trackRef.current.offsetWidth;

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

        // ── Individual cards — staggered clip-path reveal ──
        cardsRef.current.forEach((card, idx) => {
          if (!card) return;

          gsap.fromTo(
            card,
            { clipPath: "inset(0 100% 0 0)", opacity: 0 },
            {
              clipPath: "inset(0 0% 0 0)",
              opacity: 1,
              duration: 1.2,
              ease: "expo.inOut",
              scrollTrigger: {
                trigger: card,
                start: "left 90%",
                toggleActions: "play none none none",
                horizontal: false,
              },
              delay: idx * 0.15,
            }
          );

          // Image parallax within each card
          const img = card.querySelector("img");
          if (img) {
            gsap.to(img, {
              y: -30,
              ease: "none",
              scrollTrigger: {
                trigger: sectionRef.current,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            });
          }
        });
      }, sectionRef);

      return () => ctx.revert();
    };

    initGsap();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-32 bg-[#f0ece5] overflow-hidden border-t border-black/10">
      {/* Background Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
           style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="max-w-[1900px] mx-auto px-4 md:px-16 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-10">
          <div ref={headingRef} style={{ opacity: 0 }}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-2 h-2 bg-black animate-pulse" />
              <span className="text-[10px] font-mono font-black uppercase tracking-[0.4em] text-black/60">SYS_NETWORK // Feed</span>
            </div>
            <SplitTextAnimation 
              text="Network"
              className="font-display font-black text-5xl md:text-[9rem] uppercase tracking-tighter leading-[0.8] text-black"
            />
            <SplitTextAnimation 
              text="Data"
              className="font-display font-black text-5xl md:text-[9rem] uppercase tracking-tighter leading-[0.8] text-transparent"
              style={{ WebkitTextStroke: '2px black' }}
              delay={0.4}
            />
          </div>

          <a 
            ref={ctaRef}
            href="#" 
            className="group flex items-center gap-6 text-[10px] font-mono font-bold uppercase tracking-[0.3em] bg-black text-white px-8 py-4 hover:bg-black/80 transition-colors"
            data-cursor="CLICK"
            style={{ opacity: 0 }}
          >
            @flexwear_sys
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </a>
        </div>

        <div ref={trackRef} className="flex gap-4 md:gap-8 overflow-visible pb-10 will-change-transform">
          {images.map((src, i) => {
            return (
              <a
                href="#"
                key={i}
                ref={(el) => { cardsRef.current[i] = el; }}
                className="relative flex-none w-[70vw] md:w-[25vw] aspect-[3/4] overflow-hidden border border-black/20 bg-black group will-change-transform"
                data-cursor="VIEW"
              >
                {/* Image */}
                <img
                  src={src}
                  alt={`Network Data ${i}`}
                  className="w-full h-full object-cover mix-blend-luminosity opacity-80 group-hover:opacity-100 group-hover:mix-blend-normal transition-all duration-700 group-hover:scale-105 will-change-transform"
                />
                
                {/* Overlay Grid */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.05]" 
                   style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '10px 10px' }} />
                   
                {/* Corner Accents */}
                <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-white/50" />
                <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-white/50" />
                <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-white/50" />
                <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-white/50" />
                
                {/* ID Label */}
                <div className="absolute bottom-6 left-6 font-mono text-[8px] tracking-[0.3em] text-white/70 uppercase">
                  ID_{i.toString().padStart(3, '0')}
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
