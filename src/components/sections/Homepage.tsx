"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import CategorySection from "@/components/ui/category-section";
import ProductGridNike from "@/components/ui/product-grid-nike";

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

export default function Homepage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch('/api/store/products?limit=4')
      .then(res => res.json())
      .then(data => {
        setTrendingProducts(data.products || []);
      })
      .catch(err => console.error("Error fetching homepage products:", err));

    fetch('/api/store/categories')
      .then(res => res.json())
      .then(data => {
        if (data.categories) setCategories(data.categories);
      })
      .catch(err => console.error("Error fetching homepage categories:", err));
  }, []);

  return (
    <div className="bg-white min-h-screen pb-12">

      {/* 1. Full-Width Hero Banner */}
      <div className="w-full overflow-hidden">
        <Link
          href="/products?badge=New"
          className="block relative w-full aspect-[16/9] md:aspect-[21/9] lg:aspect-[21/7] xl:aspect-[21/6] overflow-hidden group"
        >
          <Image
            src="/images/hero-banner-4.jpeg"
            alt="Summer Fun Banner"
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
            priority
          />
        </Link>
      </div>

      {/* 2. Category Section */}
      <div className="px-6 md:px-12 max-w-[1440px] mx-auto py-16 md:py-24">
        <CategorySection categories={categories} />
      </div>

      {/* 3. Trending Product Grid */}
      <div className="px-6 md:px-12 max-w-[1440px] mx-auto pb-16 md:pb-24">
        <ProductGridNike
          title={<span className="text-neutral-950 font-bold">Our Top Product</span>}
          viewAllLink="/products"
          products={trendingProducts}
        />
      </div>

    </div>
  );
}