"use client";

import { useState } from "react";
import Image from "next/image";
import { Eye, X } from "lucide-react";

const lookbookSlides = [
  {
    image: "https://picsum.photos/1200/700?random=110",
    hotspots: [
      {
        x: 30,
        y: 40,
        product: {
          name: "Ribbed Tank Top",
          price: "৳1,865",
          image: "https://picsum.photos/100/130?random=1",
        },
      },
      {
        x: 65,
        y: 55,
        product: {
          name: "Wide-Leg Trousers",
          price: "৳3,185",
          image: "https://picsum.photos/100/130?random=11",
        },
      },
    ],
  },
  {
    image: "https://picsum.photos/1200/700?random=111",
    hotspots: [
      {
        x: 45,
        y: 35,
        product: {
          name: "Silk Blend Blouse",
          price: "৳4,285",
          image: "https://picsum.photos/100/130?random=15",
        },
      },
      {
        x: 20,
        y: 60,
        product: {
          name: "Denim Mini Skirt",
          price: "৳2,195",
          image: "https://picsum.photos/100/130?random=14",
        },
      },
    ],
  },
];

export default function ShopTheLook() {
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);

  return (
    <section className="py-16 lg:py-20 bg-accent" aria-label="Shop the look">
      <div className="max-w-[1440px] mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-primary">Shop the look</h2>
          <p className="text-sm text-gray-500 mt-2">
            Pair your favorites together for a complete outfit
          </p>
        </div>

        <div className="space-y-8">
          {lookbookSlides.map((slide, slideIdx) => (
            <div key={slideIdx} className="relative rounded-xl overflow-hidden">
              <div className="aspect-[16/9] sm:aspect-[2/1] relative">
                <Image
                  src={slide.image}
                  alt={`Lookbook ${slideIdx + 1}`}
                  fill
                  className="object-cover"
                  sizes="100vw"
                />

                {/* Hotspots */}
                {slide.hotspots.map((hotspot, hotIdx) => {
                  const key = `${slideIdx}-${hotIdx}`;
                  const isOpen = activeHotspot === key;
                  return (
                    <div
                      key={key}
                      className="absolute z-10"
                      style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
                    >
                      {/* Pulsing dot */}
                      <button
                        onClick={() => setActiveHotspot(isOpen ? null : key)}
                        className="relative w-8 h-8 flex items-center justify-center"
                        aria-label={`View ${hotspot.product.name}`}
                      >
                        <span className="w-3 h-3 bg-white rounded-full z-10 relative shadow-md" />
                        <span className="absolute w-6 h-6 bg-white/40 rounded-full animate-pulse-dot" />
                      </button>

                      {/* Product card dropdown */}
                      {isOpen && (
                        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-52 bg-white rounded-lg shadow-xl p-3 animate-fade-in-up z-20">
                          <button
                            onClick={() => setActiveHotspot(null)}
                            className="absolute top-1.5 right-1.5 text-gray-400 hover:text-primary"
                            aria-label="Close"
                          >
                            <X size={14} />
                          </button>
                          <div className="flex gap-3">
                            <div className="w-16 h-20 relative rounded overflow-hidden shrink-0 bg-gray-100">
                              <Image
                                src={hotspot.product.image}
                                alt={hotspot.product.name}
                                fill
                                className="object-cover"
                                sizes="64px"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-primary truncate">
                                {hotspot.product.name}
                              </p>
                              <p className="text-xs font-semibold text-primary mt-0.5">
                                {hotspot.product.price}
                              </p>
                              <button className="mt-1.5 flex items-center gap-1 text-[10px] text-gray-500 hover:text-primary transition-colors">
                                <Eye size={10} /> Quick view
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
