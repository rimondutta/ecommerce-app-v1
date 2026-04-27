"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Image from "next/image";
import { Plus, X } from "lucide-react";
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

  return (
    <section className="relative py-40 bg-white overflow-hidden">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-10">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400">Editorial // Series 01</span>
            <h2 className="font-display font-black text-7xl md:text-9xl uppercase tracking-tighter leading-[0.8] mt-6">
              Shop <br />
              <span className="text-neutral-300 italic">The Look</span>
            </h2>
          </motion.div>

          <div className="flex gap-4">
            {looks.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveLook(i)}
                className={`w-12 h-12 flex items-center justify-center font-black transition-all border-2 ${activeLook === i ? 'bg-black text-white border-black' : 'border-neutral-100 text-neutral-400 hover:border-black'}`}
              >
                0{i + 1}
              </button>
            ))}
          </div>
        </div>

        <div className="relative aspect-[16/9] md:aspect-[21/9] bg-neutral-100 rounded-[2rem] overflow-hidden border-2 border-black">
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
                className="object-cover grayscale hover:grayscale-0 transition-all duration-1000"
              />

              {/* Hotspots */}
              {looks[activeLook].hotspots.map((spot, i) => (
                <div
                  key={i}
                  className="absolute"
                  style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                >
                  <motion.button
                    onMouseEnter={() => setHoveredHotspot(spot)}
                    onMouseLeave={() => setHoveredHotspot(null)}
                    onClick={() => {
                        // In a real app, you'd fetch the actual product by ID/Slug
                        // For this component, we pass the basic info we have
                        openQuickLook({
                            title: spot.product.name,
                            price: spot.product.price.replace('৳', '').replace(',', ''),
                            images: [{ url: spot.product.image }]
                        });
                    }}
                    className="relative w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-2xl border-2 border-black group"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                  >
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
                    
                    {/* Pulsing effect */}
                    <div className="absolute inset-0 rounded-full border border-white animate-ping opacity-75" />
                  </motion.button>

                  {/* Tooltip */}
                  <AnimatePresence>
                    {hoveredHotspot === spot && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-48 bg-black text-white p-4 shadow-2xl pointer-events-none z-50 border border-white/20"
                      >
                        <div className="flex gap-4">
                          <div className="relative w-12 h-16 flex-none">
                            <Image src={spot.product.image} alt={spot.product.name} fill className="object-cover" />
                          </div>
                          <div className="flex flex-col justify-center">
                            <p className="text-[10px] font-black uppercase tracking-widest leading-tight">{spot.product.name}</p>
                            <p className="text-[12px] font-medium text-neutral-400 mt-1">{spot.product.price}</p>
                          </div>
                        </div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-black" />
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
