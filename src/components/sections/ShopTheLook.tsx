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
          name: "Ribbed Tank Top",
          price: "৳1,865",
          image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=200&auto=format&fit=crop",
        },
      },
      {
        x: 65,
        y: 55,
        product: {
          name: "Wide-Leg Trousers",
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
          name: "Oversized Blazer",
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
              duration: 1,
              ease: "power3.out",
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
            { opacity: 0, scale: 0.95 },
            {
              opacity: 1,
              scale: 1,
              duration: 1.2,
              ease: "power3.out",
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
    <section ref={sectionRef} className="relative py-24 md:py-32 bg-white">
      <div className="max-w-[1800px] mx-auto px-6 md:px-16 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div ref={headingRef} style={{ opacity: 0 }}>
            <span className="text-zinc-500 font-semibold text-xs tracking-wider uppercase mb-3 block">Curated Styles</span>
            <h2 className="font-display font-bold text-4xl md:text-5xl text-zinc-900 tracking-tight">
              Shop The Look
            </h2>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 md:pb-0">
            {looks.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveLook(i)}
                className={`flex-none px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                  activeLook === i 
                  ? 'bg-zinc-900 text-white shadow-sm' 
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900'
                }`}
              >
                Look 0{i + 1}
              </button>
            ))}
          </div>
        </div>

        <div ref={imageContainerRef} className="relative aspect-[4/5] md:aspect-[21/9] rounded-3xl overflow-hidden bg-zinc-100" style={{ opacity: 0 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeLook}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0"
            >
              <Image
                src={looks[activeLook].image}
                alt="Shop the look"
                fill
                className="object-cover"
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
                        if (hoveredHotspot === spot) {
                            openQuickLook({
                                title: spot.product.name,
                                price: spot.product.price.replace('৳', '').replace(',', ''),
                                images: [{ url: spot.product.image }]
                            });
                        } else {
                            setHoveredHotspot(spot);
                        }
                    }}
                    className="relative w-8 h-8 flex items-center justify-center group/btn z-20"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 + i * 0.1, type: "spring" }}
                  >
                    <div className="absolute inset-0 bg-white/20 backdrop-blur-md rounded-full shadow-soft" />
                    <div className="w-2.5 h-2.5 bg-white rounded-full group-hover/btn:scale-150 transition-transform duration-300 shadow-sm" />
                  </motion.button>

                  <AnimatePresence>
                    {hoveredHotspot === spot && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-48 bg-white rounded-2xl shadow-soft-xl p-3 z-50 pointer-events-auto border border-zinc-100"
                        onClick={(e) => {
                            e.stopPropagation();
                            openQuickLook({
                                title: spot.product.name,
                                price: spot.product.price.replace('৳', '').replace(',', ''),
                                images: [{ url: spot.product.image }]
                            });
                        }}
                      >
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-t border-l border-zinc-100" />
                        <div className="relative flex gap-3 z-10">
                          <div className="relative w-12 h-16 flex-none rounded-lg overflow-hidden bg-zinc-100">
                            <Image src={spot.product.image} alt={spot.product.name} fill className="object-cover" />
                          </div>
                          <div className="flex flex-col justify-center">
                            <p className="text-sm font-semibold text-zinc-900 leading-tight line-clamp-2">{spot.product.name}</p>
                            <p className="text-sm text-zinc-500 mt-1">{spot.product.price}</p>
                          </div>
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
