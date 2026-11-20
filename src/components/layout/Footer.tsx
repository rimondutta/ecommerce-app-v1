"use client";

import React from "react";
import Link from "next/link";
import { Mail, Phone, Clock } from "lucide-react";

// ─── Custom Icons Matching Reference UI ───
function RockingHorseLogo({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M5 38C15 45 33 45 43 38"
        stroke="#5428D8"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M4 35.5C4.5 37 5.5 37.5 6.5 37M44 35.5C43.5 37 42.5 37.5 41.5 37"
        stroke="#5428D8"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M16 38L21 24M32 38L27 24"
        stroke="#5428D8"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M17 24H31C33 24 35 22 35 20C35 17 33 16 31 16H27L25 10C24 7 21 6 18 8L14 11C12 12.5 12 15 14 17L17 20V24Z"
        fill="#5428D8"
      />
      <circle cx="18" cy="11" r="1.5" fill="white" />
      <path
        d="M21 20C21 21 23 22 25 22C27 22 28 21 28 20"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FacebookIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function LinkedinIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9h2.79v8.37H6.46v-8.37M7.86 6.54a1.63 1.63 0 1 0 0 3.26 1.63 1.63 0 0 0 0-3.26z" />
    </svg>
  );
}

function TwitterBirdIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.936 9.936 0 0024 4.59z" />
    </svg>
  );
}

// ─── Payment Cards Matching Reference ───
function VisaCard() {
  return (
    <div className="h-6 px-2 rounded-[3px] border border-gray-200 bg-white flex items-center justify-center shadow-2xs">
      <span className="font-black text-[#1434CB] text-[10px] tracking-tight italic">VISA</span>
    </div>
  );
}

function MastercardCard() {
  return (
    <div className="h-6 px-1.5 rounded-[3px] border border-gray-200 bg-white flex items-center justify-center shadow-2xs gap-0.5">
      <div className="w-2.5 h-2.5 rounded-full bg-[#EB001B]" />
      <div className="w-2.5 h-2.5 rounded-full bg-[#F79E1B] -ml-1 opacity-90" />
    </div>
  );
}

function AmexCard() {
  return (
    <div className="h-6 px-1.5 rounded-[3px] border border-[#006FCF] bg-[#006FCF] text-white flex items-center justify-center shadow-2xs">
      <span className="font-black text-[8px] tracking-tighter">AMEX</span>
    </div>
  );
}

function JcbCard() {
  return (
    <div className="h-6 px-1.5 rounded-[3px] border border-gray-200 bg-white flex items-center justify-center shadow-2xs">
      <div className="flex items-center text-[7px] font-black">
        <span className="text-[#0E4298]">J</span>
        <span className="text-[#DA251C]">C</span>
        <span className="text-[#00873F]">B</span>
      </div>
    </div>
  );
}

function DiscoverCard() {
  return (
    <div className="h-6 px-1.5 rounded-[3px] border border-gray-200 bg-white flex items-center justify-center shadow-2xs">
      <span className="font-bold text-[#FF6000] text-[8px] tracking-tight">DISCOVER</span>
    </div>
  );
}

function BkashCard() {
  return (
    <div className="h-6 px-2 rounded-[3px] bg-[#D12053] text-white flex items-center justify-center shadow-2xs">
      <span className="font-bold text-[9px] tracking-tight">bKash</span>
    </div>
  );
}

