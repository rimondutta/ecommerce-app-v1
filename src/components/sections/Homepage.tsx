"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import ProductGridNike from "@/components/ui/product-grid-nike";
import AnimatedReveal from "@/components/ui/AnimatedReveal";
import dynamic from "next/dynamic";
import AppDownloadSection from "./AppDownloadSection";

const DynamicInstagramSection = dynamic(() => import("./InstagramSection"), { ssr: false });

// ─── Countdown Timer Hook ───
function useCountdown(d: number, h: number, m: number, s: number) {
  const [timeLeft, setTimeLeft] = useState({ days: d, hours: h, minutes: m, seconds: s });
  useEffect(() => {
    // Delay initialization to not block first render
    const init = setTimeout(() => {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          let { days, hours, minutes, seconds } = prev;
          if (days === 0 && hours === 0 && minutes === 0 && seconds === 0) { clearInterval(timer); return prev; }
          seconds -= 1;
          if (seconds < 0) { seconds = 59; minutes -= 1; }
          if (minutes < 0) { minutes = 59; hours -= 1; }
          if (hours < 0) { hours = 23; days -= 1; }
          return { days, hours, minutes, seconds };
        });
      }, 1000);
      return () => clearInterval(timer);
    }, 500); // defer 500ms so first paint is not delayed
    return () => clearTimeout(init);
  }, []);
  return timeLeft;
}
function pad(n: number) { return String(n).padStart(2, "0"); }

interface Product {
  _id: string; title: string; slug: string; price: number;
  compareAtPrice?: number; images: { url: string; alt?: string }[];
  badge?: string; ageRange?: string; rating?: number; reviewCount?: number;
}
interface Category { name: string; slug: string; image: string; }

