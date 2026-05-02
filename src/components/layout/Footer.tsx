"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import AnimatedLogo from "@/components/ui/AnimatedLogo";
import { Camera, Send, Share, ArrowUpRight, Mail } from "lucide-react";

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

  useEffect(() => {
    const initGsap = async () => {
      const { gsap } = await import("@/lib/gsap");
      if (!footerRef.current) return;
      
      const ctx = gsap.context(() => {
        const cols = footerRef.current!.querySelectorAll("[data-footer-col]");
        gsap.fromTo(cols, 
          { opacity: 0, y: 40 }, 
          {
            opacity: 1, 
            y: 0, 
            stagger: 0.1, 
            duration: 1, 
            ease: "power3.out",
            scrollTrigger: { trigger: footerRef.current, start: "top 85%" },
          }
        );

        const bottom = footerRef.current!.querySelector("[data-footer-bottom]");
        if (bottom) {
          gsap.fromTo(bottom, 
            { opacity: 0 }, 
            {
              opacity: 1, 
              duration: 1.5, 
              ease: "power3.out",
              scrollTrigger: { trigger: bottom, start: "top 95%" },
            }
          );
        }
      }, footerRef);
      return () => ctx.revert();
    };
    initGsap();
  }, [categories]);

  return (
    <footer ref={footerRef} className="bg-zinc-950 text-white pt-24 pb-12 overflow-hidden relative">
      <div className="max-w-[1800px] mx-auto px-6 md:px-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 lg:gap-8 mb-24">
          
          {/* Brand Column */}
          <div data-footer-col className="lg:col-span-4 space-y-8" style={{ opacity: 0 }}>
            <Link href="/" className="inline-block">
              <AnimatedLogo size="lg" className="text-white" />
            </Link>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-sm">
              Crafting premium apparel that blends timeless elegance with modern functionality. Designed for those who value craftsmanship and quality.
            </p>
            <div className="flex gap-4">
              {[
                { icon: <Camera size={18} />, label: "Instagram" },
                { icon: <Send size={18} />, label: "Twitter" },
                { icon: <Share size={18} />, label: "Facebook" }
              ].map((social) => (
                <a 
                  key={social.label} 
                  href="#" 
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all shadow-sm"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div data-footer-col className="lg:col-span-2 space-y-8" style={{ opacity: 0 }}>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Shop</h4>
            <ul className="space-y-4">
              <li><Link href="/products" className="text-sm text-zinc-400 hover:text-white transition-colors">All Products</Link></li>
              {categories.slice(0, 4).map((cat) => (
                <li key={cat.slug}>
                  <Link href={`/products?category=${cat.name}`} className="text-sm text-zinc-400 hover:text-white transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div data-footer-col className="lg:col-span-2 space-y-8" style={{ opacity: 0 }}>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Support</h4>
            <ul className="space-y-4">
              {["Contact Us", "Shipping Info", "Return Policy", "Size Guide"].map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">{link}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Column */}
          <div data-footer-col className="lg:col-span-4 space-y-8" style={{ opacity: 0 }}>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Newsletter</h4>
            <div className="space-y-4">
              <p className="text-sm text-zinc-400">Join our community for exclusive access and updates.</p>
              <div className="relative group">
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm outline-none focus:border-white/30 focus:bg-white/10 transition-all placeholder:text-zinc-600" 
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-white text-zinc-950 px-5 py-2 rounded-xl text-sm font-bold hover:bg-zinc-200 transition-all flex items-center gap-2 group/btn">
                  Join
                  <ArrowUpRight size={16} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div data-footer-bottom className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 relative z-10" style={{ opacity: 0 }}>
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 text-xs text-zinc-500">
            <span>© 2024 Flex Wear. All Rights Reserved.</span>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
            Designed for Excellence
          </div>
        </div>
      </div>
    </footer>
  );
}

