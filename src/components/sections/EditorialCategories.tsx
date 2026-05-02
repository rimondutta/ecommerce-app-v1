"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface Category {
  name: string;
  slug: string;
  count?: number;
}

const placeholderImages = [
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1529139574466-a303027c028c?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800&auto=format&fit=crop",
];

export default function EditorialCategories() {
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

    const initGsap = async () => {
      const { gsap } = await import("@/lib/gsap");
      if (!sectionRef.current) return;

      const ctx = gsap.context(() => {
        const cards = sectionRef.current!.querySelectorAll("[data-cat-card]");
        gsap.fromTo(cards,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.1,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 75%",
            }
          }
        );

        gsap.from(sectionRef.current!.querySelector("[data-cat-header]"), {
          opacity: 0,
          y: 20,
          duration: 1,
          ease: "power3.out",
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
    <section ref={sectionRef} className="py-24 md:py-32 bg-white overflow-hidden relative">
      <div className="max-w-[1800px] mx-auto px-6 md:px-16 relative z-10">
        <div data-cat-header className="flex flex-col md:flex-row justify-between items-end gap-12 mb-16 md:mb-24">
          <div className="space-y-4">
            <span className="text-zinc-500 font-semibold text-xs tracking-wider uppercase block">Collections</span>
            <h2 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-zinc-900 tracking-tight leading-tight">
              Shop By Category
            </h2>
          </div>

          <div className="max-w-md md:text-right flex flex-col md:items-end gap-6">
            <p className="text-sm md:text-base text-zinc-600 leading-relaxed max-w-[300px]">
              Discover our carefully curated selections designed for versatile styling and daily functionality.
            </p>
            <Link
              href="/products"
              className="group inline-flex items-center gap-2 bg-zinc-900 text-white px-6 py-3 rounded-full text-sm font-semibold transition-all hover:bg-zinc-800 shadow-soft"
            >
              Browse Catalog
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.slice(0, 4).map((cat, index) => (
            <Link
              key={cat.slug}
              href={`/products?category=${cat.name}`}
              data-cat-card
              className="group relative h-[450px] md:h-[550px] overflow-hidden rounded-3xl bg-zinc-100 block"
            >
              <Image 
                src={placeholderImages[index % placeholderImages.length]} 
                alt={cat.name} 
                fill 
                className="object-cover transition-transform duration-700 ease-[0.16,1,0.3,1] group-hover:scale-105" 
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

              <div className="absolute inset-0 p-8 flex flex-col justify-end h-full relative z-20">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-3xl md:text-4xl text-white tracking-tight">
                    {cat.name}
                  </h3>
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                    <ArrowRight size={18} />
                  </div>
                </div>
              </div>
            </Link>
          ))}

          {categories.length < 4 && Array.from({ length: 4 - categories.length }).map((_, i) => (
            <div key={i} className="bg-zinc-50 border border-zinc-100 rounded-3xl flex items-center justify-center h-[450px] md:h-[550px]">
              <span className="text-sm text-zinc-400 font-medium">Coming Soon</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
