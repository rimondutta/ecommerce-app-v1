"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import AnimatedLogo from "@/components/ui/AnimatedLogo";

interface Category { name: string; slug: string; }

export default function Footer() {
  const [categories, setCategories] = useState<Category[]>([]);

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
  }, []);

  return (
    <footer className="bg-black text-white pt-32 pb-12 overflow-hidden relative">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-20 lg:gap-32 mb-40">
          {/* Brand Column */}
          <div className="space-y-12">
            <div className="font-display font-black text-5xl tracking-[-0.05em] flex flex-col leading-[0.8]">
              <span className="text-white">FLEX</span>
              <span className="text-zinc-600">WEAR.</span>
            </div>
            <p className="text-[11px] uppercase tracking-[0.3em] leading-[2] text-white/50 max-w-[280px]">
              Engineered garments for the modern inhabitant. Merging archival technicalities with contemporary silhouettes.
            </p>
            <div className="flex gap-8">
              {['Instagram', 'Twitter', 'Archive'].map((social) => (
                <a key={social} href="#" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-white transition-all underline decoration-zinc-800 underline-offset-8">
                  {social}
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-display font-black text-[10px] uppercase tracking-[0.5em] mb-12 text-zinc-500">Inventory</h4>
            <ul className="space-y-6">
              <li>
                <Link href="/products" className="group flex items-center text-[11px] font-black uppercase tracking-[0.2em] text-white/60 hover:text-white transition-all">
                  <span className="w-0 group-hover:w-6 h-[1px] bg-white mr-0 group-hover:mr-4 transition-all duration-500"></span>
                  Collections
                </Link>
              </li>
              {categories.slice(0, 4).map((cat) => (
                <li key={cat.slug}>
                  <Link href={`/products?category=${cat.slug}`} className="group flex items-center text-[11px] font-black uppercase tracking-[0.2em] text-white/60 hover:text-white transition-all">
                    <span className="w-0 group-hover:w-6 h-[1px] bg-white mr-0 group-hover:mr-4 transition-all duration-500"></span>
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Bureau */}
          <div>
            <h4 className="font-display font-black text-[10px] uppercase tracking-[0.5em] mb-12 text-zinc-500">Bureau</h4>
            <ul className="space-y-6">
              {["Contact Us", "Shipping", "Returns", "Size Guide", "Privacy"].map((link) => (
                <li key={link}>
                  <a href="#" className="group flex items-center text-[11px] font-black uppercase tracking-[0.2em] text-white/60 hover:text-white transition-all">
                    <span className="w-0 group-hover:w-6 h-[1px] bg-white mr-0 group-hover:mr-4 transition-all duration-500"></span>
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-12">
            <h4 className="font-display font-black text-[10px] uppercase tracking-[0.5em] text-zinc-500">Transmission</h4>
            <div className="space-y-6">
              <div className="relative group border-b border-white/20 pb-4">
                <input
                  type="email"
                  placeholder="EMAIL ADDRESS"
                  className="w-full bg-transparent text-[10px] tracking-[0.3em] uppercase outline-none placeholder:text-white/20 text-white"
                />
                <button className="absolute right-0 top-0 text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-white transition-all">
                  Submit
                </button>
              </div>
              <p className="text-[9px] uppercase tracking-[0.2em] text-white/30 leading-relaxed">
                Join our archival network for early access and seasonal transmissions.
              </p>
            </div>
          </div>
        </div>

        {/* Large Statement Branding */}
        <div className="mb-20 overflow-hidden py-10 border-y border-white/5">
           <div className="flex gap-20 animate-marquee whitespace-nowrap">
              {Array.from({length: 4}).map((_, i) => (
                <span key={i} className="font-display font-black text-[12vw] leading-none text-white tracking-[-0.05em] uppercase mix-blend-difference">
                  FLEXWEAR ARCHIVE
                </span>
              ))}
           </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
          <p className="text-[9px] font-black uppercase tracking-[0.5em] text-white/30">
            © 2026 ARCHIVE. ALL RIGHTS RESERVED.
          </p>
          <div className="flex gap-12">
            <div className="flex flex-col items-end">
              <span className="text-[8px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-1">Timezone</span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">LND / NYC / TKY</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[8px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-1">Status</span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 animate-pulse">Online</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative Blur */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
    </footer>
  );
}
