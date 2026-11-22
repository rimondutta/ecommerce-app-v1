"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Truck,
  ShieldCheck,
  Headphones,
  RotateCcw,
} from "lucide-react";

export interface CategoryItem {
  _id?: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  isActive?: boolean;
}

const PRESET_IMAGES: Record<string, string> = {
  toys: "/images/categories/toys.webp",
  gadgets: "/images/categories/gadgets.webp",
  dolls: "/images/categories/dolls.webp",
  puzzles: "/images/categories/puzzles.webp",
  "toy-cars": "/images/categories/toy-cars.webp",
  "arts-crafts": "/images/categories/arts-crafts.webp",
  cosmetics: "/images/categories/cosmetics.webp",
  "gift-sets": "/images/categories/gift-sets.webp",
};

const defaultCategories: CategoryItem[] = [
  { name: "Toys", slug: "toys", image: "/images/categories/toys.webp" },
  { name: "Gadgets", slug: "gadgets", image: "/images/categories/gadgets.webp" },
  { name: "Dolls", slug: "dolls", image: "/images/categories/dolls.webp" },
  { name: "Puzzles", slug: "puzzles", image: "/images/categories/puzzles.webp" },
  { name: "Toy Cars", slug: "toy-cars", image: "/images/categories/toy-cars.webp" },
  { name: "Arts & Crafts", slug: "arts-crafts", image: "/images/categories/arts-crafts.webp" },
  { name: "Cosmetics", slug: "cosmetics", image: "/images/categories/cosmetics.webp" },
  { name: "Gift Sets", slug: "gift-sets", image: "/images/categories/gift-sets.webp" },
];

const trustFeatures = [
  {
    icon: Truck,
    title: "Fast Delivery",
    description: "Nationwide delivery across BD",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payment",
    description: "100% secure checkout",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "We're here to help",
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    description: "Hassle-free returns",
  },
];

export function getCategoryImage(cat: CategoryItem): string {
  if (cat.image && cat.image.trim()) return cat.image;
  const normalized = (cat.slug || cat.name || "").toLowerCase().trim();
  if (PRESET_IMAGES[normalized]) return PRESET_IMAGES[normalized];

  for (const [key, path] of Object.entries(PRESET_IMAGES)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return path;
    }
  }
  return "/images/categories/toys.png";
}

export default function CategorySection({
  initialCategories = [],
}: {
  initialCategories?: CategoryItem[];
}) {
  const [categories, setCategories] = useState<CategoryItem[]>(
    initialCategories.length > 0 ? initialCategories : defaultCategories
  );

  // Fallback client-side fetch only if initialCategories were not provided by SSR/ISR
  useEffect(() => {
    if (initialCategories.length > 0) return;
    let isMounted = true;
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data?.success && Array.isArray(data.data) && data.data.length > 0) {
          setCategories(data.data);
        }
      })
      .catch((err) => {
        console.warn("[CategorySection] Fetch error, using initial categories:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [initialCategories.length]);

  return (
    <>
      {/* ═══════════════════════════════════════════════
          Shop by Category — Reference UI Style
          ═══════════════════════════════════════════════ */}
      <section className="w-full bg-[#FDF8F0] py-10 sm:py-14 md:py-20 font-sans select-none">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">

          {/* ── Centered header with decorative lines (Reference UI) ── */}
          <div className="flex flex-col items-center mb-8 sm:mb-12 md:mb-14">
            <div className="flex items-center gap-2 xs:gap-3 sm:gap-4 mb-2">
              {/* Left decorative line */}
              <span className="hidden xs:block w-6 sm:w-16 md:w-20 h-[1.5px] bg-[#5428D8]/40" />
              <h2
                className="text-xl xs:text-2xl sm:text-3xl md:text-4xl text-[#2C2416] tracking-tight text-center font-serif font-semibold"
                style={{ fontFamily: "'Playfair Display', var(--font-playfair), Georgia, serif" }}
              >
                Shop by Category
              </h2>
              {/* Right decorative line */}
              <span className="hidden xs:block w-6 sm:w-16 md:w-20 h-[1.5px] bg-[#5428D8]/40" />
            </div>
            <p className="text-xs sm:text-sm md:text-base text-gray-500 font-normal text-center">
              Find the perfect piece for your style
            </p>
          </div>

          {/* ── Category circles ── */}
          <div className="flex flex-wrap justify-center gap-x-3 xs:gap-x-6 sm:gap-x-10 md:gap-x-12 lg:gap-x-14 gap-y-6 sm:gap-y-10">
            {categories.map((cat) => {
              const imageSrc = getCategoryImage(cat);
              const isPreset = imageSrc.startsWith("/images/categories/");
              return (
                <Link
                  key={cat._id || cat.slug}
                  href={`/products?category=${encodeURIComponent(cat.slug)}`}
                  className="group flex flex-col items-center gap-2.5 sm:gap-3.5 w-[95px] xs:w-[110px] sm:w-[145px] md:w-[165px]"
                >
                  {/* Large circle photo with warm aesthetic background */}
                  <div className="
                    relative w-[95px] h-[95px] xs:w-[110px] xs:h-[110px] sm:w-[140px] sm:h-[140px] md:w-[165px] md:h-[165px]
                    rounded-full overflow-hidden flex-shrink-0
                    bg-[#FAF7F2]
                    shadow-[0_4px_20px_rgba(0,0,0,0.06)]
                    group-hover:shadow-[0_8px_30px_rgba(84,40,216,0.22)]
                    group-hover:scale-[1.04]
                    transition-all duration-300 ease-out
                  ">
                    <Image
                      src={imageSrc}
                      alt={cat.name}
                      fill
                      sizes="(max-width: 640px) 110px, (max-width: 768px) 140px, 165px"
                      className={`${isPreset ? "object-contain p-3 sm:p-4" : "object-cover"} transition-transform duration-500 group-hover:scale-110`}
                    />
                    {/* Soft gradient sheen */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent pointer-events-none rounded-full" />
                  </div>

                  {/* Text block */}
                  <div className="flex flex-col items-center gap-0.5 sm:gap-1 text-center w-full px-1">
                    <span className="text-xs xs:text-sm sm:text-base md:text-lg font-bold text-[#2C2416] leading-tight line-clamp-1">
                      {cat.name}
                    </span>
                    <span className="text-[11px] sm:text-xs md:text-sm font-semibold text-[#5428D8] group-hover:text-[#431db8] transition-colors inline-flex items-center gap-1">
                      View All →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          Trust & Features Banner — Full Width
          ═══════════════════════════════════════════════ */}
      <section className="w-full bg-[#FBF4EB] border-y border-[#EDE4D8] py-5 sm:py-6 font-sans select-none shadow-2xs">
        <div className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 lg:gap-0 lg:divide-x lg:divide-purple-200/50">
            {trustFeatures.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="flex items-center gap-3.5 sm:gap-4 px-0 lg:px-6 xl:px-8 first:pl-2 last:pr-2 justify-start lg:justify-center"
                >
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white text-[#5428D8] shadow-xs flex items-center justify-center shrink-0 border border-[#EDE4D8]">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-[#5428D8]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm sm:text-base text-[#2C2416] leading-tight">{feat.title}</h4>
                    <p className="text-xs sm:text-sm text-[#7A6E62] font-normal mt-0.5">{feat.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
