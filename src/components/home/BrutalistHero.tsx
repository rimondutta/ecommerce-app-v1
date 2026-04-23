"use client";

import { ArrowRight, Play } from "lucide-react";
import Link from "next/link";

export default function ModernHero() {
  return (
    <section className="relative w-full min-h-[92vh] flex flex-col items-center justify-center bg-white overflow-hidden">
      {/* Background Layer with high-quality campaign image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/hero_campaign.png"
          alt="FlexWear Campaign"
          className="w-full h-full object-cover grayscale-[0.2] transition-transform duration-[10s] hover:scale-105"
        />
        {/* Modern vignette / gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-[1440px] px-6 md:px-12 flex flex-col items-center md:items-start justify-center text-center md:text-left h-full pointer-events-none">
        
        {/* Secondary floating element for "Modern" vibes */}
        <div className="mb-6 opacity-0 animate-reveal pointer-events-auto" style={{ animationDelay: "0.1s" }}>
          <span className="glass px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.25em] text-black">
            Autumn Winter 2024 Collection
          </span>
        </div>

        <h1 
          className="font-display font-black uppercase leading-[0.85] tracking-tight text-white mb-8 opacity-0 animate-reveal"
          style={{ fontSize: "clamp(3.5rem, 12vw, 10rem)", animationDelay: "0.3s" }}
        >
          COMFORT<br />
          <span className="text-transparent" style={{ WebkitTextStroke: "2px white" }}>MEETS</span><br />
          CONFIDENCE
        </h1>

        <p className="max-w-md text-white/80 text-sm md:text-base font-medium mb-10 opacity-0 animate-reveal leading-relaxed" style={{ animationDelay: "0.5s" }}>
          Engineered for the urban explorer. Premium materials, minimalist silhouettes, and unprecedented comfort for the modern lifestyle.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 opacity-0 animate-reveal pointer-events-auto" style={{ animationDelay: "0.7s" }}>
          <Link href="/shop" className="group relative bg-white text-black px-10 py-5 text-xs font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all flex items-center justify-center gap-2 shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)] hover:shadow-none translate-y-0 hover:translate-x-1 hover:translate-y-1">
            EXPLORE SHOP
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <button className="glass-dark text-white px-10 py-5 text-xs font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2 border border-white/20">
            VIEW LOOKBOOK
            <Play size={14} fill="currentColor" />
          </button>
        </div>
      </div>

      {/* Modern Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-3 opacity-0 animate-reveal" style={{ animationDelay: "1s" }}>
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 rotate-180 vertical-rl">scroll</span>
        <div className="w-[1px] h-20 bg-gradient-to-b from-white/60 to-transparent" />
      </div>

      {/* Brutalist Detail Lines */}
      <div className="absolute top-0 right-0 bottom-0 w-[1px] bg-white/10 hidden xl:block translate-x-[-120px]" />
      <div className="absolute top-0 right-0 bottom-0 w-[1px] bg-white/10 hidden xl:block translate-x-[-240px]" />
    </section>
  );
}
