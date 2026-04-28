"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Box, Layers, MousePointer2, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Category {
  name: string;
  slug: string;
  count?: number;
}

export default function BrutalistCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/store/categories");
        const data = await res.json();
        if (data.categories) setCategories(data.categories);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    fetchCategories();

    // GSAP scroll animation
    const initGsap = async () => {
      const { gsap, ScrollTrigger } = await import("@/lib/gsap");
      if (!sectionRef.current) return;

      const ctx = gsap.context(() => {
        const cards = sectionRef.current!.querySelectorAll("[data-cat-card]");
        gsap.fromTo(cards, 
          { opacity: 0, y: 50, rotateX: -15 },
          { 
            opacity: 1, 
            y: 0, 
            rotateX: 0,
            stagger: 0.1, 
            duration: 1, 
            ease: "expo.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 75%",
            }
          }
        );

        // Header animation
        gsap.from(sectionRef.current!.querySelector("[data-cat-header]"), {
          opacity: 0,
          x: -50,
          duration: 1.2,
          ease: "expo.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 85%",
          }
        });
      }, sectionRef);

      return () => ctx.revert();
    };
    initGsap();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 md:py-40 bg-[#f9f9f9] overflow-hidden relative border-y border-black/5">
      {/* Background Decorative Text */}
      <div className="absolute top-0 right-0 pointer-events-none select-none opacity-[0.02] transform rotate-90 origin-top-right translate-y-20">
        <span className="text-[20vw] font-black uppercase leading-none">COLLECTIONS</span>
      </div>

      <div className="max-w-[1800px] mx-auto px-6 md:px-12 relative z-10">
        {/* Section Header */}
        <div data-cat-header className="flex flex-col md:flex-row justify-between items-end gap-12 mb-20 md:mb-32">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-[2px] bg-black" />
              <span className="font-mono font-black text-[10px] md:text-xs uppercase tracking-[0.5em] text-black/50">Explore Our Store</span>
            </div>
            <h2 className="font-display font-black text-[12vw] md:text-[7vw] leading-[0.8] uppercase tracking-tighter">
              Shop By<br />Category
            </h2>
          </div>
          
          <div className="max-w-md text-right flex flex-col items-end gap-8">
            <p className="text-[11px] md:text-xs font-medium uppercase tracking-widest text-black/40 leading-relaxed max-w-[300px]">
              Discover our carefully curated selections designed for versatile styling and daily functionality.
            </p>
            <Link 
              href="/products" 
              className="group flex items-center gap-4 bg-black text-white px-8 py-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:pr-12"
              data-cursor="ALL_PRODUCTS"
            >
              Browse Catalog
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-2" />
            </Link>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.slice(0, 4).map((cat, index) => (
            <Link
              key={cat.slug}
              href={`/products?category=${cat.name}`}
              data-cat-card
              className="group relative h-[500px] md:h-[650px] overflow-hidden bg-white border border-black/5"
              data-cursor="VIEW"
            >
              {/* Card Background Overlay */}
              <div className="absolute inset-0 bg-black translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-[0.16,1,0.3,1] z-10" />
              
              <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-between h-full relative z-20 transition-colors duration-500 group-hover:text-white">
                <div className="flex justify-between items-start">
                  <span className="font-mono text-[10px] font-black border border-current px-3 py-1 uppercase tracking-widest">
                    Category_{index + 1}
                  </span>
                  <div className="w-10 h-10 border border-current rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 -translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                    <ArrowRight size={18} className="-rotate-45" />
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="font-display font-black text-5xl md:text-6xl uppercase tracking-tighter leading-none">
                    {cat.name}
                  </h3>
                  <div className="flex items-center gap-4 opacity-40 group-hover:opacity-100 transition-opacity">
                    <div className="w-8 h-px bg-current" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                      Explore Collection
                    </span>
                  </div>
                </div>
              </div>

              {/* Hover Image Reveal */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-700 z-0">
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center grayscale" />
              </div>
            </Link>
          ))}
          
          {/* Custom Additions if few categories */}
          {categories.length < 4 && Array.from({ length: 4 - categories.length }).map((_, i) => (
            <div key={i} className="bg-black/5 border border-dashed border-black/10 flex items-center justify-center h-[500px] md:h-[650px]">
              <span className="font-mono text-[10px] uppercase text-black/20 tracking-[0.5em]">Coming Soon</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
