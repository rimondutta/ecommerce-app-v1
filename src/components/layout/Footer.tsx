"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Category {
  name: string;
  slug: string;
}

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
    <footer className="bg-black text-white pt-32 pb-12 overflow-hidden relative border-t border-white/20">
      {/* Background Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.05]" 
           style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="max-w-[1800px] mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-24 mb-32">
          {/* Brand Column */}
          <div className="space-y-10">
            <div className="font-mono font-black text-4xl tracking-tighter flex items-center gap-2">
              <span className="text-white/40">[</span>
              <span>Flex_Wear</span>
              <span className="text-white/40">]</span>
            </div>
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] leading-relaxed text-white/70 max-w-xs">
              <span className="text-white mr-2">&gt;</span> Engineered garments for the modern inhabitant. Merging archival technicalities with contemporary silhouettes.
            </p>
            <div className="flex gap-6">
              {['Instagram', 'Twitter', 'Journal'].map((social) => (
                <a key={social} href="#" className="text-[10px] font-black uppercase tracking-widest text-white/90 hover:text-white transition-all underline outline-offset-4 decoration-white/40">
                  {social}
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <div className="flex items-center gap-2 mb-10">
               <div className="w-1.5 h-1.5 bg-white" />
               <h4 className="font-mono font-black text-[10px] uppercase tracking-[0.4em] text-white/70">Inventory</h4>
            </div>
            <ul className="space-y-5">
              <li>
                <Link href="/products" className="text-[11px] font-black uppercase tracking-widest text-white/90 hover:text-white transition-all flex items-center group">
                  <span className="w-0 group-hover:w-4 h-[1px] bg-white mr-0 group-hover:mr-3 transition-all"></span>
                  All Collections
                </Link>
              </li>
              {categories.slice(0, 4).map((cat) => (
                <li key={cat.slug}>
                  <Link href={`/products?category=${cat.name}`} className="text-[11px] font-black uppercase tracking-widest text-white/90 hover:text-white transition-all flex items-center group">
                    <span className="w-0 group-hover:w-4 h-[1px] bg-white mr-0 group-hover:mr-3 transition-all"></span>
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <div className="flex items-center gap-2 mb-10">
               <div className="w-1.5 h-1.5 bg-white" />
               <h4 className="font-mono font-black text-[10px] uppercase tracking-[0.4em] text-white/70">Bureau</h4>
            </div>
            <ul className="space-y-5">
              {["Contact Us", "Shipping Logic", "Return Policy", "Size Guide", "Privacy Layer"].map((link) => (
                <li key={link}>
                  <a href="#" className="text-[11px] font-black uppercase tracking-widest text-white/90 hover:text-white transition-all flex items-center group">
                    <span className="w-0 group-hover:w-4 h-[1px] bg-white mr-0 group-hover:mr-3 transition-all"></span>
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-10">
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 bg-white animate-pulse" />
               <h4 className="font-mono font-black text-[10px] uppercase tracking-[0.4em] text-white/70">Transmission</h4>
            </div>
            <div className="relative group border border-white/20 p-1 focus-within:border-white/50 transition-all">
              <input
                type="email"
                placeholder="ENTER_DATA..."
                className="w-full bg-transparent p-4 text-[10px] font-mono tracking-widest uppercase outline-none placeholder:text-white/30"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-white text-black px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-white/80 transition-all">
                Exec
              </button>
            </div>
            <p className="text-[9px] font-mono uppercase tracking-widest text-white/50 leading-relaxed">
              *By subscribing you agree to receive our archival transmissions.
            </p>
          </div>
        </div>

        {/* Archival Logo / Large Background Text */}
        <div className="pointer-events-none select-none absolute bottom-12 left-1/2 -translate-x-1/2 w-full text-center">
          <h2 className="font-display font-black text-[12vw] md:text-[15vw] leading-none uppercase tracking-tighter text-transparent" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.1)' }}>Flex Wear</h2>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/20 flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
          <p className="text-[10px] font-mono font-black uppercase tracking-[0.4em] text-white/70">
            © 2026 Flex_Wear. All Rights Reserved.
          </p>
          <div className="flex gap-10">
            <p className="text-[10px] font-mono font-black uppercase tracking-[0.4em] text-white/70">LND / NYC / TKY</p>
            <p className="text-[10px] font-mono font-black uppercase tracking-[0.4em] text-white/70 italic opacity-50">SYS_ONLINE</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
