"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative w-full bg-neutral-950 pt-24 pb-12 mt-auto overflow-hidden">
      {/* Subtle top border gradient & background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[150px] bg-white/[0.02] blur-[100px] rounded-full pointer-events-none"></div>

      <div className="container mx-auto px-6 md:px-12 max-w-[1440px] relative z-10">
        {/* Top: Brand & Newsletter */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-16 mb-24">
          <div className="max-w-xl">
            <Link href="/" className="inline-block mb-8 transition-opacity hover:opacity-80">
              <Image
                src="/logo/toyhourse-logo.png"
                alt="Toy Hourse"
                width={140}
                height={48}
                className="h-10 w-auto object-contain"
              />
            </Link>
            <h2 className="text-4xl md:text-6xl font-display font-medium text-white tracking-tight leading-[1.1]">
              Playtime, <br className="hidden md:block" />
              <span className="text-neutral-500">reimagined.</span>
            </h2>
          </div>

          <div className="w-full lg:w-auto lg:min-w-[380px]">
            <p className="text-neutral-300 font-medium mb-4 text-sm">
              Stay in the loop
            </p>
            {/* Integrated Input & Button */}
            <div className="relative group">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full bg-white/5 border border-white/10 rounded-full pl-6 pr-14 py-4 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent transition-all backdrop-blur-sm"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-white text-black hover:bg-neutral-200 rounded-full w-10 h-10 flex items-center justify-center transition-transform duration-300 group-hover:scale-105 active:scale-95">
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-neutral-600 mt-3 ml-2">
              By subscribing, you agree to our Privacy Policy.
            </p>
          </div>
        </div>

        {/* Middle: Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12 mb-20">
          <div className="space-y-5">
            <h4 className="text-white font-medium text-sm tracking-wide">Shop</h4>
            <ul className="space-y-3 text-sm text-neutral-400">
              <li><Link href="/products" className="hover:text-white transition-colors duration-200">All Toys</Link></li>
              <li><Link href="/products?badge=New" className="hover:text-white transition-colors duration-200">New Arrivals</Link></li>
              <li><Link href="/products?category=Educational" className="hover:text-white transition-colors duration-200">Educational</Link></li>
              <li><Link href="/products?sort=price-low" className="hover:text-white transition-colors duration-200">Sale</Link></li>
            </ul>
          </div>
          <div className="space-y-5">
            <h4 className="text-white font-medium text-sm tracking-wide">Support</h4>
            <ul className="space-y-3 text-sm text-neutral-400">
              <li><Link href="/faq" className="hover:text-white transition-colors duration-200">FAQ</Link></li>
              <li><Link href="/shipping" className="hover:text-white transition-colors duration-200">Shipping</Link></li>
              <li><Link href="/returns" className="hover:text-white transition-colors duration-200">Returns</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors duration-200">Contact</Link></li>
            </ul>
          </div>
          <div className="space-y-5">
            <h4 className="text-white font-medium text-sm tracking-wide">Company</h4>
            <ul className="space-y-3 text-sm text-neutral-400">
              <li><Link href="/about" className="hover:text-white transition-colors duration-200">Our Story</Link></li>
              <li><Link href="/sustainability" className="hover:text-white transition-colors duration-200">Sustainability</Link></li>
              <li><Link href="/careers" className="hover:text-white transition-colors duration-200">Careers</Link></li>
            </ul>
          </div>
          <div className="space-y-5">
            <h4 className="text-white font-medium text-sm tracking-wide">Social</h4>
            <ul className="space-y-3 text-sm text-neutral-400">
              <li><a href="#" className="hover:text-white transition-colors duration-200">Instagram</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">TikTok</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">Pinterest</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom: Legal */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-white/10 text-sm text-neutral-500">
          {/* Copyright */}
          <p className="order-2 md:order-1 text-center md:text-left">
            © {new Date().getFullYear()} Toy Hourse. All rights reserved.
          </p>

          {/* Developer Credit */}
          <p className="order-1 md:order-2 text-xs md:text-sm text-neutral-500">
            Developed by{" "}
            <a
              href="https://facebook.com/dutta.rimon"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-400 hover:text-white font-medium transition-colors duration-200"
            >
              Rimon Dutta
            </a>
          </p>

          {/* Legal Links */}
          <div className="flex gap-6 order-3">
            <Link href="/privacy" className="hover:text-white transition-colors duration-200">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors duration-200">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}