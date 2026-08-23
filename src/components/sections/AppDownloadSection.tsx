"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import AnimatedReveal from "@/components/ui/AnimatedReveal";
import { FaApple, FaGooglePlay } from "react-icons/fa";

export default function AppDownloadSection() {
  return (
    <AnimatedReveal>
      <section className="px-4 sm:px-10 lg:px-[5vw] py-16 md:py-24 bg-white text-black relative overflow-hidden border-t border-black/10">

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20 max-w-7xl mx-auto">

          {/* Text Content */}
          <div className="flex-1 space-y-8 text-center lg:text-left">
            <div className="space-y-4">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">
                Experience More
              </p>
              <h2 className="font-serif font-light text-4xl sm:text-5xl lg:text-6xl text-black leading-[1.1] tracking-tight">
                Shop Anywhere, <br className="hidden lg:block" />
                <span className="italic text-zinc-500">Anytime.</span>
              </h2>
            </div>

            <p className="font-body font-light text-base lg:text-lg text-zinc-600 max-w-md mx-auto lg:mx-0 leading-[1.7]">
              Download the Toyhourse mobile app for exclusive deals, early access to new arrivals, and a seamless shopping experience on the go.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <Link
                href="/download"
                className="group flex items-center gap-4 bg-[#D5AEFD] text-black border border-[#D5AEFD] px-8 py-4 hover:bg-[#D5AEFD]/90 transition-colors duration-300 w-full sm:w-auto justify-center"
              >
                <FaApple className="w-6 h-6" />
                <div className="flex flex-col items-start">
                  <span className="font-mono text-[9px] uppercase tracking-wider leading-none opacity-70">Download on the</span>
                  <span className="font-body text-sm font-medium uppercase tracking-widest leading-tight">App Store</span>
                </div>
              </Link>

              <Link
                href="/download"
                className="group flex items-center gap-4 bg-transparent border border-[#D5AEFD] text-black px-8 py-4 hover:bg-[#D5AEFD] transition-colors duration-300 w-full sm:w-auto justify-center"
              >
                <FaGooglePlay className="w-5 h-5" />
                <div className="flex flex-col items-start">
                  <span className="font-mono text-[9px] uppercase tracking-wider leading-none opacity-70">GET IT ON</span>
                  <span className="font-body text-sm font-medium uppercase tracking-widest leading-tight">Google Play</span>
                </div>
              </Link>
            </div>

            <div className="pt-8 flex items-center justify-center lg:justify-start gap-4 opacity-70">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border border-white bg-zinc-200 overflow-hidden relative grayscale" style={{ position: 'relative' }}>
                    <Image src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" fill sizes="40px" className="object-cover" />
                  </div>
                ))}
              </div>
              <div className="text-sm font-body font-light text-zinc-600">
                <span className="font-serif italic text-black text-lg">10k+</span> happy users
              </div>
            </div>
          </div>

          {/* App Mockup / Visual */}
          <div className="flex-1 relative w-full max-w-[400px] lg:max-w-none flex justify-center lg:justify-end">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true, margin: "-100px" }}
              className="relative w-full max-w-[300px] lg:max-w-[340px] aspect-[9/19] rounded-[3rem] overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] bg-white border border-black/5"
            >
              <Image
                src="/images/mobile-app-image.png"
                alt="App Screenshot"
                fill
                sizes="(max-width: 768px) 300px, 340px"
                className="object-contain"
              />
            </motion.div>
          </div>

        </div>
      </section>
    </AnimatedReveal>
  );
}
