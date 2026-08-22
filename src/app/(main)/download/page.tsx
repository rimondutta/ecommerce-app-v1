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
  { icon: FaTag, label: "App-Only Deals", desc: "Exclusive discounts only available in the app" },
  { icon: FaTruck, label: "Live Order Tracking", desc: "Know exactly where your order is, in real time" },
];

export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white overflow-x-hidden">

      {/* ── Ambient glow ── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-[700px] h-[700px] rounded-full bg-violet-700/20 blur-[140px] -translate-x-1/4 -translate-y-1/4" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-rose-700/15 blur-[120px] translate-x-1/4 translate-y-1/4" />
      </div>

      {/* ── Hero ── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 pt-32 pb-24">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-16 lg:gap-20">

          {/* ── Left: Text + Buttons ── */}
          <div className="flex-1 min-w-0 space-y-7 text-center lg:text-left">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-violet-600/20 border border-violet-500/25 px-4 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse shrink-0" />
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-violet-300 whitespace-nowrap">
                Official Mobile App
              </span>
            </div>

            {/* Heading */}
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl uppercase leading-[1.05] tracking-tight text-white">
              Get the<br />
              <span className="text-violet-400">Toy Hourse</span><br />
              App
            </h1>

            {/* Description */}
            <p className="font-body text-base lg:text-lg text-white/60 max-w-md mx-auto lg:mx-0 leading-relaxed">
              Shop smarter on the go — faster checkout, app-only deals,
              and live order tracking, all in your pocket.
            </p>

            {/* Download Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              {/* Android */}
              <a
                href="/app-release.apk"
                download
                className="group flex items-center gap-4 bg-violet-600 hover:bg-violet-500 text-white px-7 py-4 rounded-2xl transition-all duration-300 w-full sm:w-auto justify-center shadow-[0_8px_30px_rgba(124,58,237,0.35)] hover:shadow-[0_12px_40px_rgba(124,58,237,0.55)] hover:-translate-y-0.5"
              >
                <FaAndroid className="w-7 h-7 text-green-300 shrink-0" />
                <div className="flex flex-col items-start text-left">
                  <span className="text-[10px] font-medium uppercase tracking-widest leading-none text-white/60">Direct Download</span>
                  <span className="text-lg font-bold leading-snug">Android APK</span>
                </div>
                <FaDownload className="w-4 h-4 ml-1 text-white/50 group-hover:text-white transition-colors shrink-0" />
              </a>

              {/* iOS */}
              <Link
                href="#ios-coming-soon"
                className="flex items-center gap-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white px-7 py-4 rounded-2xl transition-all duration-300 w-full sm:w-auto justify-center backdrop-blur-sm"
              >
                <FaApple className="w-6 h-6 shrink-0" />
                <div className="flex flex-col items-start text-left">
                  <span className="text-[10px] font-medium uppercase tracking-widest leading-none text-white/40">Coming soon</span>
                  <span className="text-lg font-bold leading-snug">App Store</span>
                </div>
              </Link>
            </div>

            {/* Version info */}
            <p className="font-mono text-[11px] text-white/30 tracking-widest">
              v1.0.0 &nbsp;·&nbsp; 45 MB &nbsp;·&nbsp; Android 8.0+
            </p>

            {/* Stars */}
            <div className="flex items-center justify-center lg:justify-start gap-2">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(i => <FaStar key={i} className="w-4 h-4 text-amber-400" />)}
              </div>
              <span className="text-sm text-white/40 font-body">4.9 &nbsp;·&nbsp; 10k+ happy users</span>
            </div>
          </div>

          {/* ── Right: Phone + floating badges ── */}
          <div className="flex-1 flex justify-center lg:justify-end relative w-full">
            {/* Glow behind phone */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-72 h-72 rounded-full bg-violet-600/25 blur-3xl" />
            </div>

            {/* Phone mockup */}
            <div className="relative z-10 w-full max-w-[260px] sm:max-w-[280px] lg:max-w-[300px] aspect-[9/19]">
              <div className="w-full h-full rounded-[2.5rem] overflow-hidden ring-1 ring-white/10 shadow-[0_40px_80px_rgba(0,0,0,0.7)]">
                <Image
                  src="/images/mobile-app-image.png"
                  alt="Toy Hourse App Preview"
                  fill
                  className="object-contain"
                  priority
                />
              </div>

              {/* Floating: Downloads */}
              <div className="absolute -top-4 -left-14 sm:-left-20 bg-white/8 backdrop-blur-xl border border-white/10 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 z-20">
                <div className="bg-violet-500/30 w-9 h-9 flex items-center justify-center rounded-xl shrink-0">
                  <FaDownload className="w-4 h-4 text-violet-300" />
                </div>
                <div>
                  <p className="font-bold text-white text-sm leading-none">5k+</p>
                  <p className="font-mono text-[10px] text-white/40 mt-0.5 uppercase tracking-wider">Downloads</p>
                </div>
              </div>

              {/* Floating: Verified */}
              <div className="absolute -bottom-4 -right-10 sm:-right-16 bg-white/8 backdrop-blur-xl border border-white/10 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 z-20">
                <div className="bg-green-500/20 w-9 h-9 flex items-center justify-center rounded-xl shrink-0">
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-white text-sm leading-none">Verified</p>
                  <p className="font-mono text-[10px] text-white/40 mt-0.5 uppercase tracking-wider">Safe APK</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── Features Strip ── */}
      <section className="relative z-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 py-14 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/5">
          {features.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex items-start gap-5 py-8 sm:py-0 sm:px-8 first:pl-0 last:pr-0">
              <div className="shrink-0 w-11 h-11 rounded-xl bg-violet-600/20 border border-violet-500/20 flex items-center justify-center">
                <Icon className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <h3 className="font-display text-base uppercase text-white tracking-wide mb-1">{label}</h3>
                <p className="font-body text-sm text-white/40 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
