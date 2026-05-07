"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, X, ChevronDown, LayoutGrid, List } from "lucide-react";
import CartoonCard from "@/components/ui/CartoonCard";
import CartoonButton from "@/components/ui/CartoonButton";
import { CartoonBadge } from "@/components/ui/CartoonBadge";
import CartoonProductCard from "@/components/product/CartoonProductCard";
import ComicDivider from "@/components/ui/ComicDivider";
import { cn } from "@/lib/utils";

function ShopContent() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const categoryParam = searchParams.get("category");
  const colorsParam = searchParams.get("colors");
  const sizesParam = searchParams.get("sizes");
  const searchParam = searchParams.get("search");
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryParam);
  const [selectedColors, setSelectedColors] = useState<string[]>(colorsParam ? colorsParam.split(",") : []);
  const [selectedSizes, setSelectedSizes] = useState<string[]>(sizesParam ? sizesParam.split(",") : []);
  const [sortBy, setSortBy] = useState("featured");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  useEffect(() => {
    fetch("/api/store/products")
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setSelectedCategory(categoryParam);
    setSelectedColors(colorsParam ? colorsParam.split(",") : []);
    setSelectedSizes(sizesParam ? sizesParam.split(",") : []);
  }, [categoryParam, colorsParam, sizesParam]);

  const updateFilters = (key: string, value: string | null | string[]) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || (Array.isArray(value) && value.length === 0)) params.delete(key);
    else if (Array.isArray(value)) params.set(key, value.join(","));
    else params.set(key, value);
    router.push(`/products?${params.toString()}`, { scroll: false });
  };

  const categories = useMemo(() => {
    const m = new Map<string, string>();
    products.forEach((p: any) => { if (p.category?.name && p.category?.slug) m.set(p.category.slug, p.category.name); });
    return Array.from(m.entries()).map(([slug, name]) => ({ slug, name }));
  }, [products]);

  const allColors = useMemo(() => {
    const s = new Set<string>();
    products.forEach((p: any) => p.colors?.forEach((c: any) => s.add(c.name)));
    return Array.from(s);
  }, [products]);

  const allSizes = useMemo(() => {
    const s = new Set<string>();
    products.forEach((p: any) => p.sizes?.forEach((sz: string) => s.add(sz)));
    return Array.from(s).sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = products.filter((p: any) => {
      const catMatch = !selectedCategory || p.category?.slug === selectedCategory || p.category?.name === selectedCategory;
      const colorMatch = selectedColors.length === 0 || p.colors?.some((c: any) => selectedColors.includes(c.name));
      const sizeMatch = selectedSizes.length === 0 || p.sizes?.some((s: string) => selectedSizes.includes(s));
      const searchMatch = !searchParam || p.title.toLowerCase().includes(searchParam.toLowerCase());
      return catMatch && colorMatch && sizeMatch && searchMatch;
    });
    if (sortBy === "price-low") result.sort((a: any, b: any) => a.price - b.price);
    if (sortBy === "price-high") result.sort((a: any, b: any) => b.price - a.price);
    if (sortBy === "newest") result.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return result;
  }, [products, selectedCategory, selectedColors, selectedSizes, sortBy, searchParam]);

  const toggleColor = (c: string) => { 
    const n = selectedColors.includes(c) ? selectedColors.filter(x => x !== c) : [...selectedColors, c]; 
    updateFilters("colors", n); 
  };
  
  const toggleSize = (s: string) => { 
    const n = selectedSizes.includes(s) ? selectedSizes.filter(x => x !== s) : [...selectedSizes, s]; 
    updateFilters("sizes", n); 
  };
  
  const clearFilters = () => router.push("/products", { scroll: false });

  return (
    <div className="flex-1 bg-paper min-h-screen">
      {/* Header Panel */}
      <section className="px-6 md:px-12 py-12 bg-white relative overflow-hidden border-b-4 border-ink">
        <div className="absolute inset-0 bg-halftone opacity-10 pointer-events-none" />
        <div className="container mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <CartoonBadge variant="outline" className="text-secondary border-secondary">ITEM ARCHIVE</CartoonBadge>
              <h1 className="font-bangers text-6xl md:text-8xl text-ink leading-none text-ink-shadow">
                THE LINEUP
              </h1>
              <p className="font-comic text-2xl italic font-bold text-secondary">
                {filteredProducts.length} PIECES FOUND — READY FOR DEPLOYMENT
              </p>
            </div>
            
            <div className="flex items-center gap-4">
               <CartoonButton 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsMobileFiltersOpen(true)}
                  className="lg:hidden"
               >
                 <Filter size={18} /> FILTERS
               </CartoonButton>
               
               <div className="hidden lg:flex items-center gap-2 bg-white border-3 border-ink p-1 cartoon-shadow-sm">
                 <button className="p-2 bg-ink text-paper border-2 border-ink"><LayoutGrid size={20} /></button>
                 <button className="p-2 hover:bg-surface transition-colors"><List size={20} /></button>
               </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 md:px-12 py-12 flex flex-col lg:flex-row gap-12">
        {/* Sidebar Filters */}
        <aside className="hidden lg:block w-72 shrink-0">
          <div className="sticky top-40 space-y-12">
            {/* Filter Header */}
            <div className="flex items-center justify-between border-b-3 border-ink pb-4">
              <h3 className="font-bangers text-3xl tracking-wider">FILTERS</h3>
              {(selectedCategory || selectedColors.length > 0 || selectedSizes.length > 0) && (
                <button onClick={clearFilters} className="font-bebas text-xl text-secondary hover:underline">
                  RESET ALL
                </button>
              )}
            </div>

            {/* Categories */}
            <div className="space-y-4">
              <h4 className="font-bebas text-2xl tracking-widest uppercase text-ink/60">// CATEGORY</h4>
              <div className="space-y-2">
                {categories.map((cat) => (
                  <button
                    key={cat.slug}
                    onClick={() => updateFilters("category", selectedCategory === cat.name ? null : cat.name)}
                    className={cn(
                      "w-full text-left px-4 py-2 font-comic font-bold text-lg italic transition-all border-l-4",
                      selectedCategory === cat.name || selectedCategory === cat.slug
                        ? "border-ink bg-surface translate-x-2"
                        : "border-transparent hover:border-ink/20 text-secondary"
                    )}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Sizes */}
            {allSizes.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-bebas text-2xl tracking-widest uppercase text-ink/60">// SIZE</h4>
                <div className="flex flex-wrap gap-2">
                  {allSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => toggleSize(size)}
                      className={cn(
                        "w-12 h-12 flex items-center justify-center font-bebas text-xl border-3 transition-all",
                        selectedSizes.includes(size)
                          ? "bg-ink text-paper border-ink cartoon-shadow-sm translate-x-1 translate-y-1 shadow-none"
                          : "bg-paper text-ink border-ink hover:bg-surface"
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sort */}
            <div className="space-y-4">
              <h4 className="font-bebas text-2xl tracking-widest uppercase text-ink/60">// SORT BY</h4>
              <div className="space-y-2">
                {[
                  { key: "featured", label: "FEATURED" },
                  { key: "newest", label: "NEWEST" },
                  { key: "price-low", label: "PRICE: LOW TO HIGH" },
                  { key: "price-high", label: "PRICE: HIGH TO LOW" },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setSortBy(opt.key)}
                    className={cn(
                      "w-full text-left px-4 py-2 font-comic font-bold text-lg italic transition-all",
                      sortBy === opt.key ? "text-ink underline decoration-4 underline-offset-4" : "text-secondary hover:text-ink"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-[4/5] bg-surface border-3 border-ink cartoon-shadow animate-pulse" />
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product: any) => (
                <CartoonProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-center space-y-8">
              <div className="relative">
                <CartoonCard className="p-12 rotate-2 bg-white">
                  <h2 className="font-bangers text-5xl text-ink">404: STYLE NOT FOUND</h2>
                  <p className="font-comic text-xl font-bold italic mt-4 text-secondary">
                    Your search parameters returned zero results.<br />Try another route, wanderer.
                  </p>
                </CartoonCard>
                <div className="absolute -top-6 -right-6 text-6xl animate-bounce">⚡</div>
              </div>
              <CartoonButton onClick={clearFilters}>SHOW ALL ITEMS</CartoonButton>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {isMobileFiltersOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-ink/60 backdrop-blur-sm z-[1000]"
              onClick={() => setIsMobileFiltersOpen(false)}
            />
            <motion.div 
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              className="fixed inset-y-0 right-0 w-full max-w-sm bg-paper border-l-4 border-ink z-[1001] p-8 overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-12">
                <h2 className="font-bangers text-4xl">FILTERS</h2>
                <button onClick={() => setIsMobileFiltersOpen(false)} className="p-2 border-3 border-ink cartoon-shadow-sm">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-12">
                {/* Categories */}
                <div className="space-y-4">
                  <h3 className="font-bebas text-2xl tracking-widest">// CATEGORY</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.slug}
                        onClick={() => updateFilters("category", selectedCategory === cat.name ? null : cat.name)}
                        className={cn(
                          "text-left px-4 py-3 font-comic font-bold text-xl italic border-3 transition-all",
                          selectedCategory === cat.name ? "bg-ink text-paper border-ink" : "bg-white border-ink"
                        )}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sizes */}
                {allSizes.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-bebas text-2xl tracking-widest">// SIZE</h3>
                    <div className="flex flex-wrap gap-2">
                      {allSizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => toggleSize(size)}
                          className={cn(
                            "w-14 h-14 flex items-center justify-center font-bebas text-2xl border-3 transition-all",
                            selectedSizes.includes(size) ? "bg-ink text-paper border-ink" : "bg-white border-ink"
                          )}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-12 pt-12 border-t-3 border-ink space-y-4">
                <CartoonButton className="w-full" onClick={() => setIsMobileFiltersOpen(false)}>APPLY FILTERS</CartoonButton>
                <button onClick={clearFilters} className="w-full font-bebas text-2xl text-secondary py-2">RESET ALL</button>
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
    <Suspense fallback={<div className="h-screen bg-paper" />}>
      <ShopContent />
    </Suspense>
  );
}
