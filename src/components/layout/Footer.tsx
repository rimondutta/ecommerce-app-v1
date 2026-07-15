"use client";

import React from "react";
import Link from "next/link";
import { IconBrandFacebook, IconBrandX, IconBrandInstagram, IconBrandYoutube } from "@tabler/icons-react";

const companyLinks = ["About Us", "Blog", "Contact Us"];
const shopLinks = ["New Arrivals", "All Toys", "Sale"];
const helpLinks = ["Customer Service", "My Account", "Returns", "Legal & Privacy"];

export default function Footer() {
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Subscribed Successfully");
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="bg-paper-grey border-t border-rule-grey mt-24 section-light">

      {/* Top rule */}
      <div className="h-[1px] bg-rule-grey w-full" />

      {/* Main grid */}
      <div className="px-4 sm:px-10 lg:px-[5vw] py-16 md:py-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">

        {/* Brand column */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          <Link href="/" className="font-display text-[28px] uppercase tracking-[-0.02em] text-ink-black leading-none">
            TOYHOURSE
          </Link>
          <p className="font-body text-[13px] text-ink-black leading-relaxed max-w-[280px]">
            A design museum's catalog of toys — curated for curious kids aged 0–10.
          </p>
          <div className="text-[13px] font-mono text-ink-black flex flex-col gap-1">
            <span>Chattogram, Bangladesh</span>
            <a href="mailto:toyhourse@gmail.com" className="hover:text-rule-grey transition-colors">toyhourse@gmail.com</a>
            <a href="tel:+8801767968446" className="hover:text-rule-grey transition-colors">+880 1767-968446</a>
          </div>
          <div className="flex gap-5 mt-1">
            {[
              { Icon: IconBrandFacebook, href: "https://facebook.com/toyhourse", label: "Facebook" },
              { Icon: IconBrandX, href: "https://x.com/toyhourse", label: "X" },
              { Icon: IconBrandInstagram, href: "https://instagram.com/toyhourse", label: "Instagram" },
              { Icon: IconBrandYoutube, href: "https://youtube.com/toyhourse", label: "YouTube" },
            ].map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="text-ink-black hover:text-rule-grey transition-colors"
              >
                <Icon size={18} stroke={1.5} />
              </a>
            ))}
          </div>
        </div>

        {/* Company */}
        <div className="flex flex-col gap-4">
          <h5 className="font-mono text-[10px] uppercase tracking-[0.12em] text-rule-grey">Company</h5>
          <ul className="flex flex-col gap-3">
            {companyLinks.map((item) => (
              <li key={item}>
                <Link
                  href={item.toLowerCase().includes("blog") ? "/blogs" : "#"}
                  onClick={scrollToTop}
                  className="font-body text-[13px] text-ink-black relative group inline-block"
                >
                  {item}
                  <span className="absolute -bottom-0.5 left-0 w-0 h-[1px] bg-ink-black transition-[width] duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:w-full" />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Shop */}
        <div className="flex flex-col gap-4">
          <h5 className="font-mono text-[10px] uppercase tracking-[0.12em] text-rule-grey">Shop</h5>
          <ul className="flex flex-col gap-3">
            {shopLinks.map((item) => (
              <li key={item}>
                <Link
                  href="/products"
                  onClick={scrollToTop}
                  className="font-body text-[13px] text-ink-black relative group inline-block"
                >
                  {item}
                  <span className="absolute -bottom-0.5 left-0 w-0 h-[1px] bg-ink-black transition-[width] duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:w-full" />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Help + Subscribe */}
        <div className="flex flex-col gap-4">
          <h5 className="font-mono text-[10px] uppercase tracking-[0.12em] text-rule-grey">Help</h5>
          <ul className="flex flex-col gap-3 mb-6">
            {helpLinks.map((item) => (
              <li key={item}>
                <Link href="#" className="font-body text-[13px] text-ink-black relative group inline-block">
                  {item}
                  <span className="absolute -bottom-0.5 left-0 w-0 h-[1px] bg-ink-black transition-[width] duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:w-full" />
                </Link>
              </li>
            ))}
          </ul>

          {/* Newsletter — flat catalog style */}
          <h5 className="font-mono text-[10px] uppercase tracking-[0.12em] text-rule-grey">Newsletter</h5>
          <form onSubmit={handleSubscribe} className="flex border border-rule-grey">
            <input
              type="email"
              placeholder="your@email.com"
              required
              className="flex-1 px-3 py-2.5 bg-paper-white text-ink-black font-mono text-[12px] outline-none border-none placeholder:text-rule-grey"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-ink-black text-paper-white font-mono text-[10px] uppercase tracking-[0.1em] whitespace-nowrap hover:bg-rule-grey hover:text-ink-black transition-colors"
            >
              Join
            </button>
          </form>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-rule-grey px-4 sm:px-10 lg:px-[5vw] py-5 flex flex-wrap justify-between items-center gap-3">
        <p className="font-mono text-[11px] text-rule-grey uppercase tracking-[0.08em]">
          © {new Date().getFullYear()} TOYHOURSE. All Rights Reserved.
        </p>
        <a
          href="#"
          className="font-mono text-[11px] text-stamp-red uppercase tracking-[0.08em] hover:opacity-70 transition-opacity"
        >
          Developed by Rimon Dutta
        </a>
      </div>
    </footer>
  );
}