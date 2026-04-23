"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

const categories = [
  {
    title: "Innerwear",
    subtitle: "Premium essential layers",
    image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=1200&q=80",
    link: "/shop?category=Tops",
    size: "large", // spans 2x2
  },
  {
    title: "Outerwear",
    subtitle: "Technical utility",
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=1200&q=80",
    link: "/shop?category=Outerwear",
    size: "tall", // spans 1x2
  },
  {
    title: "Pants",
    subtitle: "Structured silhouettes",
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80",
    link: "/shop?category=Pants",
    size: "small",
  },
  {
    title: "Accessories",
    subtitle: "Completing the kit",
    image: "https://images.unsplash.com/photo-1513890334341-2d82c0c7ea5a?w=800&q=80",
    link: "/shop?category=Accessories",
    size: "small",
  },
];

export default function BentoCategories() {
  return (
    <section className="px-6 md:px-12 py-24 bg-white">
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
        <div className="space-y-4">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Collections / 01</span>
          <h2 className="font-display font-black uppercase leading-[0.9] tracking-tight text-7xl md:text-8xl">
            CURATED<br />ESTABLISHMENTS
          </h2>
        </div>
        <p className="max-w-[280px] text-[11px] font-bold uppercase tracking-widest leading-relaxed text-gray-400 text-right italic">
          High-performance fabrics meeting minimalist design languages. Built for durability.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-4 h-auto md:h-[800px]">
        {categories.map((cat, i) => (
          <Link 
            key={i} 
            href={cat.link}
            className={`group relative overflow-hidden bg-gray-100 border-2 border-black transition-all duration-500 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1 ${
              cat.size === "large" ? "md:col-span-2 md:row-span-2" : 
              cat.size === "tall" ? "md:col-span-1 md:row-span-2" : 
              "md:col-span-1 md:row-span-1"
            }`}
          >
            <img 
              src={cat.image} 
              alt={cat.title} 
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-[1.5s] ease-out" 
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
            
            <div className="absolute inset-0 p-8 flex flex-col justify-end">
              <div className="relative z-10 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/70 mb-2 block">{cat.subtitle}</span>
                <h3 className="font-display font-black text-4xl md:text-5xl text-white uppercase tracking-tight mb-4 drop-shadow-lg">
                  {cat.title}
                </h3>
                <div className="flex items-center gap-2 text-white font-bold text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                  Explore Collection <ArrowUpRight size={14} />
                </div>
              </div>
            </div>

            {/* Glass decoration corner */}
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="glass w-10 h-10 rounded-full flex items-center justify-center text-black">
                <ArrowUpRight size={18} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