export default function Homepage({
  initialTrendingProducts = [],
  initialCategories = [],
}: {
  initialTrendingProducts?: Product[];
  initialCategories?: Category[];
}) {
  const [trendingProducts, setTrendingProducts] = useState<any[]>(initialTrendingProducts);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const reduced = useReducedMotion();

  // Fallback client fetch — data logic untouched
  useEffect(() => {
    if (initialTrendingProducts.length === 0) {
      fetch('/api/store/products?limit=4')
        .then(r => r.json()).then(d => setTrendingProducts(d.products || []))
        .catch(console.error);
    }
    if (initialCategories.length === 0) {
      fetch('/api/store/categories')
        .then(r => r.json()).then(d => { if (d.categories) setCategories(d.categories); })
        .catch(console.error);
    }
  }, [initialTrendingProducts, initialCategories]);

  const timeLeft = useCountdown(12, 8, 45, 0);

  // Animation variants — tightened durations for better TTI without sacrificing aesthetics
  const seq: any = {
    container: { hidden: {}, visible: { transition: { staggerChildren: reduced ? 0 : 0.15, delayChildren: 0 } } },
    rule:  { hidden: reduced ? { opacity: 0 } : { scaleX: 0, opacity: 0 },  visible: { scaleX: 1, opacity: 1, transition: { duration: 0.7, ease: [0.25, 1, 0.5, 1] } } },
    label: { hidden: reduced ? { opacity: 0 } : { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 1, 0.5, 1] } } },
    title: { hidden: reduced ? { opacity: 0 } : { opacity: 0, y: 32 }, visible: { opacity: 1, y: 0, transition: { duration: 0.9,  ease: [0.25, 1, 0.5, 1] } } },
    photo: { hidden: reduced ? { opacity: 0 } : { opacity: 0, scale: 1.03 }, visible: { opacity: 1, scale: 1.0, transition: { duration: 0.9, ease: [0.25, 1, 0.5, 1] } } },
  };

  return (
    <div className="bg-transparent min-h-screen font-body">

      {/* ═══════════════════════════════════════════════
          1. HERO — Eco-Friendly Kitchenware
          ═══════════════════════════════════════════════ */}
      <section className="px-3 sm:px-6 lg:px-8 pt-3 sm:pt-6 pb-12 md:pb-24">
        <div className="relative rounded-[2rem] md:rounded-[3rem] overflow-hidden min-h-[85vh] flex items-center bg-[#133A2B] shadow-2xl">
          
          {/* Cinematic full-bleed video - keeping video but styling like the kitchenware image */}
          <div className="absolute inset-0 z-0">
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              className="absolute inset-0 w-full h-full object-cover object-center opacity-70 mix-blend-overlay"
            >
              <source src="/video/hero-bg.mp4" type="video/mp4" />
            </video>
            {/* Gradient overlay for readability — left-aligned dark green fade */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0C2A1E]/90 via-[#0C2A1E]/50 to-transparent" />
          </div>

          {/* Hero copy */}
          <div className="relative z-10 px-8 sm:px-16 lg:px-24 w-full md:max-w-3xl text-white mt-12 md:mt-0">
            <h1 className="font-body text-5xl sm:text-6xl lg:text-[76px] leading-[1.05] tracking-tight font-medium mb-6">
              Eco-Friendly <br/>
              <span className="font-display italic font-normal text-white/95">Kitchenware</span> for <br/>
              a greener home
            </h1>

            <p className="font-body text-sm sm:text-base text-white/80 max-w-[360px] mb-10 leading-[1.6]">
              The eco-friendly kitchenware niche with a sense of urgency, much like the original banner. Let me know if you'd like adjustments!
            </p>

            <Link
              href="/products"
              className="inline-flex items-center gap-3 bg-accent-yellow text-ink-black px-7 py-3.5 rounded-full font-medium text-sm hover:bg-white transition-colors duration-300 shadow-[0_4px_20px_rgba(235,240,200,0.3)]"
            >
              Shop now <span className="text-lg leading-none transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>

          {/* Glassmorphic Stats Card (Desktop Only) */}
          <div className="hidden lg:flex absolute bottom-12 right-12 w-[280px] p-8 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white flex-col gap-10 shadow-2xl">
            {/* Leaf Icon Top Right */}
            <svg className="absolute top-6 right-6 w-6 h-6 text-white/60" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <p className="font-body text-sm leading-[1.6] text-white/90 font-medium">
              Natural.<br/>
              Sustainable.<br/>
              Eco-conscious.
            </p>
            <p className="font-display italic text-[80px] leading-none text-white/95">
              96%
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          2. CATALOG SECTION LABELS — categories (Modern E-commerce)
          ═══════════════════════════════════════════════ */}
      {categories.length > 0 && (
        <section className="py-16 md:py-24">
          <AnimatedReveal className="mb-12 px-4 sm:px-10 lg:px-[5vw] flex items-baseline gap-6">
            <h2 className="font-body text-[32px] md:text-[40px] text-ink-black font-medium tracking-tight">
              Shop by Category
            </h2>
            <div className="flex-1 h-[1px] bg-gray-200 hidden md:block" />
          </AnimatedReveal>

          {/* DESKTOP: Clean Hover List */}
          <div className="hidden md:flex flex-col">
            {categories.slice(0, 6).map((cat, i) => (
              <AnimatedReveal key={cat.slug} delay={i * 0.1}>
                <Link
                  href={`/products?category=${cat.slug}`}
                  className="group relative flex items-center justify-between py-8 md:py-10 px-4 sm:px-10 lg:px-[5vw] border-t border-gray-100 overflow-hidden"
                >
                  {/* Background Image Reveal */}
                  {cat.image && (
                    <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-20 transition-opacity duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]">
                      <Image
                        src={cat.image}
                        alt={cat.name}
                        fill
                        className="object-cover scale-105 group-hover:scale-100 transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-paper-white/90 via-paper-white/50 to-transparent" />
                    </div>
                  )}

                  {/* Text Content */}
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-2 md:gap-12 w-full">
                    <h3 className="font-body text-4xl md:text-5xl lg:text-6xl text-gray-400 group-hover:text-ink-black transition-colors duration-500 font-medium tracking-tight">
                      {cat.name}
                    </h3>
                  </div>
                  
                  {/* Arrow Indicator */}
                  <div className="relative z-10 hidden md:flex items-center gap-4 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]">
                    <span className="font-body text-sm font-semibold text-ink-black whitespace-nowrap">
                      Explore
                    </span>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-ink-black">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              </AnimatedReveal>
            ))}
          </div>

          {/* MOBILE: Immersive Horizontal Poster Scroll */}
          <div className="md:hidden flex gap-4 overflow-x-auto snap-x snap-mandatory px-4 sm:px-10 pb-8 no-scrollbar">
            {categories.slice(0, 6).map((cat, i) => (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                className="relative shrink-0 w-[80vw] sm:w-[60vw] aspect-[3/4] snap-center overflow-hidden bg-transparent rounded-2xl shadow-sm"
              >
                {cat.image && (
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 80vw, 60vw"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute inset-0 p-6 flex flex-col justify-end z-10">
                  <h3 className="font-body text-3xl text-white font-medium tracking-tight">
                    {cat.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════
          3. TRENDING — Homedine Section
          ═══════════════════════════════════════════════ */}
      <section className="px-4 sm:px-10 lg:px-[5vw] py-16 md:py-24">
        <AnimatedReveal className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="font-body text-gray-500 font-medium mb-1">
              Eco Essentials Planet-Friendly
            </p>
            <h2 className="font-body text-[32px] md:text-[40px] text-ink-black leading-tight font-medium tracking-tight">
              Bestselling <span className="font-display italic font-normal text-4xl md:text-5xl">Products</span>
            </h2>
          </div>
          <Link
            href="/products"
            className="hidden md:flex items-center gap-2 font-body text-sm font-semibold text-ink-black hover:text-stamp-red transition-colors whitespace-nowrap group"
          >
            More products <span className="text-lg leading-none transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </AnimatedReveal>

        <ProductGridNike
          title={undefined}
          viewAllLink="/products"
          products={trendingProducts}
          theme="light"
        />
      </section>


      {/* ═══════════════════════════════════════════════
          5. SERVICES STRIP — modern version
          ═══════════════════════════════════════════════ */}
      <AnimatedReveal>
        <section className="px-4 sm:px-10 lg:px-[5vw] py-14 md:py-20 border-t border-gray-100 bg-paper-white">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 divide-y sm:divide-y-0 sm:divide-x divide-gray-200">
            {[
              { title: "Fast & Free Delivery", desc: "Free delivery for all orders over ৳1,500" },
              { title: "24/7 Support",         desc: "Friendly customer support, always available" },
              { title: "30-Day Returns",       desc: "We return money within 30 days" },
            ].map(({ title, desc }) => (
              <div key={title} className="flex flex-col gap-2 pt-6 sm:pt-0 sm:px-8 first:pl-0 first:pt-0 last:pr-0 text-center sm:text-left">
                <h4 className="font-body text-lg font-semibold text-ink-black">{title}</h4>
                <p className="font-body text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>
      </AnimatedReveal>

      {/* ═══════════════════════════════════════════════
          6. APP DOWNLOAD SECTION
          ═══════════════════════════════════════════════ */}
      <AppDownloadSection />

      {/* Instagram — lazy loaded, untouched */}
      <DynamicInstagramSection />

    </div>
  );
}