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
      <section className="px-4 sm:px-10 lg:px-[5vw] py-14 md:py-24 bg-paper-grey/60 text-ink-black relative overflow-hidden border-t border-white/5">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-full h-full pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-violet-600/20 blur-[100px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-rose-600/15 blur-[80px]"></div>
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20 max-w-7xl mx-auto">

          {/* Text Content */}
          <div className="flex-1 space-y-8 text-center lg:text-left">
            <div className="space-y-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-stamp-red">
                Experience More
              </p>
              <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl uppercase leading-[1.1] tracking-tight">
                Shop Anywhere, <br className="hidden lg:block" />
                <span className="italic font-light text-rule-grey">Anytime.</span>
              </h2>
            </div>

            <p className="font-body text-base lg:text-lg text-rule-grey max-w-md mx-auto lg:mx-0 leading-[1.7]">
              Download the Toy Hourse mobile app for exclusive deals, early access to new arrivals, and a seamless shopping experience on the go.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              {/* Apple App Store Button */}
              <Link
                href="/download"
                className="group flex items-center gap-4 bg-white text-[#0A0A0F] px-6 py-3.5 rounded-full hover:bg-white/90 transition-colors duration-300 w-full sm:w-auto justify-center shadow-lg"
              >
                <FaApple className="w-7 h-7" />
                <div className="flex flex-col items-start">
                  <span className="text-[10px] font-medium uppercase tracking-wider leading-none text-[#0A0A0F]/60">Download on the</span>
                  <span className="text-base font-bold font-display leading-tight">App Store</span>
                </div>
              </Link>

              {/* Google Play / APK Button */}
              <Link
                href="/download"
                className="group flex items-center gap-4 bg-transparent border border-white/20 text-white px-6 py-3.5 rounded-full hover:bg-white/10 transition-colors duration-300 w-full sm:w-auto justify-center"
              >
                <FaGooglePlay className="w-6 h-6" />
                <div className="flex flex-col items-start">
                  <span className="text-[10px] font-medium uppercase tracking-wider leading-none text-white/60">GET IT ON</span>
                  <span className="text-base font-bold font-display leading-tight">Google Play</span>
                </div>
              </Link>
            </div>

            <div className="pt-6 flex items-center justify-center lg:justify-start gap-4 opacity-80">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-ink-black bg-rule-grey overflow-hidden relative" style={{ position: 'relative' }}>
                    <Image src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" fill sizes="40px" className="object-cover" />
                  </div>
                ))}
              </div>
              <div className="text-sm font-body text-white/70">
                <span className="font-bold text-white">10k+</span> happy users
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
              className="relative w-full max-w-[300px] lg:max-w-[340px] aspect-[9/19] transform rotate-[-5deg] hover:rotate-0 transition-transform duration-700 ease-out rounded-[3rem] overflow-hidden shadow-2xl bg-paper-white"
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
