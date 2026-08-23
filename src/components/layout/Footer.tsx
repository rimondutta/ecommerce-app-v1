"use client";

import React from "react";
import Link from "next/link";
import { IconBrandFacebook, IconBrandX, IconBrandInstagram, IconBrandYoutube } from "@tabler/icons-react";

const companyLinks = ["About Us", "Blog", "Contact Us", "Download App"];
const shopLinks = ["New Arrivals", "All Toys", "Sale"];
const helpLinks = ["Customer Service", "My Account", "Returns", "Legal & Privacy"];

export default function Footer() {
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Subscribed Successfully");
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="bg-paper-grey mt-24">

      {/* Main grid */}
      <div className="px-4 sm:px-10 lg:px-[5vw] py-16 md:py-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">

        {/* Brand column */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          <Link href="/" className="font-display text-4xl text-ink-black leading-none tracking-tight">
            Toyhourse
          </Link>
          <p className="font-body text-sm text-gray-600 leading-relaxed max-w-[280px]">
            Beautifully curated toys designed to inspire imagination, creativity, and learning.
          </p>
          <div className="text-sm font-body text-gray-600 flex flex-col gap-2 mt-2">
            <span>Chattogram, Bangladesh</span>
            <a href="mailto:toyhourse@gmail.com" className="hover:text-stamp-red transition-colors font-medium text-ink-black">toyhourse@gmail.com</a>
            <a href="tel:+8801616921965" className="hover:text-stamp-red transition-colors font-medium text-ink-black">+880 1616-921965</a>
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
                className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-ink-black hover:bg-ink-black hover:text-white transition-all duration-300 shadow-sm"
              >
                <Icon size={18} stroke={1.5} />
              </a>
            ))}
          </div>
        </div>

        {/* Company */}
        <div className="flex flex-col gap-5">
          <h5 className="font-body text-base font-semibold text-ink-black">Company</h5>
          <ul className="flex flex-col gap-3">
            {companyLinks.map((item) => (
              <li key={item}>
                <Link
                  href={item === "Download App" ? "/download" : item.toLowerCase().includes("blog") ? "/blogs" : "#"}
                  onClick={scrollToTop}
                  className="font-body text-sm text-gray-600 hover:text-stamp-red transition-colors inline-block"
                >
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Shop */}
        <div className="flex flex-col gap-5">
          <h5 className="font-body text-base font-semibold text-ink-black">Shop</h5>
          <ul className="flex flex-col gap-3">
            {shopLinks.map((item) => (
              <li key={item}>
                <Link
                  href="/products"
                  onClick={scrollToTop}
                  className="font-body text-sm text-gray-600 hover:text-stamp-red transition-colors inline-block"
                >
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Help + Subscribe */}
        <div className="flex flex-col gap-5">
          <h5 className="font-body text-base font-semibold text-ink-black">Help</h5>
          <ul className="flex flex-col gap-3 mb-6">
            {helpLinks.map((item) => (
              <li key={item}>
                <Link href="#" className="font-body text-sm text-gray-600 hover:text-stamp-red transition-colors inline-block">
                  {item}
                </Link>
              </li>
            ))}
          </ul>

          {/* Newsletter — modern pill form */}
          <h5 className="font-body text-base font-semibold text-ink-black mt-2">Newsletter</h5>
          <form onSubmit={handleSubscribe} className="flex bg-white rounded-full p-1.5 border border-gray-200 shadow-sm mt-1">
            <input
              type="email"
              placeholder="your@email.com"
              required
              className="flex-1 px-4 py-2 bg-transparent text-ink-black font-body text-sm outline-none border-none placeholder:text-gray-400"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-stamp-red text-white font-body text-sm font-medium rounded-full hover:bg-stamp-red/90 transition-colors"
            >
              Join
            </button>
          </form>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-200 px-4 sm:px-10 lg:px-[5vw] py-6 flex flex-wrap justify-between items-center gap-4">
        <p className="font-body text-sm text-gray-500">
          © {new Date().getFullYear()} Toyhourse. All Rights Reserved.
        </p>
        <a
          href="https://facebook.com/dutta.rimon/"
          className="font-body text-sm font-medium text-stamp-red hover:opacity-70 transition-opacity"
        >
          Developed by Rimon Dutta
        </a>
      </div>
    </footer>
  );
}