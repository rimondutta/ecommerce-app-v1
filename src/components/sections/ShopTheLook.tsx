"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Image from "next/image";
import { Plus, X, Crosshair } from "lucide-react";
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
    <section className="relative py-32 md:py-48 bg-[#f0ece5] overflow-hidden">
      {/* Technical Background Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
           style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="max-w-[1800px] mx-auto px-4 md:px-16 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-10">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <div className="flex items-center gap-4 mb-4">
               <div className="w-8 h-px bg-black" />
               <span className="text-[10px] font-mono font-black uppercase tracking-[0.4em] text-black/60">SYS_VIEW // Editorial</span>
            </div>
            <h2 className="font-display font-black text-6xl md:text-8xl lg:text-[10rem] uppercase tracking-tighter leading-[0.8] mt-6 text-black">
              Shop <br />
              <span className="text-transparent" style={{ WebkitTextStroke: '2px black' }}>The Look</span>
            </h2>
          </motion.div>

          <div className="flex gap-2">
            {looks.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveLook(i)}
                className={`w-16 h-16 flex items-center justify-center font-mono text-sm font-black transition-all border ${activeLook === i ? 'bg-black text-white border-black' : 'bg-white/50 backdrop-blur-sm border-black/10 text-black/40 hover:border-black/50 hover:text-black'}`}
              >
                0{i + 1}
              </button>
            ))}
          </div>
        </div>

        <div className="relative aspect-[4/5] md:aspect-[21/9] bg-black overflow-hidden border border-black/20 group">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeLook}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0"
            >
              <Image
                src={looks[activeLook].image}
                alt="Shop the look"
                fill
                className="object-cover opacity-80 mix-blend-luminosity group-hover:mix-blend-normal group-hover:opacity-100 transition-all duration-1000"
              />

              {/* Grid overlay for technical feel */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.1]" 
                   style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '10% 10%' }} />

              {/* Technical Corners */}
              <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-white/50 pointer-events-none transition-all duration-500 group-hover:border-white" />
              <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-white/50 pointer-events-none transition-all duration-500 group-hover:border-white" />

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
                        openQuickLook({
                            title: spot.product.name,
                            price: spot.product.price.replace('৳', '').replace(',', ''),
                            images: [{ url: spot.product.image }]
                        });
                    }}
                    className="relative w-12 h-12 flex items-center justify-center group/btn z-20 cursor-crosshair"
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.5 + i * 0.2, type: "spring", stiffness: 200, damping: 20 }}
                  >
                    {/* Tactical crosshair icon */}
                    <div className="absolute inset-0 border border-white/40 rounded-full transition-all duration-500 group-hover/btn:scale-125 group-hover/btn:border-white group-hover/btn:bg-white/10 backdrop-blur-sm" />
                    <div className="w-1.5 h-1.5 bg-white rounded-full group-hover/btn:scale-150 transition-transform duration-300" />
                    <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-white/40 -translate-x-1/2 group-hover/btn:bg-white" />
                    <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-white/40 -translate-y-1/2 group-hover/btn:bg-white" />
                  </motion.button>

                  {/* Connecting Line (Technical aesthetic) */}
                  <AnimatePresence>
                    {hoveredHotspot === spot && (
                      <motion.div 
                         initial={{ opacity: 0, width: 0 }}
                         animate={{ opacity: 1, width: 40 }}
                         exit={{ opacity: 0, width: 0 }}
                         className="absolute top-1/2 left-full h-[1px] bg-white z-10"
                      />
                    )}
                  </AnimatePresence>

                  {/* Tooltip */}
                  <AnimatePresence>
                    {hoveredHotspot === spot && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 40 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="absolute top-1/2 -translate-y-1/2 left-full ml-2 w-56 bg-black/80 backdrop-blur-md text-white p-4 pointer-events-none z-50 border border-white/20"
                      >
                        <div className="absolute -left-[5px] top-1/2 -translate-y-1/2 w-[5px] h-[5px] bg-white" />
                        <div className="flex gap-4">
                          <div className="relative w-16 h-20 flex-none border border-white/10">
                            <Image src={spot.product.image} alt={spot.product.name} fill className="object-cover grayscale" />
                          </div>
                          <div className="flex flex-col justify-center">
                            <span className="text-[8px] font-mono uppercase tracking-[0.3em] text-white/50 mb-1">Target_Acquired</span>
                            <p className="text-[10px] font-black uppercase tracking-widest leading-tight">{spot.product.name}</p>
                            <p className="text-[12px] font-mono text-white mt-2">{spot.product.price}</p>
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

