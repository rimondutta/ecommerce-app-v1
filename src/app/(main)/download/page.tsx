import React from "react";
import Image from "next/image";
import Link from "next/link";
import { FaAndroid, FaDownload, FaApple } from "react-icons/fa";

export const metadata = {
  title: "Download App | Toy Hourse",
  description: "Download the official Toy Hourse app for Android and iOS.",
};

export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-paper-white flex items-center justify-center pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
        
        {/* Text and Download Button Area */}
        <div className="flex-1 text-center lg:text-left">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-stamp-red mb-4">
            Official Mobile App
          </p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-ink-black uppercase leading-tight tracking-tight mb-6">
            Get the <br className="hidden lg:block" />
            Toy Hourse App
          </h1>
          <p className="font-body text-base lg:text-lg text-rule-grey max-w-lg mx-auto lg:mx-0 mb-10 leading-relaxed">
            Experience faster checkout, exclusive app-only discounts, and real-time order tracking directly from your phone. 
          </p>

          <div className="space-y-6">
            {/* Primary Android APK Download */}
            <div>
              <a 
                href="/app-release.apk" 
                download
                className="group inline-flex items-center gap-4 bg-ink-black text-paper-white px-8 py-5 rounded-full hover:bg-stamp-red transition-all duration-300 w-full sm:w-auto justify-center shadow-xl hover:shadow-2xl hover:-translate-y-1"
              >
                <FaAndroid className="w-8 h-8 text-green-400 group-hover:text-paper-white transition-colors" />
                <div className="flex flex-col items-start text-left">
                  <span className="text-[11px] font-medium uppercase tracking-wider leading-none opacity-70">Direct Download</span>
                  <span className="text-xl font-bold font-display leading-tight">Android APK</span>
                </div>
                <FaDownload className="w-5 h-5 ml-4 opacity-50 group-hover:opacity-100 transition-opacity" />
              </a>
              <p className="font-body text-xs text-rule-grey mt-3 flex items-center justify-center lg:justify-start gap-1">
                Version 1.0.0 • Size: 45MB • Requires Android 8.0+
              </p>
            </div>

            <div className="flex items-center gap-4 justify-center lg:justify-start opacity-70 pt-4">
              <div className="h-px bg-rule-grey/30 flex-1 max-w-[50px]"></div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-rule-grey">Other Platforms</span>
              <div className="h-px bg-rule-grey/30 flex-1 max-w-[50px]"></div>
            </div>

            {/* Apple App Store */}
            <div className="flex items-center justify-center lg:justify-start gap-4">
              <Link 
                href="#ios-coming-soon" 
                className="group flex items-center gap-3 border border-rule-grey/30 text-ink-black px-6 py-3 rounded-full hover:border-ink-black transition-colors w-full sm:w-auto justify-center"
              >
                <FaApple className="w-6 h-6" />
                <div className="flex flex-col items-start text-left">
                  <span className="text-[9px] font-medium uppercase tracking-wider leading-none text-rule-grey">Download on the</span>
                  <span className="text-sm font-bold font-display leading-tight">App Store</span>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Visual / Mockup */}
        <div className="flex-1 w-full max-w-sm lg:max-w-md relative flex justify-center">
          {/* Decorative background shape */}
          <div className="absolute inset-0 bg-gradient-to-tr from-rule-grey/10 to-transparent rounded-[3rem] -rotate-3 scale-105 transform origin-bottom-left"></div>
          
          <div className="relative aspect-[9/19] w-full max-w-[320px] lg:max-w-[340px] rounded-[2.5rem] overflow-hidden shadow-2xl bg-paper-white z-10">
             <Image 
               src="/images/mobile-app.jpeg" 
               alt="App Preview" 
               fill 
               className="object-cover hover:scale-105 transition-transform duration-700"
             />
          </div>
          
          {/* Floating badge */}
          <div className="absolute -bottom-6 -left-6 bg-paper-white border border-rule-grey/20 p-4 rounded-2xl shadow-xl flex items-center gap-3">
             <div className="bg-green-100 text-green-600 w-10 h-10 flex items-center justify-center rounded-full">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
             </div>
             <div>
               <p className="font-display font-bold text-ink-black text-sm">Safe & Secure</p>
               <p className="font-body text-xs text-rule-grey">Verified APK</p>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
