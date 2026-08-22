import React from "react";
import Image from "next/image";
import Link from "next/link";
import { FaAndroid, FaApple, FaDownload, FaStar, FaBolt, FaTruck, FaTag } from "react-icons/fa";

export const metadata = {
  title: "Download App | Toy Hourse",
  description: "Download the official Toy Hourse app for Android and iOS.",
};

const features = [
  { icon: FaBolt, label: "Lightning Checkout", desc: "Order in seconds with saved addresses & payments" },
  { icon: FaTag,  label: "App-Only Deals",     desc: "Exclusive discounts only available in the app" },
  { icon: FaTruck,label: "Live Order Tracking", desc: "Know exactly where your order is, in real time" },
];

export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] text-paper-white overflow-hidden">

      {/* ── Ambient glow blobs ── */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-[-15%] left-[-10%] w-[600px] h-[600px] rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-stamp-red/15 blur-[120px]" />
      </div>

      {/* ── Hero ── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pt-32 pb-24">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">

          {/* ── Left: Copy + Buttons ── */}
          <div className="flex-1 text-center lg:text-left space-y-8">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-violet-600/20 border border-violet-500/30 px-4 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-violet-300">
                Official Mobile App
              </span>
            </div>

            {/* Heading */}
            <div>
              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl uppercase leading-[1] tracking-tight">
                Get the<br />
                <span className="bg-gradient-to-r from-violet-400 via-violet-200 to-paper-white bg-clip-text text-transparent">
                  Toy Hourse
                </span><br />
                App
              </h1>
              <p className="font-body text-base lg:text-lg text-paper-white/50 max-w-md mx-auto lg:mx-0 mt-6 leading-relaxed">
                Shop smarter on the go — faster checkout, app-only deals, and live order tracking, all in your pocket.
              </p>
            </div>

            {/* Download Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              {/* Android APK */}
              <a
                href="/app-release.apk"
                download
                className="group relative inline-flex items-center gap-4 bg-gradient-to-r from-violet-600 to-violet-500 text-white px-7 py-4 rounded-2xl hover:from-violet-500 hover:to-violet-400 transition-all duration-300 w-full sm:w-auto justify-center shadow-[0_8px_30px_rgba(124,58,237,0.4)] hover:shadow-[0_12px_40px_rgba(124,58,237,0.6)] hover:-translate-y-1"
              >
                <FaAndroid className="w-7 h-7 text-green-300" />
                <div className="flex flex-col items-start text-left">
                  <span className="text-[10px] font-medium uppercase tracking-widest leading-none opacity-70">Direct Download</span>
                  <span className="text-lg font-bold font-display leading-snug">Android APK</span>
                </div>
                <FaDownload className="w-4 h-4 ml-2 opacity-60 group-hover:opacity-100 transition-opacity" />
              </a>

              {/* App Store */}
              <Link
                href="#ios-coming-soon"
                className="group inline-flex items-center gap-4 bg-white/5 border border-white/10 text-paper-white px-7 py-4 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 w-full sm:w-auto justify-center backdrop-blur-sm"
              >
                <FaApple className="w-6 h-6" />
                <div className="flex flex-col items-start text-left">
                  <span className="text-[10px] font-medium uppercase tracking-widest leading-none opacity-50">Coming soon</span>
                  <span className="text-lg font-bold font-display leading-snug">App Store</span>
                </div>
              </Link>
            </div>

            {/* Meta info */}
            <p className="font-mono text-[11px] text-paper-white/30 tracking-widest pt-1">
              v1.0.0 &nbsp;•&nbsp; 45 MB &nbsp;•&nbsp; Android 8.0+
            </p>

            {/* Rating strip */}
            <div className="flex items-center justify-center lg:justify-start gap-3 pt-4">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(i => (
                  <FaStar key={i} className="w-4 h-4 text-amber-400" />
                ))}
              </div>
              <span className="font-mono text-xs text-paper-white/40">4.9 / 5 · 10k+ users</span>
            </div>
          </div>

          {/* ── Right: Phone Mockup ── */}
          <div className="flex-1 flex justify-center lg:justify-end relative">
            {/* Glow behind phone */}
            <div className="absolute inset-0 bg-violet-500/20 rounded-full blur-3xl scale-75 opacity-60" />

            <div className="relative w-full max-w-[280px] sm:max-w-[300px] lg:max-w-[320px] aspect-[9/19] rounded-[2.5rem] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.6)] z-10 ring-1 ring-white/10">
              <Image
                src="/images/mobile-app-image.png"
                alt="Toy Hourse App Preview"
                fill
                className="object-contain"
                priority
              />
            </div>

            {/* Floating card: Downloads */}
            <div className="absolute top-10 -left-6 lg:-left-12 bg-white/5 backdrop-blur-xl border border-white/10 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 z-20">
              <div className="bg-violet-500/30 text-violet-300 w-9 h-9 flex items-center justify-center rounded-xl">
                <FaDownload className="w-4 h-4" />
              </div>
              <div>
                <p className="font-display font-bold text-white text-sm leading-none">10k+</p>
                <p className="font-mono text-[10px] text-white/40 mt-0.5 uppercase tracking-wider">Downloads</p>
              </div>
            </div>

            {/* Floating card: Secure */}
            <div className="absolute bottom-12 -right-4 lg:-right-10 bg-white/5 backdrop-blur-xl border border-white/10 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 z-20">
              <div className="bg-green-500/20 text-green-400 w-9 h-9 flex items-center justify-center rounded-xl">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-display font-bold text-white text-sm leading-none">Verified</p>
                <p className="font-mono text-[10px] text-white/40 mt-0.5 uppercase tracking-wider">Safe APK</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Strip ── */}
      <section className="relative z-10 border-t border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-16 grid grid-cols-1 sm:grid-cols-3 gap-px bg-white/5">
          {features.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex items-start gap-5 p-8 bg-[#0A0A0F]">
              <div className="shrink-0 w-11 h-11 rounded-xl bg-violet-600/20 border border-violet-500/20 flex items-center justify-center">
                <Icon className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <h3 className="font-display text-base uppercase text-paper-white tracking-wide mb-1">{label}</h3>
                <p className="font-body text-sm text-paper-white/40 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
