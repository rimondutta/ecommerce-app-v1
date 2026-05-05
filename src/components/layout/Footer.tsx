"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import MagneticElement from "@/components/ui/MagneticElement";

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
    <footer className="bg-[#0e0e0e] text-[#e5e2e1] pt-60 pb-12 overflow-hidden relative border-t border-white/5">
      {/* Editorial Watermark Background */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full text-center pointer-events-none select-none opacity-[0.02] z-0">
         <h2 className="font-serif text-[40vw] leading-none tracking-tighter">BUREAU</h2>
      </div>

      <div className="max-w-[1800px] mx-auto px-6 md:px-16 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-end mb-40">
           <div className="lg:col-span-7">
              <span className="label-tiny text-[#333] mb-8 block tracking-[0.6em]">ESTABLISHED_MMXXIV</span>
              <h2 className="font-serif text-6xl md:text-8xl lg:text-[10rem] text-white leading-[0.8] tracking-[-0.04em]">
                Wear the<br/>
                <span className="italic text-[#555]">Silence.</span>
              </h2>
           </div>
           <div className="lg:col-span-5 space-y-12">
              <p className="label-tiny text-[#8e9192] max-w-sm leading-relaxed">
                WE ARE THE ARCHIVAL BUREAU. A STUDY IN BRUTALIST FORM AND MINIMALIST INTENT. OUR PIECES ARE CRAFTED FOR THE MODERN ASCETIC, STRIPPED OF THE SUPERFICIAL.
              </p>
              <div className="flex items-center gap-8">
                <MagneticElement strength={0.2}>
                   <Link href="/blogs" className="btn-pill-primary group">
                      READ_EDITORIAL
                   </Link>
                </MagneticElement>
              </div>
           </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-20 lg:gap-32 mb-40 border-t border-white/5 pt-20">
          {/* Brand Column */}
          <div className="space-y-12">
            <h4 className="label-tiny text-[#333]">/NAV_01</h4>
            <div className="flex flex-col gap-4">
              {['Instagram', 'Twitter', 'Archive', 'Vimeo'].map((social) => (
                <MagneticElement key={social} strength={0.3}>
                  <a href="#" className="label-tiny text-[#8e9192] hover:text-white transition-all duration-300 w-fit">
                    {social} —&gt;
                  </a>
                </MagneticElement>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="label-tiny text-[#333]">/COLLECTIONS</h4>
            <ul className="space-y-4 mt-8">
              {categories.slice(0, 5).map((cat) => (
                <li key={cat.slug}>
                  <Link href={`/products?category=${cat.slug}`} className="label-tiny text-[#8e9192] hover:text-white transition-all duration-300">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Bureau */}
          <div>
            <h4 className="label-tiny text-[#333]">/BUREAU</h4>
            <ul className="space-y-4 mt-8">
              {["Contact", "Shipping", "Returns", "Terms", "Privacy"].map((link) => (
                <li key={link}>
                  <a href="#" className="label-tiny text-[#8e9192] hover:text-white transition-all duration-300">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-12">
            <h4 className="label-tiny text-[#333]">/CONTACT</h4>
            <div className="space-y-6">
              <p className="label-tiny text-[#8e9192] leading-relaxed">
                STUDIO@AVANTGARDE.ARCHIVE<br/>
                +880 1234 567 890
              </p>
              <span className="label-tiny text-[#333] block">DHAKA, BANGLADESH</span>
            </div>
          </div>
        </div>

        {/* Large Statement Branding — Massive Playfair */}
        <div className="mb-20 overflow-hidden py-10 border-y border-white/5">
           <div className="flex gap-20 animate-marquee whitespace-nowrap">
              {Array.from({length: 4}).map((_, i) => (
                <span key={i} className="font-serif text-[12vw] leading-none text-white tracking-[-0.02em] opacity-[0.03]">
                  AVANT GARDE ARCHIVE
                </span>
              ))}
           </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
          <p className="label-tiny text-[#333]">
            © 2026 AVANT GARDE. ALL RIGHTS RESERVED.
          </p>
          <div className="flex gap-12">
            <div className="flex flex-col items-end">
              <span className="label-tiny text-[#333] mb-1" style={{fontSize: '8px'}}>Timezone</span>
              <span className="label-tiny text-[#8e9192]">BD / LND / NYC</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="label-tiny text-[#333] mb-1" style={{fontSize: '8px'}}>Encryption</span>
              <span className="label-tiny text-[#8e9192]">256-BIT_SECURE</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
