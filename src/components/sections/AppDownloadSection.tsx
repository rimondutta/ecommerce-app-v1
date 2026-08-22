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
      <section className="px-4 sm:px-10 lg:px-[5vw] py-14 md:py-24 bg-ink-black text-paper-white relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-stamp-red/30 to-transparent blur-3xl"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-paper-white/20 to-transparent blur-3xl"></div>
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
                href="#ios-app"
                className="group flex items-center gap-4 bg-paper-white text-ink-black px-6 py-3.5 rounded-full hover:bg-rule-grey transition-colors duration-300 w-full sm:w-auto justify-center"
              >
                <FaApple className="w-7 h-7" />
                <div className="flex flex-col items-start">
                  <span className="text-[10px] font-medium uppercase tracking-wider leading-none text-ink-black/60 group-hover:text-ink-black/80">Download on the</span>
                  <span className="text-base font-bold font-display leading-tight">App Store</span>
                </div>
              </Link>

              {/* Google Play Button */}
              <Link
                href="#android-app"
                className="group flex items-center gap-4 bg-transparent border border-paper-white/20 text-paper-white px-6 py-3.5 rounded-full hover:bg-paper-white/10 transition-colors duration-300 w-full sm:w-auto justify-center"
              >
                <FaGooglePlay className="w-6 h-6" />
                <div className="flex flex-col items-start">
                  <span className="text-[10px] font-medium uppercase tracking-wider leading-none text-paper-white/60 group-hover:text-paper-white/80">GET IT ON</span>
                  <span className="text-base font-bold font-display leading-tight">Google Play</span>
                </div>
              </Link>
            </div>

            <div className="pt-6 flex items-center justify-center lg:justify-start gap-4 opacity-80">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-ink-black bg-rule-grey overflow-hidden relative">
                    <Image src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" fill className="object-cover" />
                  </div>
                ))}
              </div>
              <div className="text-sm font-body">
                <span className="font-bold text-paper-white">10k+</span> happy users
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
              className="relative w-full aspect-[4/5] lg:aspect-square max-w-[500px]"
            >
              {/* Using a placeholder phone mockup. You can replace this with a real screenshot */}
              <div className="absolute inset-0 bg-gradient-to-br from-paper-white/5 to-transparent rounded-[40px] border border-paper-white/10 p-4 transform rotate-[-5deg] hover:rotate-0 transition-transform duration-700 ease-out">
                <div className="w-full h-full bg-ink-black rounded-[32px] overflow-hidden relative shadow-2xl">
                  {/* Phone Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-6 bg-ink-black rounded-b-3xl z-20 flex justify-center items-center">
                    <div className="w-12 h-1.5 bg-paper-white/20 rounded-full"></div>
                  </div>
                  {/* Phone Screen Content placeholder */}
                  <Image
                    src="/images/mobile-app.jpeg"
                    alt="App Screenshot"
                    fill
                    className="object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-black via-transparent to-transparent"></div>
                  <div className="absolute bottom-10 left-6 right-6">
                    <div className="h-4 w-1/3 bg-paper-white/20 rounded mb-4"></div>
                    <div className="h-10 w-full bg-paper-white rounded-xl mb-4"></div>
                    <div className="h-16 w-full bg-paper-white/10 backdrop-blur-md rounded-2xl"></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </section>
    </AnimatedReveal>
  );
}
