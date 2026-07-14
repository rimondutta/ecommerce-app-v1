"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ProductGridNike from "@/components/ui/product-grid-nike";
import { ChevronLeft, ChevronRight } from "lucide-react";
import dynamic from "next/dynamic";

const DynamicServicesStrip = dynamic(() => import("./HomepageSections").then((mod) => mod.ServicesStrip), { ssr: true });
const DynamicInstagramSection = dynamic(() => import("./InstagramSection"), { ssr: false });
const HeroSlider = dynamic(() => import("./HeroSlider"), { ssr: false });

interface Product {
  _id: string;
  title: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  images: { url: string; alt?: string }[];
  badge?: string;
  ageRange?: string;
  rating?: number;
  reviewCount?: number;
}

interface Category {
  name: string;
  slug: string;
  image: string;
}

/* ─── Countdown Timer Hook ─── */
function useCountdown(targetDays: number, targetHours: number, targetMinutes: number, targetSeconds: number) {
  const [timeLeft, setTimeLeft] = useState({
    days: targetDays,
    hours: targetHours,
    minutes: targetMinutes,
    seconds: targetSeconds,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const { days, hours, minutes, seconds } = prev;
        if (days === 0 && hours === 0 && minutes === 0 && seconds === 0) {
          clearInterval(timer);
          return prev;
        }
        let s = seconds - 1, m = minutes, h = hours, d = days;
        if (s < 0) { s = 59; m -= 1; }
        if (m < 0) { m = 59; h -= 1; }
        if (h < 0) { h = 23; d -= 1; }
        return { days: d, hours: h, minutes: m, seconds: s };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return timeLeft;
}

function pad(n: number) { return String(n).padStart(2, "0"); }

/* ─── Animated Underline Link ─── */
function UnderlineLink({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <Link href={href} className={`relative inline-block text-current no-underline group ${className}`}>
      {children}
      <span className="absolute left-0 -bottom-1 w-3/4 h-[2px] bg-current transition-[width] duration-200 ease-in-out group-hover:w-full" />
    </Link>
  );
}

/* ─── Red-accent label (like "New Trend" / "Deal of the Week") ─── */
function AccentLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="relative pl-12 text-[#c22928] uppercase font-medium tracking-wide text-sm before:content-[''] before:block before:w-9 before:h-[2px] before:bg-[#c22928] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2">
      {children}
    </p>
  );
}

/* ─── Collection Bento Tile ─── */
function CollectionTile({
  image,
  label,
  title,
  href,
  className = "",
}: {
  image: string;
  label?: string;
  title: React.ReactNode;
  href: string;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden group flex flex-col justify-end p-6 bg-[#eff0f1] ${className}`}
      style={
        image
          ? {
            backgroundImage: `url(${image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }
          : {}
      }
    >
      {/* Gradient overlay for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
      <div className="relative z-10">
        {label && (
          <p className="uppercase text-white/80 text-xs font-medium tracking-wider mb-1">{label}</p>
        )}
        <h3 className="text-white uppercase text-xl md:text-2xl font-medium leading-tight mb-3">{title}</h3>
        <UnderlineLink href={href} className="text-white uppercase text-xs font-medium tracking-wider">
          Shop Now
        </UnderlineLink>
      </div>
    </div>
  );
}

export default function Homepage({
  initialTrendingProducts = [],
  initialCategories = []
}: {
  initialTrendingProducts?: Product[],
  initialCategories?: Category[]
}) {
  const [trendingProducts, setTrendingProducts] = useState<any[]>(initialTrendingProducts);
  const [categories, setCategories] = useState<Category[]>(initialCategories);

  // Fallback to client fetching only if no initial data provided (e.g., if used elsewhere)
  useEffect(() => {
    if (initialTrendingProducts.length === 0) {
      fetch('/api/store/products?limit=4')
        .then(res => res.json())
        .then(data => setTrendingProducts(data.products || []))
        .catch(err => console.error(err));
    }
    if (initialCategories.length === 0) {
      fetch('/api/store/categories')
        .then(res => res.json())
        .then(data => { if (data.categories) setCategories(data.categories); })
        .catch(err => console.error(err));
    }
  }, [initialTrendingProducts, initialCategories]);

  // ─── Deal Countdown ───
  const timeLeft = useCountdown(12, 8, 45, 0);

  return (
    <div className="bg-white min-h-screen font-sans">

      {/* ═══════════════════════════════════════════
          1. HERO SECTION — SLIDER
          ═══════════════════════════════════════════ */}
      <HeroSlider />

      {/* ═══════════════════════════════════════════
          2. COLLECTIONS BENTO GRID (Dynamic)
          ═══════════════════════════════════════════ */}
      {categories.length > 0 && (
        <section className="px-4 sm:px-10 lg:px-40 my-16 md:my-24">
          <div className={`grid grid-cols-1 ${categories.length > 1 ? 'md:grid-cols-2' : ''} gap-6 md:h-[480px]`}>
            {/* 1st Category */}
            <CollectionTile
              image={categories[0].image || "/images/hero-banner-4.jpeg"}
              label="Collection"
              title={<span className="font-bold">{categories[0].name}</span>}
              href={`/products?category=${categories[0].slug}`}
              className={categories.length > 1 ? "md:h-full h-56" : "h-96"}
            />

            {/* Right side if more than 1 category */}
            {categories.length > 1 && (
              <div className={`grid ${categories.length > 2 ? 'grid-rows-2' : 'grid-rows-1'} gap-6`}>
                {/* 2nd Category */}
                <CollectionTile
                  image={categories[1].image || "/images/hero-banner-4.jpeg"}
                  label="Collection"
                  title={<span className="font-bold">{categories[1].name}</span>}
                  href={`/products?category=${categories[1].slug}`}
                  className={categories.length === 2 ? "h-full" : ""}
                />

                {/* 3rd and 4th Categories if exist */}
                {categories.length > 2 && (
                  <div className={`grid ${categories.length > 3 ? 'grid-cols-2' : 'grid-cols-1'} gap-6`}>
                    <CollectionTile
                      image={categories[2].image || "/images/hero-banner-4.jpeg"}
                      label="Collection"
                      title={<span className="font-bold">{categories[2].name}</span>}
                      href={`/products?category=${categories[2].slug}`}
                      className="h-36 md:h-auto"
                    />

                    {categories[3] && (
                      <CollectionTile
                        image={categories[3].image || "/images/hero-banner-4.jpeg"}
                        label="Collection"
                        title={<span className="font-bold">{categories[3].name}</span>}
                        href={`/products?category=${categories[3].slug}`}
                        className="h-36 md:h-auto"
                      />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════
          3. OUR TRENDY PRODUCTS — ProductGridNike
             Data stays wired to real API exactly as-is
          ═══════════════════════════════════════════ */}
      <section className="px-4 sm:px-10 lg:px-40 mb-16 md:mb-24">
        {/* Section header styled like reference */}
        <div className="text-center mb-10">
          <h2 className="uppercase text-2xl md:text-[35px] font-medium text-black">
            Our Trendy <span className="font-bold">Products</span>
          </h2>
        </div>
        <ProductGridNike
          title={undefined}
          viewAllLink="/products"
          products={trendingProducts}
          theme="light"
        />
      </section>



      {/* ═══════════════════════════════════════════
          4. INSTAGRAM SECTION (LAZY LOADED)
          ═══════════════════════════════════════════ */}
      <DynamicInstagramSection />



      {/* ═══════════════════════════════════════════
          6. SERVICES STRIP (LAZY LOADED)
          ═══════════════════════════════════════════ */}
      <DynamicServicesStrip />

    </div>
  );
}