function NagadCard() {
  return (
    <div className="h-6 px-2 rounded-[3px] bg-[#F7941D] text-white flex items-center justify-center shadow-2xs">
      <span className="font-bold text-[9px] tracking-tight">Nagad</span>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="w-full bg-[#FDF8F0] border-t border-[#EDE4D8] pt-16 sm:pt-20 pb-12" suppressHydrationWarning>
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ─── 5-Column Navigation Grid Matching Reference Image ─── */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-10">

          {/* Col 1: Brand Logo, Description, Socials */}
          <div className="col-span-2 sm:col-span-2 md:col-span-1 lg:col-span-1 flex flex-col gap-3.5">
            <Link href="/" className="flex items-center gap-2.5 group w-fit">
              <RockingHorseLogo className="w-8 h-8 group-hover:scale-105 transition-transform shrink-0" />
              <span className="font-bold text-xl sm:text-2xl text-stone-900 tracking-tight">
                Toy Hourse
              </span>
            </Link>

            <p className="text-stone-500 text-sm leading-relaxed max-w-[270px]">
              Safe, trusted baby essentials from brands parents love, with fast delivery and easy returns.
            </p>

            {/* Social Media Rounded Buttons with micro-interactions */}
            <div className="flex items-center gap-2 mt-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-full border border-stone-200 bg-white flex items-center justify-center text-stone-600 hover:text-stone-900 hover:border-stone-400 hover:bg-stone-50 transition-all shadow-2xs"
              >
                <FacebookIcon className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full border border-stone-200 bg-white flex items-center justify-center text-stone-600 hover:text-stone-900 hover:border-stone-400 hover:bg-stone-50 transition-all shadow-2xs"
              >
                <InstagramIcon className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-9 h-9 rounded-full border border-stone-200 bg-white flex items-center justify-center text-stone-600 hover:text-stone-900 hover:border-stone-400 hover:bg-stone-50 transition-all shadow-2xs"
              >
                <LinkedinIcon className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter / X"
                className="w-9 h-9 rounded-full border border-stone-200 bg-white flex items-center justify-center text-stone-600 hover:text-stone-900 hover:border-stone-400 hover:bg-stone-50 transition-all shadow-2xs"
              >
                <TwitterBirdIcon className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Col 2: Company */}
          <div className="flex flex-col gap-3.5">
            <h4 className="font-bold text-[15px] sm:text-base text-stone-900">Company</h4>
            <ul className="flex flex-col gap-2.5 text-sm text-stone-500 font-normal">
              <li>
                <Link href="/about" className="hover:text-stone-900 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/blogs" className="hover:text-stone-900 transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/reviews" className="hover:text-stone-900 transition-colors">
                  Customer Reviews
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-stone-900 transition-colors">
                  Business Programs
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-stone-900 transition-colors">
                  Become a Vendor
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Support */}
          <div className="flex flex-col gap-3.5">
            <h4 className="font-bold text-[15px] sm:text-base text-stone-900">Support</h4>
            <ul className="flex flex-col gap-2.5 text-sm text-stone-500 font-normal">
              <li>
                <Link href="/contact" className="hover:text-stone-900 transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="hover:text-stone-900 transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-stone-900 transition-colors">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-stone-900 transition-colors">
                  Returns &amp; Exchanges
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-stone-900 transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Shop */}
          <div className="flex flex-col gap-3.5">
            <h4 className="font-bold text-[15px] sm:text-base text-stone-900">Shop</h4>
            <ul className="flex flex-col gap-2.5 text-sm text-stone-500 font-normal">
              <li>
                <Link href="/products" className="hover:text-stone-900 transition-colors">
                  Shop All
                </Link>
              </li>
              <li>
                <Link href="/products?category=toys" className="hover:text-stone-900 transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/products?sort=newest" className="hover:text-stone-900 transition-colors">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link href="/products?tag=specialoffer" className="hover:text-stone-900 transition-colors">
                  Today&apos;s Deals
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-stone-900 transition-colors">
                  My Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Contact Us & Payment */}
          <div className="col-span-2 sm:col-span-2 md:col-span-2 lg:col-span-1 flex flex-col gap-3.5">
            <h4 className="font-bold text-[15px] sm:text-base text-stone-900">Contact Us</h4>
            
            <div className="flex flex-col gap-3">
              <a
                href="tel:+8801616921965"
                className="flex items-center gap-3 text-sm text-stone-600 hover:text-stone-900 transition-colors group"
              >
                <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-700 shrink-0 group-hover:bg-stone-200 transition-colors">
                  <Phone size={14} />
                </div>
                <span>+880 1616-921965</span>
              </a>

              <a
                href="mailto:support@toyhourse.com"
                className="flex items-center gap-3 text-sm text-stone-600 hover:text-stone-900 transition-colors group"
              >
                <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-700 shrink-0 group-hover:bg-stone-200 transition-colors">
                  <Mail size={14} />
                </div>
                <span>support@toyhourse.com</span>
              </a>

              <div className="flex items-center gap-3 text-sm text-stone-600">
                <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-700 shrink-0">
                  <Clock size={14} />
                </div>
                <span>Mon–Fri, 9 AM – 6 PM EST</span>
              </div>
            </div>

            {/* Safe & Secure Payments */}
            <div className="mt-2.5">
              <p className="text-xs text-stone-500 font-normal mb-2">
                Safe &amp; secure payments
              </p>
              
              <div className="flex items-center gap-1.5 flex-wrap">
                <VisaCard />
                <MastercardCard />
                <AmexCard />
                <JcbCard />
                <DiscoverCard />
                <BkashCard />
                <NagadCard />
              </div>
            </div>
          </div>

        </div>

        {/* ─── Bottom Fine Print Bar Matching Reference UI ─── */}
        <div className="mt-14 sm:mt-16 pt-6 border-t border-stone-200/70">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-[13px] text-stone-500 font-normal text-center sm:text-left">
            <p className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
              <span>© {new Date().getFullYear()} Toy Hourse. All rights reserved.</span>
              <span className="hidden sm:inline text-stone-300">·</span>
              <span>
                Developed by{" "}
                <a
                  href="https://www.facebook.com/dutta.rimon/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[#5428D8] hover:text-[#4318C4] transition-colors"
                >
                  Rimon Dutta
                </a>
              </span>
            </p>
            <div className="flex items-center gap-6 flex-wrap justify-center text-stone-500">
              <Link href="/privacy" className="hover:text-stone-900 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-stone-900 transition-colors">
                Terms of Use
              </Link>
              <Link href="/returns" className="hover:text-stone-900 transition-colors">
                Returns
              </Link>
              <Link href="/sitemap" className="hover:text-stone-900 transition-colors">
                Sitemap
              </Link>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
