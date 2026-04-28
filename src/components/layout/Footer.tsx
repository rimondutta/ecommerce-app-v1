"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import AnimatedLogo from "@/components/ui/AnimatedLogo";

interface Category { name: string; slug: string; }

export default function Footer() {
  const [categories, setCategories] = useState<Category[]>([]);
  const footerRef = useRef<HTMLElement>(null);

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

  // GSAP footer animations
  useEffect(() => {
    const initGsap = async () => {
      const { gsap, ScrollTrigger } = await import("@/lib/gsap");
      if (!footerRef.current) return;
      const ctx = gsap.context(() => {
        // Stagger all grid columns
        const cols = footerRef.current!.querySelectorAll("[data-footer-col]");
        gsap.fromTo(cols, { opacity: 0, y: 60 }, {
          opacity: 1, y: 0, stagger: 0.15, duration: 1.2, ease: "expo.out",
          scrollTrigger: { trigger: footerRef.current, start: "top 85%" },
        });
        // Big logo text reveal
        const logo = footerRef.current!.querySelector("[data-footer-logo]");
        if (logo) gsap.fromTo(logo, { opacity: 0, y: 100, scale: 0.9 }, {
          opacity: 1, y: 0, scale: 1, duration: 2, ease: "expo.out",
          scrollTrigger: { trigger: footerRef.current, start: "top 70%" },
        });
        // Bottom bar slide up
        const bottom = footerRef.current!.querySelector("[data-footer-bottom]");
        if (bottom) gsap.fromTo(bottom, { opacity: 0, y: 30 }, {
          opacity: 1, y: 0, duration: 1, ease: "expo.out",
          scrollTrigger: { trigger: bottom, start: "top 95%" },
        });
        // Link items stagger
        const links = footerRef.current!.querySelectorAll("[data-footer-link]");
        gsap.fromTo(links, { opacity: 0, x: -20 }, {
          opacity: 1, x: 0, stagger: 0.05, duration: 0.8, ease: "expo.out",
          scrollTrigger: { trigger: footerRef.current, start: "top 80%" },
        });
      }, footerRef);
      return () => ctx.revert();
    };
    initGsap();
  }, [categories]);

  return (
    <footer ref={footerRef} className="bg-black text-white pt-32 pb-12 overflow-hidden relative border-t border-white/20">
      <div className="absolute inset-0 pointer-events-none opacity-[0.05]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <div className="max-w-[1800px] mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-24 mb-32">
          {/* Brand */}
          <div data-footer-col className="space-y-10" style={{ opacity: 0 }}>
            <div className="flex flex-col gap-8">
              <Link href="/" className="inline-block" data-cursor="HOME">
                <AnimatedLogo size="lg" className="text-white" />
              </Link>
              <p className="text-white/40 text-[11px] font-mono leading-relaxed max-w-sm uppercase tracking-widest">
                Premium apparel for the modern individual. Quality craftsmanship, timeless design, and exceptional comfort in every piece.
              </p>
            </div>
            <div className="flex gap-6">
              {['Instagram', 'Twitter', 'Facebook'].map((social) => (
                <a key={social} href="#" data-footer-link className="text-[10px] font-black uppercase tracking-widest text-white/90 hover:text-white transition-all underline outline-offset-4 decoration-white/40">
                  {social}
                </a>
              ))}
            </div>
          </div>
          {/* Navigation */}
          <div data-footer-col style={{ opacity: 0 }}>
            <div className="flex items-center gap-2 mb-10">
              <div className="w-1.5 h-1.5 bg-white" />
              <h4 className="font-mono font-black text-[10px] uppercase tracking-[0.4em] text-white/70">Shop</h4>
            </div>
            <ul className="space-y-5">
              <li><Link href="/products" data-footer-link className="text-[11px] font-black uppercase tracking-widest text-white/90 hover:text-white transition-all flex items-center group"><span className="w-0 group-hover:w-4 h-[1px] bg-white mr-0 group-hover:mr-3 transition-all"></span>All Collections</Link></li>
              {categories.slice(0, 4).map((cat) => (
                <li key={cat.slug}><Link href={`/products?category=${cat.name}`} data-footer-link className="text-[11px] font-black uppercase tracking-widest text-white/90 hover:text-white transition-all flex items-center group"><span className="w-0 group-hover:w-4 h-[1px] bg-white mr-0 group-hover:mr-3 transition-all"></span>{cat.name}</Link></li>
              ))}
            </ul>
          </div>
          {/* Support */}
          <div data-footer-col style={{ opacity: 0 }}>
            <div className="flex items-center gap-2 mb-10">
              <div className="w-1.5 h-1.5 bg-white" />
              <h4 className="font-mono font-black text-[10px] uppercase tracking-[0.4em] text-white/70">Company</h4>
            </div>
            <ul className="space-y-5">
              {["Contact Us", "Shipping Info", "Return Policy", "Size Guide", "Privacy Policy"].map((link) => (
                <li key={link}><a href="#" data-footer-link className="text-[11px] font-black uppercase tracking-widest text-white/90 hover:text-white transition-all flex items-center group"><span className="w-0 group-hover:w-4 h-[1px] bg-white mr-0 group-hover:mr-3 transition-all"></span>{link}</a></li>
              ))}
            </ul>
          </div>
          {/* Newsletter */}
          <div data-footer-col className="space-y-10" style={{ opacity: 0 }}>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-white animate-pulse" />
              <h4 className="font-mono font-black text-[10px] uppercase tracking-[0.4em] text-white/70">Newsletter</h4>
            </div>
            <div className="relative group border border-white/20 p-1 focus-within:border-white/50 transition-all">
              <input type="email" placeholder="Email Address" className="w-full bg-transparent p-4 text-[10px] font-mono tracking-widest uppercase outline-none placeholder:text-white/30" />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-white text-black px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-white/80 transition-all">Join</button>
            </div>
            <p className="text-[9px] font-mono uppercase tracking-widest text-white/50 leading-relaxed">*By subscribing you agree to receive our latest updates and offers.</p>
          </div>
        </div>
        {/* Big Logo */}
        <div data-footer-logo className="pointer-events-none select-none absolute bottom-12 left-1/2 -translate-x-1/2 w-full text-center" style={{ opacity: 0 }}>
          <h2 className="font-display font-black text-[12vw] md:text-[15vw] leading-none uppercase tracking-tighter text-transparent" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.1)' }}>Flex Wear</h2>
        </div>
        {/* Bottom Bar */}
        <div data-footer-bottom className="pt-12 border-t border-white/20 flex flex-col md:flex-row justify-between items-center gap-8 relative z-10" style={{ opacity: 0 }}>
          <p className="text-[10px] font-mono font-black uppercase tracking-[0.4em] text-white/70">© 2026 Flex_Wear. All Rights Reserved.</p>
          <div className="flex gap-10">
            <p className="text-[10px] font-mono font-black uppercase tracking-[0.4em] text-white/70">Quality Over Quantity</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
