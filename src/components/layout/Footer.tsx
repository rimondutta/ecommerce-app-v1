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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-24 mb-32">
          {/* Brand Column */}
          <div className="space-y-10">
            <div className="font-display font-black text-4xl tracking-tighter flex items-center gap-2">
              <span>FLEX</span>
              <span className="w-8 h-8 bg-white text-black flex items-center justify-center text-xs rounded-full">W</span>
            </div>
            <p className="text-[11px] uppercase tracking-[0.2em] leading-loose text-white/70 max-w-xs">
              Engineered garments for the modern inhabitant. Merging archival technicalities with contemporary silhouettes of the future.
            </p>
            <div className="flex gap-6">
              {['Instagram', 'Twitter', 'Archive'].map((social) => (
                <a key={social} href="#" className="text-[10px] font-black uppercase tracking-widest text-white/70 hover:text-white transition-all underline outline-offset-4 decoration-white/40">
                  {social}
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-display font-black text-[10px] uppercase tracking-[0.4em] mb-10 text-white/50">Inventory</h4>
            <ul className="space-y-5">
              <li>
                <Link href="/products" className="text-[11px] font-black uppercase tracking-widest text-white/70 hover:text-white transition-all flex items-center group">
                  <span className="w-0 group-hover:w-4 h-[1px] bg-white mr-0 group-hover:mr-3 transition-all"></span>
                  All Collections
                </Link>
              </li>
              {categories.slice(0, 4).map((cat) => (
                <li key={cat.slug}>
                  <Link href={`/products?category=${cat.slug}`} className="text-[11px] font-black uppercase tracking-widest text-white/70 hover:text-white transition-all flex items-center group">
                    <span className="w-0 group-hover:w-4 h-[1px] bg-white mr-0 group-hover:mr-3 transition-all"></span>
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-display font-black text-[10px] uppercase tracking-[0.4em] mb-10 text-white/50">Bureau</h4>
            <ul className="space-y-5">
              {["Contact Us", "Shipping Logic", "Return Policy", "Size Guide", "Privacy Layer"].map((link) => (
                <li key={link}>
                  <a href="#" className="text-[11px] font-black uppercase tracking-widest text-white/70 hover:text-white transition-all flex items-center group">
                    <span className="w-0 group-hover:w-4 h-[1px] bg-white mr-0 group-hover:mr-3 transition-all"></span>
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-10">
            <h4 className="font-display font-black text-[10px] uppercase tracking-[0.4em] text-white/50">Transmission</h4>
            <div className="relative group">
              <input
                type="email"
                placeholder="EMAIL@ADDRESS.COM"
                className="w-full bg-white/5 border border-white/10 p-6 text-[10px] tracking-widest uppercase focus:bg-white/10 outline-none transition-all placeholder:text-white/50"
              />
              <button className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-widest text-white hover:italic transition-all">
                Join
              </button>
            </div>
            <p className="text-[9px] uppercase tracking-widest text-white/60 leading-relaxed">
              *By subscribing you agree to receive our archival transmissions.
            </p>
          </div>
        </div>

        {/* Archival Logo / Large Background Text */}
        <div className="pointer-events-none select-none opacity-[0.03] absolute bottom-12 left-1/2 -translate-x-1/2 w-full text-center">
          <h2 className="font-display font-black text-[20vw] leading-none uppercase tracking-tighter">FLEXWEAR</h2>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/50">
            © 2024 FLEXWEAR ARCHIVE. ALL RIGHTS RESERVED.
          </p>
          <div className="flex gap-10">
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/50">LND / NYC / TKY</p>
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/50 italic">00:00:24</p>
          </div>
        </div>
      </div>
      
      {/* Decorative Blur */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
    </footer>
  );
}
