"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, ArrowRight, Play, X } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";

export default function HeroBanner() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  return (
    <section className="w-full relative overflow-hidden bg-[#FDF8F0] border-b border-[#EDE4D8] min-h-[440px] sm:min-h-[520px] lg:min-h-[560px] xl:min-h-[620px] flex items-center font-sans">
      
      {/* ═══ Full Width Background Banner Image (toyhourse-hero-section.png) ═══ */}
      <div className="absolute inset-0 w-full h-full pointer-events-none select-none">
        <Image
          src="/images/toyhourse-hero-section.png"
          alt="Toy Hourse Hero Banner"
          fill
          priority
          sizes="100vw"
          className="object-cover object-right"
        />
        {/* Subtle gradient overlay on left for pristine contrast & readability on any device */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#FDF8F0] via-[#FDF8F0]/95 sm:via-[#FDF8F0]/85 md:via-[#FDF8F0]/75 to-transparent w-full md:w-[65%] lg:w-[50%]" />
      </div>

      {/* ═══ Content Container (Centered & Aligned with Navigation Grid) ═══ */}
      <div className="w-full max-w-[1360px] xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 lg:py-16 relative z-10 flex items-center justify-between">
        
        {/* Left Content Area */}
        <div className="relative z-10 max-w-xl lg:max-w-2xl flex flex-col justify-center">
          
          {/* Welcome Badge */}
          <div className="inline-flex items-center gap-2 bg-[#FFFBEB] border border-[#FDE68A] text-[#1E1B4B] text-xs sm:text-sm font-semibold px-3.5 py-1 sm:px-4 sm:py-1.5 rounded-full shadow-xs mb-4 sm:mb-6 w-fit animate-fade-in">
            <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#F59E0B] fill-[#F59E0B]" />
            <span>Welcome to Toy Hourse!</span>
          </div>

          {/* Headline */}
          <h1 className="text-2xl xs:text-3xl sm:text-5xl lg:text-[56px] xl:text-[62px] font-black tracking-tight text-[#1E1B4B] leading-[1.15] sm:leading-[1.12] mb-4 sm:mb-5">
            Play. Learn. Grow.
            <br />
            <span className="relative inline-block text-[#5428D8] mt-1">
              with Toy Hourse!
              {/* Purple curved doodle underline accent matching reference UI */}
              <svg
                className="absolute -bottom-2.5 left-0 w-full h-3.5 text-[#5428D8]"
                viewBox="0 0 260 14"
                fill="none"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d="M3 10C55 2 110 3 165 7C205 10 235 5 257 8"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-gray-600 text-sm sm:text-lg lg:text-xl font-normal leading-relaxed max-w-md sm:max-w-lg mb-6 sm:mb-8">
            Discover amazing toys, cool gadgets and more for a happier childhood.
          </p>

          {/* Action CTA Buttons */}
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-[#5428D8] hover:bg-[#481fbe] text-white font-semibold text-xs sm:text-base px-5 py-3 sm:px-7 sm:py-3.5 rounded-full shadow-lg shadow-[#5428D8]/25 transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] group"
            >
              <span>Shop Now</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <button
              type="button"
              onClick={() => setIsVideoOpen(true)}
              className="inline-flex items-center gap-2 bg-white/95 hover:bg-white text-[#1E1B4B] font-semibold text-xs sm:text-base px-4 py-3 sm:px-6 sm:py-3.5 rounded-full border border-gray-200/90 shadow-xs transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-[#1E1B4B] text-[#1E1B4B]" />
              <span>Watch Video</span>
            </button>
          </div>

          {/* Pagination Carousel Dots (bottom-left) */}
          <div className="flex items-center gap-2 mt-8 sm:mt-12">
            {[0, 1, 2].map((idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  activeSlide === idx
                    ? "w-7 h-2.5 bg-[#5428D8]"
                    : "w-2.5 h-2.5 bg-[#5428D8]/25 hover:bg-[#5428D8]/50"
                }`}
              />
            ))}
          </div>
        </div>

        {/* ═══ Top-Right Doodle Accent (Little Moments... Big Happiness ♡) ═══ */}
        <div className="hidden lg:flex absolute top-8 sm:top-10 right-6 sm:right-10 lg:right-16 xl:right-24 z-20 flex-col items-center select-none pointer-events-none">
          {/* 3 Radiating doodle rays */}
          <div className="flex items-center justify-center gap-1.5 mb-1 text-[#5428D8]">
            <span className="w-1 h-3.5 bg-[#5428D8] rounded-full rotate-[-28deg] origin-bottom block" />
            <span className="w-1 h-4 bg-[#5428D8] rounded-full block" />
            <span className="w-1 h-3.5 bg-[#5428D8] rounded-full rotate-[28deg] origin-bottom block" />
          </div>

          {/* Playful curved handwritten style text */}
          <div className="text-center font-bold text-[#5428D8] leading-tight text-lg tracking-tight">
            <p className="italic">Little</p>
            <p className="italic">Moments...</p>
            <p className="flex items-center justify-center gap-1 mt-0.5 not-italic">
              <span>Big Happiness</span>
              <svg
                className="w-4 h-4 inline-block text-[#5428D8]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </p>
          </div>
        </div>

      </div>

      {/* ═══ Interactive Video Modal ═══ */}
      <AnimatePresence>
        {isVideoOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsVideoOpen(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-md"
            />
            <m.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25 }}
              className="relative z-10 w-full max-w-4xl bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10"
            >
              <button
                type="button"
                onClick={() => setIsVideoOpen(false)}
                className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close video"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="relative aspect-video w-full">
                <video
                  src="/video/hero-bg.mp4"
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>
            </m.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
