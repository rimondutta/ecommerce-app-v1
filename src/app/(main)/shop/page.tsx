"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import MinimalProductCard from '@/components/ui/MinimalProductCard';
import { X, Plus } from 'lucide-react';

interface ProductType {
  _id: string;
  title: string;
  slug: string;
  price: number;
  category: {
    name: string;
    slug: string;
  };
  images: { url: string; alt?: string }[];
  badge?: string;
  colors?: { name: string; hex?: string }[];
  sizes?: string[];
}

function ShopContent() {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/store/products');
        const data = await res.json();
        setProducts(data.products || []);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 bg-white">
        <div className="w-8 h-8 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col pb-32 bg-white pt-24 font-sans">
      <div className="max-w-[1600px] mx-auto w-full px-6 md:px-12">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-[10px] md:text-[11px] text-zinc-500 uppercase tracking-widest mb-12">
          <Link href="/shop" className="hover:text-zinc-900 transition-colors">Women</Link>
          <span>→</span>
          <Link href="/shop" className="hover:text-zinc-900 transition-colors">Clothes</Link>
          <span>→</span>
          <span className="text-zinc-900 font-bold">Tops</span>
        </div>

        {/* Page Header */}
        <div className="flex items-start mb-8">
          <h1 className="text-4xl md:text-[56px] font-normal text-zinc-900 uppercase tracking-tight leading-none">
            Women's Tops
          </h1>
          <sup className="text-sm md:text-base font-medium text-zinc-900 ml-2 mt-2">{products.length || 139}</sup>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-4 border-b border-zinc-200 mb-12">
          
          <div className="flex items-center gap-4 flex-wrap">
            {/* Filter Button */}
            <button className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider hover:bg-zinc-800 transition-colors">
              Filters <span className="bg-white text-zinc-900 w-4 h-4 rounded-full flex items-center justify-center text-[9px]">3</span>
            </button>
            
            <div className="h-4 w-px bg-zinc-300 hidden md:block" />

            {/* Active Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <button className="flex items-center gap-1.5 border border-zinc-300 text-zinc-700 px-3 py-1.5 rounded-md text-[10px] md:text-[11px] font-medium uppercase tracking-wider hover:border-zinc-500 transition-colors">
                Tops <X size={12} className="text-zinc-400" />
              </button>
              <button className="flex items-center gap-1.5 border border-zinc-300 text-zinc-700 px-3 py-1.5 rounded-md text-[10px] md:text-[11px] font-medium uppercase tracking-wider hover:border-zinc-500 transition-colors">
                Size M <X size={12} className="text-zinc-400" />
              </button>
              <button className="flex items-center gap-1.5 border border-zinc-300 text-zinc-700 px-3 py-1.5 rounded-md text-[10px] md:text-[11px] font-medium uppercase tracking-wider hover:border-zinc-500 transition-colors">
                $300 - $720 <X size={12} className="text-zinc-400" />
              </button>
            </div>
          </div>

          {/* Sort By */}
          <button className="flex items-center gap-2 border border-zinc-300 text-zinc-700 px-4 py-1.5 rounded-md text-[10px] md:text-[11px] font-medium uppercase tracking-wider hover:border-zinc-500 transition-colors">
            Sort By <Plus size={14} className="text-zinc-400" />
          </button>
          
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-16">
          {products.length > 0 ? (
            products.map((product, idx) => (
              <MinimalProductCard key={product._id} product={product} index={idx} />
            ))
          ) : (
            // Mock empty state mapping to show *something* if DB is empty
            [1, 2, 3, 4].map((_, idx) => (
              <div key={idx} className="flex flex-col gap-2">
                 <div className="aspect-[3/4] bg-zinc-100 w-full animate-pulse" />
                 <div className="w-1/3 h-3 bg-zinc-100 animate-pulse mt-2" />
                 <div className="w-2/3 h-3 bg-zinc-100 animate-pulse" />
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="w-8 h-8 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
