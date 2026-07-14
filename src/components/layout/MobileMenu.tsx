"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useUIStore } from "@/store/uiStore";
import {
  X,
  ChevronRight,
  Home,
  Search,
  Heart,
  User,
  Sparkles,
  Package,
  Tag,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { label: "Home", href: "/", icon: Home, color: "#FFC93C" },
  { label: "Shop All Toys", href: "/products", icon: Search, color: "#4ECDC4" },
  { label: "New Arrivals", href: "/products?badge=New", icon: Sparkles, color: "#8B7FD6" },
  { label: "Sale", href: "/products?badge=Sale", icon: Tag, color: "#FF6B5D" },
  { label: "Wishlist", href: "/wishlist", icon: Heart, color: "#FF6B5D" },
  { label: "My Account", href: "/account", icon: User, color: "#4ECDC4" },
  { label: "Contact", href: "/contact", icon: Mail, color: "#FFC93C" },
];

const categories = [
  "Building & Construction",
  "Pretend Play",
  "Arts & Crafts",
  "Puzzles & Games",
  "Baby & Toddler",
];

export default function MobileMenu() {
  const { isMobileMenuOpen, closeMobileMenu } = useUIStore();

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/70 backdrop-blur-md z-[1000] transition-opacity duration-300",
          isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={closeMobileMenu}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 w-full max-w-sm z-[1001] transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col overflow-hidden",
          "bg-[#0A0A0A] border-r border-white/8",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Ambient glow */}
        <div
          className="pointer-events-none absolute top-0 left-0 w-64 h-64 rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, #FFC93C 0%, transparent 70%)",
          }}
        />

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between px-5 py-4 border-b border-white/8">
          <Link href="/" onClick={closeMobileMenu}>
            <Image
              src="/logo/toyhourse-logo.png"
              alt="Toy Hourse"
              width={120}
              height={40}
              className="h-9 w-auto object-contain"
            />
          </Link>
          <button
            onClick={closeMobileMenu}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/8 text-white/50 hover:text-white hover:bg-white/10 transition-all duration-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="relative z-10 flex-1 overflow-y-auto">
          {/* Main Links */}
          <div className="p-3 space-y-0.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className="flex items-center justify-between px-4 py-3.5 rounded-xl hover:bg-white/5 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        background: `${item.color}15`,
                        border: `1px solid ${item.color}20`,
                      }}
                    >
                      <Icon size={17} style={{ color: item.color }} strokeWidth={1.8} />
                    </div>
                    <span className="font-semibold text-[15px] text-white/70 group-hover:text-white transition-colors duration-200">
                      {item.label}
                    </span>
                  </div>
                  <ChevronRight
                    size={15}
                    className="text-white/15 group-hover:text-white/30 group-hover:translate-x-0.5 transition-all duration-200"
                  />
                </Link>
              );
            })}
          </div>

          {/* Divider */}
          <div className="h-px bg-white/5 mx-5 my-1" />

          {/* Categories */}
          <div className="p-5 pb-8">
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-3 px-1">
              Shop by Category
            </p>
            <div className="space-y-0.5">
              {categories.map((cat) => (
                <Link
                  key={cat}
                  href={`/products?category=${encodeURIComponent(cat)}`}
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-white/45 hover:text-white hover:bg-white/5 transition-all duration-200"
                >
                  <span className="w-1 h-1 rounded-full bg-white/20 shrink-0" />
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom strip */}
        <div className="relative z-10 border-t border-white/5 px-5 py-4">
          <p className="text-[11px] text-white/20 text-center">
            © {new Date().getFullYear()} Toy Hourse
          </p>
        </div>
      </div>
    </>
  );
}
