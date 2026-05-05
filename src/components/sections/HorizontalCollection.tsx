"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import SplitTextAnimation from "@/components/ui/SplitTextAnimation";

const products = [
  {
    id: 1,
    name: "ARCHIVAL SHELL 01",
    category: "Outerwear",
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1000&auto=format&fit=crop",
    price: "৳45,000"
  },
  {
    id: 2,
    name: "NEURAL TEXTILE",
    category: "Base Layer",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop",
    price: "৳28,000"
  },
  {
    id: 3,
    name: "CYBER CARGO",
    category: "Bottoms",
    image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=1000&auto=format&fit=crop",
    price: "৳32,000"
  },
  {
    id: 4,
    name: "VOID RUNNER",
    category: "Footwear",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop",
    price: "৳19,000"
  }
];

export default function HorizontalCollection() {
  const sectionRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initGsap = async () => {
      const { gsap } = await import("@/lib/gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      const pin = gsap.fromTo(
        triggerRef.current,
        { x: 0 },
        {
          x: "-70vw",
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "2000 top",
            scrub: 1,
            pin: true,
            anticipatePin: 1,
          },
        }
      );
      return () => {
        pin.kill();
      };
    };
    initGsap();
  }, []);

  return (
    <section ref={sectionRef} className="bg-[#0a0a0a] overflow-hidden">
      <div className="relative h-screen flex items-center overflow-hidden">
        <div ref={triggerRef} className="flex gap-12 px-12 md:px-32 w-[250vw] items-center">
          
          {/* Header Section as the first 'slide' */}
          <div className="min-w-[400px] md:min-w-[600px] pr-20">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-[1px] bg-[#333]" />
              <span className="label-tiny text-[#555]">Bureau Select</span>
            </div>
            <h2 className="leading-[0.85] space-y-4">
              <SplitTextAnimation 
                text="Seasonal" 
                className="font-serif text-6xl md:text-[10rem] text-white block" 
                delay={0.2}
              />
              <SplitTextAnimation 
                text="Archive." 
                className="font-serif italic text-6xl md:text-[10rem] text-[#555] block" 
                delay={0.4}
              />
            </h2>
            <p className="label-tiny leading-[2] text-[#8e9192] max-w-sm mt-12">
              Architecturally inspired silhouettes crafted from proprietary textiles. Engineered for the modern nomadic state.
            </p>
          </div>

          {/* Product Slides */}
          {products.map((product, idx) => (
            <div 
              key={product.id} 
              className="relative min-w-[350px] md:min-w-[550px] aspect-[3/4] group overflow-hidden bg-[#111]"
            >
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover grayscale group-hover:grayscale-0 transition-all duration-[1.5s] ease-[0.16,1,0.3,1] group-hover:scale-110"
                sizes="600px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-8 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                 <span className="label-tiny text-[#555] mb-2">{product.category}</span>
                 <div className="flex justify-between items-end">
                    <h3 className="font-serif text-white text-2xl md:text-4xl tracking-tight">{product.name}</h3>
                    <p className="font-serif italic text-white text-lg">{product.price}</p>
                 </div>
              </div>
              
              {/* Technical Stamp */}
              <div className="absolute top-6 right-6 p-2 border border-white/5 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <span className="label-tiny text-[#333] block" style={{ fontSize: '6px' }}>LOOK_{idx + 1} / AV-SR-26</span>
              </div>
            </div>
          ))}

          {/* Call to Action slide */}
          <div className="min-w-[400px] flex flex-col items-start gap-8">
            <h4 className="font-serif text-4xl text-white">End of Segment.</h4>
            <Link href="/products" className="btn-pill-primary">Observe Full Archive</Link>
          </div>

        </div>
      </div>
    </section>
  );
}
