"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { 
  SlidersHorizontal, 
  ChevronRight, 
  Search, 
  X,
  Plus,
  ArrowUpRight,
} from 'lucide-react';
import ProductCard from '@/components/ui/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';

// Define the Product interface
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

// Categories for filter
const categories = ["All", "Outerwear", "Footwear", "Accessories", "Tops", "Bottoms"];
const sortOptions = [
  { name: 'Featured', value: 'featured' },
  { name: 'Newest', value: 'newest' },
  { name: 'Price: Low to High', value: 'price_asc' },
  { name: 'Price: High to Low', value: 'price_desc' },
];

function ShopContent() {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeSort, setActiveSort] = useState("featured");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 200);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Filter products
  const filteredProducts = products.filter(product => {
    if (activeCategory === "All") return true;
    return product.category?.name === activeCategory;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (activeSort === 'price_asc') return a.price - b.price;
    if (activeSort === 'price_desc') return b.price - a.price;
    return 0;
  });

  const clearFilters = () => {
    setActiveCategory("All");
    setActiveSort("featured");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="w-12 h-12 border-4 border-zinc-100 border-t-zinc-900 rounded-full animate-spin" />
        <span className="text-sm font-bold text-zinc-400 uppercase tracking-widest animate-pulse">Refining Collection...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col pb-20 relative bg-zinc-50">
      {/* Header Section */}
      <section className="bg-white px-6 md:px-16 pt-32 pb-16 md:pb-24 rounded-b-[3rem] shadow-soft">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-10">
            <div className="flex items-center gap-3 text-zinc-400">
              <Link href="/" className="hover:text-zinc-900 transition-colors text-xs font-bold uppercase tracking-widest">Home</Link>
              <ChevronRight size={14} />
              <span className="text-zinc-900 font-bold text-xs uppercase tracking-widest">Shop All</span>
            </div>
            
            <div className="flex flex-col md:flex-row justify-between items-end gap-8">
              <div className="max-w-2xl">
                <h1 className="text-5xl md:text-7xl font-display font-bold text-zinc-900 tracking-tight leading-none mb-6">
                  Discover Our <br/>
                  <span className="text-zinc-300">New Essentials</span>
                </h1>
                <p className="text-zinc-500 text-lg md:text-xl font-medium leading-relaxed">
                  Carefully crafted garments for the modern explorer. Melding performance with timeless aesthetics.
                </p>
              </div>
              <div className="flex items-center gap-2 p-1.5 bg-zinc-100 rounded-full">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-zinc-900 shadow-sm font-bold text-xs">
                  {sortedProducts.length}
                </div>
                <span className="pr-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Items Found</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto w-full px-6 md:px-16 relative z-10 flex flex-col gap-16 mt-16">

        {/* PROMO BANNER */}
        <section className="relative bg-zinc-900 text-white p-8 md:p-12 rounded-[2.5rem] overflow-hidden shadow-soft-2xl group">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:scale-110 transition-transform duration-1000" />
            <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
              <div className="text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/80 text-[10px] font-bold uppercase tracking-widest mb-4">
                  <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
                  Seasonal Perk
                </div>
                <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tight mb-2">Complimentary Shipping</h2>
                <p className="text-zinc-400 text-sm font-medium">On all orders above ৳1,000. Limited time luxury experience.</p>
              </div>
              <Link 
                href="/shop"
                className="group flex items-center gap-3 px-8 py-4 bg-white text-zinc-900 rounded-full font-bold text-sm hover:bg-zinc-100 transition-all shadow-soft"
              >
                Shop Latest
                <ArrowUpRight size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>
        </section>

        {/* SHOP CONTROLS */}
        <section className={`flex flex-wrap items-center justify-between gap-6 pb-2`}>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2 font-bold text-sm bg-white px-6 py-3 rounded-full border border-zinc-200 hover:border-zinc-300 transition-all shadow-soft"
            >
              <SlidersHorizontal size={16} /> Filters
            </button>
            
            {/* Desktop Filters */}
            <div className="hidden lg:flex items-center gap-2 p-1.5 bg-white border border-zinc-100 rounded-full shadow-soft">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-2.5 text-xs font-bold uppercase tracking-widest rounded-full transition-all ${
                    activeCategory === cat ? 'bg-zinc-900 text-white shadow-soft-xl' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-full border border-zinc-100 shadow-soft">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Sort:</span>
              <select 
                value={activeSort}
                onChange={(e) => setActiveSort(e.target.value)}
                className="bg-transparent border-none text-xs font-bold text-zinc-900 p-0 focus:ring-0 cursor-pointer pr-8"
              >
                {sortOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.name}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* PRODUCT GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12 md:gap-x-10 md:gap-y-16">
          <AnimatePresence mode="popLayout">
            {sortedProducts.map((product, idx) => (
              <motion.div
                key={product._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <ProductCard product={product} index={idx} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {sortedProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 px-6 bg-white rounded-[3rem] border border-zinc-100 shadow-soft">
            <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-200 mb-8">
              <Search size={40} />
            </div>
            <h3 className="text-2xl font-display font-bold text-zinc-900 mb-2">No matching products</h3>
            <p className="text-zinc-500 text-center max-w-sm mb-10">We couldn't find any items matching your current filters. Try broadening your search.</p>
            <button 
              onClick={clearFilters}
              className="flex items-center gap-2 px-10 py-4 bg-zinc-900 text-white rounded-full font-bold text-sm hover:bg-zinc-800 transition-all shadow-soft-xl"
            >
              Reset Filters
              <X size={16} />
            </button>
          </div>
        )}
      </div>

      {/* MOBILE FILTERS DRAWER */}
      <AnimatePresence>
        {isMobileFiltersOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFiltersOpen(false)}
              className="fixed inset-0 z-[600] bg-zinc-900/40 backdrop-blur-md lg:hidden"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-[85%] max-w-sm h-full bg-white shadow-soft-2xl z-[700] rounded-l-[2.5rem] lg:hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-8 border-b border-zinc-100">
                <h2 className="text-2xl font-display font-bold text-zinc-900">Filters</h2>
                <button 
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-50 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-10">
                <div className="flex flex-col gap-6">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">By Category</span>
                  <div className="flex flex-col gap-3">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          setActiveCategory(cat);
                          setIsMobileFiltersOpen(false);
                        }}
                        className={`w-full px-6 py-4 text-sm font-bold rounded-2xl text-left transition-all ${
                          activeCategory === cat ? 'bg-zinc-900 text-white shadow-soft-xl' : 'bg-zinc-50 text-zinc-600 hover:bg-zinc-100'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="p-8 border-t border-zinc-100">
                <button 
                  onClick={() => {
                    clearFilters();
                    setIsMobileFiltersOpen(false);
                  }}
                  className="w-full py-4 text-sm font-bold text-zinc-400 hover:text-zinc-900 transition-all flex items-center justify-center gap-2"
                >
                  Clear all filters
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen gap-6">
        <div className="w-12 h-12 border-4 border-zinc-100 border-t-zinc-900 rounded-full animate-spin" />
        <span className="text-sm font-bold text-zinc-400 uppercase tracking-widest animate-pulse">Initializing Boutique...</span>
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
