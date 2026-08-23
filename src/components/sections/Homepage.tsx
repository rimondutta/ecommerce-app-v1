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
          1. HERO — cinematic full-bleed exhibit
          ═══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden min-h-[90vh] md:min-h-screen flex items-end md:items-center pb-24 md:pb-0 border-b border-rule-grey">

        {/* Cinematic full-bleed video - STATIC for LCP optimization */}
        <div className="absolute inset-0 z-0 opacity-40">
          <div className="absolute inset-0 bg-transparent" />
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover object-center"
          >
            <source src="/video/hero-bg.mp4" type="video/mp4" />
          </video>
          {/* Bottom vignette gradient — dark fade to transparent */}
          <div className="absolute inset-0 bg-gradient-to-t from-paper-white via-paper-white/60 to-transparent md:bg-gradient-to-r md:from-paper-white md:via-paper-white/80 md:to-transparent" />
        </div>

        {/* Hero copy — overlaps the cinematic bg - STATIC for LCP optimization */}
        <div className="relative z-10 px-4 sm:px-10 lg:px-[5vw] w-full md:max-w-[70%]">
          {/* Section label */}
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-rule-grey mb-6">
            
          </p>

          {/* Hairline rule draws in */}
          <div className="h-[1px] w-16 bg-stamp-red mb-6 origin-left" />

          {/* Big display headline — typography-as-object */}
          <h1
            className="font-display text-[72px] md:text-[100px] lg:text-[120px] uppercase text-ink-black leading-[0.9] tracking-[-0.02em] mb-8"
          >
           Endless Fun <br/> Starts at Toyhourse
          </h1>

          <p className="font-body text-[14px] text-ink-black leading-[1.8] max-w-[400px] mb-10 opacity-80">
            Explore premium toys designed to inspire imagination, creativity, and learning. Find the perfect gift for every little adventure.
          </p>

          {/* CTA — cinematic button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <Link
              href="/products"
              className="font-mono text-[11px] uppercase tracking-[0.15em] bg-ink-black text-paper-white border border-ink-black px-8 py-4 hover:bg-transparent hover:text-ink-black transition-colors duration-500"
            >
              Browse Category →
            </Link>
            <Link
              href="/shop"
              className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-black relative group"
            >
              Shop
              <span className="absolute -bottom-0.5 left-0 h-[1px] bg-ink-black w-full" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          2. CATALOG SECTION LABELS — categories (Cinematic Hover List)
          ═══════════════════════════════════════════════ */}
      {categories.length > 0 && (
        <section className="py-16 md:py-24 border-b border-rule-grey">
          <AnimatedReveal className="mb-12 px-4 sm:px-10 lg:px-[5vw] flex items-baseline gap-6">
            <h2 className="font-display text-[40px] md:text-[56px] uppercase text-ink-black leading-none tracking-[-0.01em]">
              Browse Category
            </h2>
            <div className="flex-1 h-[1px] bg-rule-grey hidden md:block" />
          </AnimatedReveal>

          {/* DESKTOP: Cinematic Hover List */}
          <div className="hidden md:flex flex-col border-t border-rule-grey">
            {categories.slice(0, 6).map((cat, i) => (
              <AnimatedReveal key={cat.slug} delay={i * 0.1}>
                <Link
                  href={`/products?category=${cat.slug}`}
                  className="group relative flex items-center justify-between py-8 md:py-10 px-4 sm:px-10 lg:px-[5vw] border-b border-rule-grey overflow-hidden"
                >
                  {/* Background Image Reveal */}
                  {cat.image && (
                    <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-30 transition-opacity duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]">
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
                    <span className="font-mono text-[10px] md:text-[12px] text-rule-grey uppercase tracking-[0.2em] group-hover:text-stamp-red transition-colors duration-500">
                      N°{String(i + 1).padStart(3, "0")}
                    </span>
                    <h3 className="font-display text-[40px] md:text-[72px] lg:text-[90px] uppercase text-rule-grey group-hover:text-ink-black transition-colors duration-500 leading-none tracking-[-0.02em]">
                      {cat.name}
                    </h3>
                  </div>
                  
                  {/* Arrow Indicator */}
                  <div className="relative z-10 hidden md:flex items-center gap-4 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]">
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-black whitespace-nowrap">
                      Explore Exhibit
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
                className="relative shrink-0 w-[80vw] sm:w-[60vw] aspect-[3/4] snap-center overflow-hidden bg-transparent border border-white/10 rounded-2xl"
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
                <div className="absolute inset-0 bg-gradient-to-t from-paper-white via-paper-white/40 to-transparent" />
                <div className="absolute inset-0 p-6 flex flex-col justify-end z-10">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stamp-red mb-2">
                    EXHIBIT N°{String(i + 1).padStart(3, "0")}
                  </span>
                  <h3 className="font-display text-[48px] uppercase text-ink-black leading-[0.9] tracking-[-0.02em]">
                    {cat.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════
          3. TRENDING — "EXHIBIT" PRODUCT GRID
          ═══════════════════════════════════════════════ */}
      <section className="px-4 sm:px-10 lg:px-[5vw] py-16 md:py-24 border-b border-rule-grey">
        <AnimatedReveal className="mb-10 flex items-baseline gap-6">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-rule-grey mb-2">
              Explore Our Product
            </p>
            <h2 className="font-display text-[40px] md:text-[56px] uppercase text-ink-black leading-none tracking-[-0.01em]">
              Trending Now
            </h2>
          </div>
          <div className="flex-1 h-[1px] bg-rule-grey hidden md:block" />
          <Link
            href="/products"
            className="hidden md:block font-mono text-[10px] uppercase tracking-[0.12em] text-rule-grey hover:text-ink-black transition-colors whitespace-nowrap"
          >
            View All →
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
          5. SERVICES STRIP — editorial version
          ═══════════════════════════════════════════════ */}
      <AnimatedReveal>
        <section className="px-4 sm:px-10 lg:px-[5vw] py-14 md:py-20 border-b border-rule-grey">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-rule-grey">
            {[
              { num: "01", title: "Fast & Free Delivery", desc: "Free delivery for all orders over ৳1,500" },
              { num: "02", title: "24/7 Support",         desc: "Friendly customer support, always available" },
              { num: "03", title: "30-Day Returns",       desc: "We return money within 30 days" },
            ].map(({ num, title, desc }) => (
              <div key={num} className="flex flex-col gap-3 px-8 py-8 first:pl-0 last:pr-0">
                <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-stamp-red">{num}</p>
                <h4 className="font-display text-[20px] uppercase text-ink-black leading-tight">{title}</h4>
                <p className="font-body text-[13px] text-rule-grey leading-[1.7]">{desc}</p>
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