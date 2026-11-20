"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import HeroBanner from "./HeroBanner";
import CategorySection from "./CategorySection";
import dynamic from "next/dynamic";
const DynamicBestSellingSection = dynamic(() => import("./BestSellingSection"), { ssr: false });
const DynamicTrendingProductsSection = dynamic(() => import("./TrendingProductsSection"), { ssr: false });
const DynamicDiscountSection = dynamic(() => import("./DiscountSection"), { ssr: false });
const DynamicFreeDeliverySection = dynamic(() => import("./FreeDeliverySection"), { ssr: false });
const DynamicAppDownloadSection = dynamic(() => import("./AppDownloadSection"));
import AnimatedReveal from "@/components/ui/AnimatedReveal";
import { ArrowRight } from "lucide-react";

const DynamicInstagramSection = dynamic(() => import("./InstagramSection"), { ssr: false });


interface Product {
  _id: string; title: string; slug: string; price: number;
  compareAtPrice?: number; images: { url: string; alt?: string }[];
  badge?: string; ageRange?: string; rating?: number; reviewCount?: number;
}
interface Category { name: string; slug: string; image: string; }
interface BlogPreview {
  _id: string | { toString(): string };
  title: string;
  slug: string;
  category?: string;
  excerpt?: string;
  publishedAt?: string | Date;
  createdAt?: string | Date;
  featuredImage?: { url?: string; alt?: string };
}

export default function Homepage({
  initialTrendingProducts = [],
  initialCategories = [],
  initialBlogs = [],
  initialSpecialOfferProducts = [],
  initialBestsellingProducts = [],
  initialDiscountProducts = [],
  initialFreeDeliveryProducts = [],
}: {
  initialTrendingProducts?: Product[];
  initialCategories?: Category[];
  initialBlogs?: BlogPreview[];
  initialSpecialOfferProducts?: Product[];
  initialBestsellingProducts?: Product[];
  initialDiscountProducts?: Product[];
  initialFreeDeliveryProducts?: Product[];
}) {
  const [trendingProducts] = useState(initialTrendingProducts);
  const [categories] = useState<Category[]>(initialCategories);
  const [blogs] = useState<BlogPreview[]>(initialBlogs);
  const [specialOfferProducts] = useState<Product[]>(initialSpecialOfferProducts);
  const [bestsellingProducts] = useState<Product[]>(initialBestsellingProducts);
  const [discountProducts] = useState<Product[]>(initialDiscountProducts);
  const [freeDeliveryProducts] = useState<Product[]>(initialFreeDeliveryProducts);

  return (
    <div className="bg-white min-h-screen font-body" suppressHydrationWarning>

      {/* ═══════════════════════════════════════════════
          HERO BANNER — 100% Matching Reference UI
          ═══════════════════════════════════════════════ */}
      <HeroBanner />

      {/* ═══════════════════════════════════════════════
          SHOP BY CATEGORY & TRUST BAR — 100% Dynamic Admin Controlled
          ═══════════════════════════════════════════════ */}
      <CategorySection initialCategories={categories} />

      {/* ═══════════════════════════════════════════════
          BEST SELLING TOYS — Admin controlled via 'bestselling' tag
          ═══════════════════════════════════════════════ */}
      <DynamicBestSellingSection initialProducts={bestsellingProducts} />

      {/* ═══════════════════════════════════════════════
          TRENDING PRODUCTS — Matching Reference UI
          ═══════════════════════════════════════════════ */}
      <DynamicTrendingProductsSection products={trendingProducts} />

      {/* ═══════════════════════════════════════════════
          DISCOUNT DEALS — Admin controlled via 'discount' tag
          ═══════════════════════════════════════════════ */}
      <DynamicDiscountSection initialProducts={discountProducts} />

      {/* ═══════════════════════════════════════════════
          FREE DELIVERY PRODUCTS — Admin controlled via 'freedelivery' tag
          ═══════════════════════════════════════════════ */}
      <DynamicFreeDeliverySection initialProducts={freeDeliveryProducts} />


      {/* ═══════════════════════════════════════════════
          LATEST EDITORIALS (BLOG)
          ═══════════════════════════════════════════════ */}
      {blogs.length > 0 && (
        <section className="px-4 sm:px-8 lg:px-[5vw] py-16 md:py-24 bg-[#F5F5F5]">
          <AnimatedReveal className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500 mb-3">Editorial</p>
              <h2 className="font-serif font-light text-4xl md:text-5xl text-black tracking-tight">
                Latest Articles
              </h2>
            </div>
            <Link
              href="/blogs"
              className="hidden md:flex items-center justify-center bg-[#D5AEFD] text-black font-body font-bold text-sm uppercase tracking-widest px-8 py-3 hover:bg-[#D5AEFD]/90 transition-colors"
            >
              Explore All
            </Link>
          </AnimatedReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((post) => (
              <AnimatedReveal key={String(post._id)} className="group cursor-pointer flex flex-col gap-5">
                <div className="w-full aspect-[4/3] relative overflow-hidden bg-zinc-200">
                  <Link href={`/blogs/${post.slug}`} className="block w-full h-full">
                    {post.featuredImage?.url ? (
                      <Image
                        src={post.featuredImage.url}
                        alt={post.featuredImage.alt || post.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                    ) : null}
                  </Link>
                </div>
                
                <div className="flex flex-col gap-3 pr-4">
                  <div className="flex items-center gap-4 text-xs font-mono uppercase tracking-widest text-zinc-500">
                    <span>{post.category || 'Editorial'}</span>
                    <span className="w-1 h-1 rounded-full bg-zinc-300" />
                    <span>
                      {new Date(post.publishedAt || post.createdAt || 0).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <Link href={`/blogs/${post.slug}`}>
                    <h3 className="font-serif text-xl sm:text-2xl text-black leading-snug group-hover:text-[#D5AEFD] transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                  </Link>
                  <p className="font-body text-sm font-light text-zinc-600 line-clamp-2 leading-relaxed">
                    {post.excerpt}
                  </p>
                  <Link href={`/blogs/${post.slug}`} className="inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-black mt-2 hover:text-[#043224] transition-colors w-max border-b border-black/20 hover:border-black pb-1">
                    Read Story <ArrowRight size={14} />
                  </Link>
                </div>
              </AnimatedReveal>
            ))}
          </div>
          
          <div className="mt-12 flex justify-center md:hidden">
            <Link
              href="/blogs"
              className="w-full flex items-center justify-center bg-[#D5AEFD] text-black font-body font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-[#D5AEFD]/90 transition-colors"
            >
              Explore All
            </Link>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════
          APP DOWNLOAD
          ═══════════════════════════════════════════════ */}
      <DynamicAppDownloadSection />

      {/* Instagram — lazy loaded */}
      <DynamicInstagramSection />

    </div>
  );
}