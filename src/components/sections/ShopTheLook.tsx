"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useQuickLook } from "@/store/quickLookStore";

interface Hotspot {
  x: number;
  y: number;
  product: {
    name: string;
    price: string;
    image: string;
  };
}

interface Look {
  image: string;
  hotspots: Hotspot[];
}

const looks: Look[] = [
  {
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop",
    hotspots: [
      {
        x: 30,
        y: 40,
        product: {
          name: "RIBBED BASE LAYER",
          price: "৳1,865",
          image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=200&auto=format&fit=crop",
        },
      },
      {
        x: 65,
        y: 55,
        product: {
          name: "WIDE-LEG ARCHIVE",
          price: "৳3,185",
          image: "https://images.unsplash.com/photo-1529139574466-a303027c028c?q=80&w=200&auto=format&fit=crop",
        },
      },
    ],
  },
  {
    image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1200&auto=format&fit=crop",
    hotspots: [
      {
        x: 45,
        y: 30,
        product: {
          name: "OVERSIZED BLAZER",
          price: "৳7,450",
          image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=200&auto=format&fit=crop",
        },
      },
    ],
  },
];

export default function ShopTheLook() {
  const [activeLook, setActiveLook] = useState(0);
  const [hoveredHotspot, setHoveredHotspot] = useState<Hotspot | null>(null);
  const { openQuickLook } = useQuickLook();

  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initGsap = async () => {
      const { gsap } = await import("@/lib/gsap");

      if (!sectionRef.current) return;

      const ctx = gsap.context(() => {
        if (headingRef.current) {
          gsap.fromTo(
            headingRef.current,
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              duration: 1.2,
              ease: "expo.out",
              scrollTrigger: {
                trigger: headingRef.current,
                start: "top 85%",
              },
            }
          );
        }

        if (imageContainerRef.current) {
          gsap.fromTo(
            imageContainerRef.current,
            { opacity: 0, y: 50 },
            {
              opacity: 1,
              y: 0,
              duration: 1.5,
              ease: "expo.out",
              scrollTrigger: {
                trigger: imageContainerRef.current,
                start: "top 80%",
              },
            }
          );
        }
      }, sectionRef);

      return () => ctx.revert();
    };

    initGsap();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-24 md:py-40 bg-[#0a0a0a] border-y border-white/5">
      <div className="max-w-[1800px] mx-auto px-6 md:px-16 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-12">
          <div ref={headingRef} style={{ opacity: 0 }}>
             <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-[1px] bg-[#333]" />
              <span className="label-tiny text-[#555]">Bureau Curation</span>
            </div>
            <h2 className="font-serif text-5xl md:text-7xl text-white tracking-tight leading-none">
              Shop The <span className="italic text-[#555]">Look</span>
            </h2>
          </div>

          <div className="flex gap-4 border-b border-white/5 pb-4">
            {looks.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveLook(i)}
                className={`label-tiny transition-all px-4 py-2 ${
                  activeLook === i 
                  ? 'text-white border-b border-white' 
                  : 'text-[#333] hover:text-[#555]'
                }`}
              >
                Archive 0{i + 1}
              </button>
            ))}
          </div>
        </div>

        <div ref={imageContainerRef} className="relative aspect-[4/5] md:aspect-[21/9] overflow-hidden bg-[#111]" style={{ opacity: 0 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeLook}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0"
            >
              <Image
                src={looks[activeLook].image}
                alt="Shop the look"
                fill
                className="object-cover grayscale brightness-75 contrast-110"
              />

              {looks[activeLook].hotspots.map((spot, i) => (
                <div
                  key={i}
                  className="absolute"
                  style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                >
                  <motion.button
                    onMouseEnter={() => setHoveredHotspot(spot)}
                    onMouseLeave={() => setHoveredHotspot(null)}
                    onClick={(e) => {
                        e.stopPropagation();
                        openQuickLook({
                            title: spot.product.name,
                            price: spot.product.price.replace('৳', '').replace(',', ''),
                            images: [{ url: spot.product.image }]
                        });
                    }}
                    className="relative w-6 h-6 flex items-center justify-center z-20"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.1, type: "spring" }}
                  >
                    <div className="absolute inset-0 border border-white/50 rounded-full animate-ping opacity-20" />
                    <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                  </motion.button>

                  <AnimatePresence>
                    {hoveredHotspot === spot && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-56 bg-[#111] border border-white/10 p-4 z-50 pointer-events-auto"
                        onClick={(e) => {
                            e.stopPropagation();
                            openQuickLook({
                                title: spot.product.name,
                                price: spot.product.price.replace('৳', '').replace(',', ''),
                                images: [{ url: spot.product.image }]
                            });
                        }}
                      >
                        <div className="relative flex gap-4 z-10">
                          <div className="relative w-14 h-18 flex-none bg-[#1a1a1a] overflow-hidden">
                            <Image src={spot.product.image} alt={spot.product.name} fill className="object-cover grayscale" />
                          </div>
                          <div className="flex flex-col justify-center">
                            <p className="label-tiny text-white leading-tight mb-2">{spot.product.name}</p>
                            <p className="font-serif italic text-[#555] text-sm">{spot.product.price}</p>
                          </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-white/5">
                            <span className="label-tiny text-[#333] hover:text-white transition-colors cursor-pointer" style={{ fontSize: '7px' }}>VIEW ARCHIVE DETAIL —&gt;</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
