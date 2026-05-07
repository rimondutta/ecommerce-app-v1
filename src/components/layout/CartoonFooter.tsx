"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, Camera, Send, Globe } from "lucide-react";
import ComicDivider from "@/components/ui/ComicDivider";

interface Category {
  name: string;
  slug: string;
}

const CartoonFooter = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch("/api/store/categories")
      .then((r) => r.json())
      .then((d) => d.categories && setCategories(d.categories))
      .catch(() => {});
  }, []);

  return (
    <footer className="bg-ink text-paper relative overflow-hidden">
      <ComicDivider variant="zigzag" className="text-paper absolute top-0 w-full rotate-180" />
      
      <div className="absolute inset-0 bg-crosshatch opacity-10 pointer-events-none" />

      <div className="container mx-auto px-6 md:px-12 pt-32 pb-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16">
          {/* Brand & Info */}
          <div className="space-y-8">
            <div className="space-y-2">
              <h2 className="font-bangers text-6xl leading-none text-paper-shadow">
                INK<span className="text-secondary">&</span>THREAD
              </h2>
              <p className="font-comic text-lg italic opacity-80 max-w-xs">
                Your premium fashion comic. Streetwear, stories, and style in every stitch.
              </p>
            </div>
            
            <div className="flex gap-4">
              {[Camera, Send, Globe].map((Icon, i) => (
                <button key={i} className="p-3 border-3 border-paper hover:bg-paper hover:text-ink transition-all cartoon-shadow-sm active:shadow-none active:translate-x-1 active:translate-y-1">
                  <Icon size={20} />
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-8">
            <h3 className="font-bebas text-3xl tracking-widest uppercase border-b-3 border-paper pb-2 inline-block">
              NAVIGATION
            </h3>
            <ul className="space-y-4 font-comic font-bold text-xl italic">
              <li><Link href="/products" className="hover:pl-2 transition-all block">★ THE SHOP</Link></li>
              <li><Link href="/products?badge=New" className="hover:pl-2 transition-all block">★ FRESH DROPS</Link></li>
              <li><Link href="/about" className="hover:pl-2 transition-all block">★ OUR STORY</Link></li>
              <li><Link href="/contact" className="hover:pl-2 transition-all block">★ GET IN TOUCH</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-8">
            <h3 className="font-bebas text-3xl tracking-widest uppercase border-b-3 border-paper pb-2 inline-block">
              COLLECTIONS
            </h3>
            <ul className="space-y-4 font-comic font-bold text-xl italic">
              {categories.slice(0, 5).map((cat) => (
                <li key={cat.slug}>
                  <Link href={`/products?category=${cat.name}`} className="hover:pl-2 transition-all block">
                    ★ {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-8">
            <h3 className="font-bebas text-3xl tracking-widest uppercase border-b-3 border-paper pb-2 inline-block">
              HQ OFFICE
            </h3>
            <div className="space-y-6 font-comic font-bold text-xl italic">
              <div className="flex items-center gap-4">
                <Mail className="text-secondary" />
                <span>HELLO@INKANDTHREAD.COM</span>
              </div>
              <div className="flex items-center gap-4">
                <Phone className="text-secondary" />
                <span>+880 1234 567 890</span>
              </div>
              <div className="flex items-start gap-4">
                <MapPin className="text-secondary shrink-0" />
                <span>BANANI, DHAKA<br />BANGLADESH</span>
              </div>
            </div>
          </div>
        </div>

        {/* Big Marquee Background */}
        <div className="mt-32 border-y-4 border-paper/20 py-6 overflow-hidden">
           <div className="flex animate-marquee whitespace-nowrap gap-16 font-bangers text-8xl md:text-[12rem] opacity-5 select-none">
             {[...Array(4)].map((_, i) => (
               <span key={i}>INK & THREAD — FEARLESS STYLE — CARTOON COUTURE</span>
             ))}
           </div>
        </div>

        <div className="mt-20 flex flex-col md:flex-row justify-between items-center gap-8 font-bebas text-2xl tracking-widest opacity-60">
          <p>© 2025 INK & THREAD // VOLUME 01</p>
          <div className="flex gap-8">
            <Link href="/privacy" className="hover:text-paper transition-colors">PRIVACY</Link>
            <Link href="/terms" className="hover:text-paper transition-colors">TERMS</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default CartoonFooter;
