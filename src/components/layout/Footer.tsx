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
    <footer className="bg-[#0e0e0e] text-[#e5e2e1] pt-40 pb-12 overflow-hidden relative border-t border-white/5">
      {/* Ghost Divider Top */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-[#333333] opacity-[0.15]" />
      
      <div className="max-w-[1800px] mx-auto px-6 md:px-16 relative z-10">
        
        {/* Newsletter Section */}
        <div className="mb-32">
          <div className="max-w-4xl border border-white/5 bg-[#111] p-12 md:p-20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8">
               <span className="label-tiny text-[#333]" style={{fontSize: '8px'}}>SYSTEM-SUB-01</span>
            </div>
            <span className="label-tiny text-[#8e9192] mb-8 block">BUREAU ENROLLMENT</span>
            <h2 className="font-serif text-4xl md:text-6xl lg:text-7xl text-white leading-[0.9] mb-12 tracking-[-0.04em]">
              Subscribe for private access to<br/>
              <span className="italic text-[#555]">limited releases.</span>
            </h2>
            <div className="flex flex-col sm:flex-row gap-0 mt-10 border-b border-white/20 group/input">
              <input
                type="email"
                placeholder="EMAIL_ADDRESS"
                className="flex-1 bg-transparent border-none px-0 h-16 text-white placeholder:text-[#333] label-tiny focus:outline-none focus:placeholder:text-[#555] transition-all duration-400 rounded-none"
              />
              <MagneticElement strength={0.2}>
                <button className="h-16 px-12 label-tiny text-white hover:text-[#555] transition-colors flex items-center gap-4">
                  ENROLL <ArrowRight size={14} />
                </button>
              </MagneticElement>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-20 lg:gap-32 mb-40">
          {/* Brand Column */}
          <div className="space-y-12">
            <div className="font-serif text-4xl text-white tracking-[-0.02em]">
              AVANT
            </div>
            <p className="label-tiny leading-[2] text-[#8e9192] max-w-[280px]">
              Brutalist minimalism for the modern ascetic. Stripped of excess, leaving only structure and intent.
            </p>
            <div className="flex gap-8">
              {['Instagram', 'Twitter', 'Archive'].map((social) => (
                <MagneticElement key={social} strength={0.3}>
                  <a href="#" className="label-tiny text-[#444748] hover:text-white transition-all duration-300">
                    {social}
                  </a>
                </MagneticElement>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="label-tiny text-[#8e9192] mb-12">Collections</h4>
            <ul className="space-y-6">
              <li>
                <Link href="/products" className="group flex items-center label-tiny text-[#444748] hover:text-white transition-all duration-300">
                  <span className="w-0 group-hover:w-6 h-[1px] bg-white mr-0 group-hover:mr-4 transition-all duration-500" />
                  All Products
                </Link>
              </li>
              {categories.slice(0, 4).map((cat) => (
                <li key={cat.slug}>
                  <Link href={`/products?category=${cat.slug}`} className="group flex items-center label-tiny text-[#444748] hover:text-white transition-all duration-300">
                    <span className="w-0 group-hover:w-6 h-[1px] bg-white mr-0 group-hover:mr-4 transition-all duration-500" />
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Bureau */}
          <div>
            <h4 className="label-tiny text-[#8e9192] mb-12">Bureau</h4>
            <ul className="space-y-6">
              {["Contact Us", "Shipping", "Returns", "Size Guide", "Privacy"].map((link) => (
                <li key={link}>
                  <a href="#" className="group flex items-center label-tiny text-[#444748] hover:text-white transition-all duration-300">
                    <span className="w-0 group-hover:w-6 h-[1px] bg-white mr-0 group-hover:mr-4 transition-all duration-500" />
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div className="space-y-12">
            <h4 className="label-tiny text-[#8e9192]">Information</h4>
            <div className="space-y-6">
              <p className="text-sm font-light text-[#8e9192] leading-relaxed">
                © 2026 AVANT GARDE. All rights reserved.
              </p>
              <div className="flex flex-wrap gap-6">
                {["Privacy", "Terms", "Shipping", "Stores"].map((item) => (
                  <a key={item} href="#" className="label-tiny text-[#444748] hover:text-white transition-all duration-300">
                    {item}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Large Statement Branding — Massive Playfair */}
        <div className="mb-20 overflow-hidden py-10 border-y border-white/5">
           <div className="flex gap-20 animate-marquee whitespace-nowrap">
              {Array.from({length: 4}).map((_, i) => (
                <span key={i} className="font-serif text-[12vw] leading-none text-white tracking-[-0.02em] opacity-[0.03]">
                  AVANT GARDE
                </span>
              ))}
           </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
          <p className="label-tiny text-[#444748]">
            © 2026 AVANT GARDE. ALL RIGHTS RESERVED.
          </p>
          <div className="flex gap-12">
            <div className="flex flex-col items-end">
              <span className="label-tiny text-[#333] mb-1" style={{fontSize: '8px'}}>Timezone</span>
              <span className="label-tiny text-[#8e9192]">LND / NYC / TKY</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="label-tiny text-[#333] mb-1" style={{fontSize: '8px'}}>Status</span>
              <span className="label-tiny text-[#8e9192] animate-pulse">Online</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
