"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  SlidersHorizontal, 
  ChevronRight, 
  Search, 
  X,
} from 'lucide-react';
import ProductCard from '@/components/ui/ProductCard';

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
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
        <span className="text-[12px] font-bold uppercase tracking-widest">Loading Collection...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col pb-20 relative bg-[#FAFAFA]">
      {/* Header Section */}
      <section className="bg-white border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="flex flex-col gap-6 md:gap-8">
            <div className="flex items-center gap-3 text-neutral-400">
              <Link href="/" className="hover:text-black transition-colors text-xs uppercase tracking-widest font-bold">Home</Link>
              <ChevronRight size={14} />
              <span className="text-black font-bold text-xs uppercase tracking-widest">Collections</span>
            </div>
            <div className="flex flex-col gap-4">
              <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-black uppercase leading-[0.9]">
                Our <span className="text-neutral-300">Catalog</span>
              </h1>
              <p className="text-neutral-500 max-w-2xl font-medium text-sm md:text-base leading-relaxed">
                Discover our latest collection of premium high-performance apparel, designed for utility, comfort, and modern style.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Grid Pattern Background */}
      <div 
        className="fixed inset-0 opacity-[0.03] pointer-events-none z-0" 
        style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '24px 24px' }} 
      />

      <div className="max-w-[1700px] mx-auto w-full px-6 md:px-12 relative z-10 flex flex-col gap-10 mt-10">

        {/* PROMO BANNER */}
        <section className="relative bg-black text-white p-8 md:p-12 overflow-hidden group shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="text-center md:text-left">
                <span className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase mb-4 block">Seasonal Offer</span>
                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-2">Free Shipping</h2>
                <p className="text-white/60 text-xs font-medium uppercase tracking-widest">On all orders above 1000 BDT // Limited Time Only</p>
              </div>
              <Link 
                href="/new-arrivals"
                className="px-8 py-4 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] hover:bg-neutral-200 transition-all"
              >
                View New Arrivals
              </Link>
            </div>
        </section>

        {/* SHOP CONTROLS */}
        <section className={`relative z-40 py-4 flex flex-wrap items-center justify-between gap-6 transition-all duration-500 ${isScrolled ? 'bg-white border-b border-black/5 px-6 -mx-6 md:px-12 md:-mx-12' : 'bg-transparent border-transparent'}`}>
          <div className="flex items-center gap-8">
            <button 
              onClick={() => setIsMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-3 font-black uppercase text-[10px] tracking-widest px-6 py-3 border-2 border-black hover:bg-black hover:text-white transition-all"
            >
              <SlidersHorizontal size={14} /> Filters
            </button>
            <div className="hidden lg:flex flex-col gap-1">
              <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-[0.4em]">Browse Collection</span>
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-black uppercase tracking-widest text-black">
                  {sortedProducts.length} Items Found
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Desktop Filters */}
            <div className="hidden lg:flex items-center bg-black/[0.03] p-1 rounded-sm">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-sm ${
                    activeCategory === cat ? 'bg-black text-white shadow-lg' : 'hover:bg-black/5 text-neutral-500'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="h-8 w-[1px] bg-black/10 hidden lg:block" />

            {/* Sort Options */}
            <div className="flex items-center gap-2">
              <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-widest hidden sm:block">Sort By:</span>
              <select 
                value={activeSort}
                onChange={(e) => setActiveSort(e.target.value)}
                className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest focus:ring-0 cursor-pointer pr-8"
              >
                {sortOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.name}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* PRODUCT GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12 md:gap-x-8 md:gap-y-16">
          {sortedProducts.map((product, idx) => (
            <div key={product._id} className="relative">
              <ProductCard product={product} index={idx} />
            </div>
          ))}
        </div>

        {/* Empty State */}
        {sortedProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-40 bg-neutral-50 border border-neutral-100">
            <Search size={40} className="text-neutral-200 mb-6" />
            <h3 className="text-xl font-black uppercase tracking-widest text-black">No matches found</h3>
            <p className="text-neutral-400 text-xs font-medium mt-2 uppercase tracking-widest">Try adjusting your filters or search terms</p>
            <button 
              onClick={clearFilters}
              className="mt-8 px-10 py-4 bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-neutral-800 transition-all shadow-xl"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* MOBILE FILTERS DRAWER */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-[600] bg-black/40 backdrop-blur-sm lg:hidden transition-all duration-500">
          <div className="absolute right-0 top-0 w-[85%] max-w-sm h-full bg-white shadow-2xl animate-in slide-in-from-right duration-500">
            <div className="flex flex-col h-full p-8">
              <div className="flex items-center justify-between mb-12">
                <h2 className="text-2xl font-black text-black uppercase tracking-tighter">Filters</h2>
                <button 
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="p-2 hover:bg-neutral-100 rounded-full transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex flex-col gap-10">
                <div className="flex flex-col gap-6">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.4em]">Categories</span>
                  <div className="flex flex-col gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          setActiveCategory(cat);
                          setIsMobileFiltersOpen(false);
                        }}
                        className={`px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-left transition-all ${
                          activeCategory === cat ? 'bg-black text-white' : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-auto">
                <button 
                  onClick={clearFilters}
                  className="w-full py-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:text-black transition-all"
                >
                  Reset All Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
        <span className="text-[10px] font-bold uppercase tracking-widest animate-pulse">Initializing Store...</span>
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
