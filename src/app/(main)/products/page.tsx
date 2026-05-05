"use client";
import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ProductCard from "@/components/ui/ProductCard";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X, Search } from "lucide-react";
import Image from "next/image";

function ShopContent() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryParam = searchParams.get('category');
  const colorsParam = searchParams.get('colors');
  const sizesParam = searchParams.get('sizes');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryParam);
  const [selectedColors, setSelectedColors] = useState<string[]>(colorsParam ? colorsParam.split(',') : []);
  const [selectedSizes, setSelectedSizes] = useState<string[]>(sizesParam ? sizesParam.split(',') : []);
  const [sortBy, setSortBy] = useState("featured");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try { const res = await fetch("/api/store/products"); const data = await res.json(); if (data.products) setProducts(data.products); } catch (err) { console.error("Failed to fetch products:", err); } finally { setLoading(false); }
    };
    fetchProducts();
  }, []);

  useEffect(() => { setSelectedCategory(categoryParam); setSelectedColors(colorsParam ? colorsParam.split(',') : []); setSelectedSizes(sizesParam ? sizesParam.split(',') : []); }, [categoryParam, colorsParam, sizesParam]);

  const updateFilters = (key: string, value: string | null | string[]) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || (Array.isArray(value) && value.length === 0)) { params.delete(key); } else if (Array.isArray(value)) { params.set(key, value.join(',')); } else { params.set(key, value); }
    router.push(`/products?${params.toString()}`, { scroll: false });
  };

  const categories = useMemo(() => { const catsMap = new Map<string, string>(); products.forEach((p: any) => { if (p.category?.name && p.category?.slug) catsMap.set(p.category.slug, p.category.name); }); return Array.from(catsMap.entries()).map(([slug, name]) => ({ slug, name })); }, [products]);
  const allColors = useMemo(() => { const colors = new Set<string>(); products.forEach((p: any) => p.colors?.forEach((c: any) => colors.add(c.name))); return Array.from(colors); }, [products]);
  const allSizes = useMemo(() => { const sizes = new Set<string>(); products.forEach((p: any) => p.sizes?.forEach((s: string) => sizes.add(s))); return Array.from(sizes).sort(); }, [products]);

  const filteredProducts = useMemo(() => {
    let result = products.filter((p: any) => {
      const categoryMatch = !selectedCategory || p.category?.slug === selectedCategory || p.category?.name === selectedCategory;
      const colorMatch = selectedColors.length === 0 || p.colors?.some((c: any) => selectedColors.includes(c.name));
      const sizeMatch = selectedSizes.length === 0 || p.sizes?.some((s: string) => selectedSizes.includes(s));
      return categoryMatch && colorMatch && sizeMatch;
    });
    if (sortBy === "price-low") result.sort((a: any, b: any) => a.price - b.price);
    if (sortBy === "price-high") result.sort((a: any, b: any) => b.price - a.price);
    if (sortBy === "newest") result.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return result;
  }, [products, selectedCategory, selectedColors, selectedSizes, sortBy]);

  const toggleColor = (color: string) => { const n = selectedColors.includes(color) ? selectedColors.filter(c => c !== color) : [...selectedColors, color]; updateFilters('colors', n); };
  const toggleSize = (size: string) => { const n = selectedSizes.includes(size) ? selectedSizes.filter(s => s !== size) : [...selectedSizes, size]; updateFilters('sizes', n); };
  const clearFilters = () => { router.push('/products', { scroll: false }); };

  return (
    <div className="flex-1 flex flex-col bg-[#0a0a0a] min-h-screen text-[#e5e2e1] relative">
      {/* Hero */}
      <section className="relative pt-8 md:pt-12 pb-12 px-4 md:px-12 overflow-hidden">
        <div className="max-w-[1800px] mx-auto bg-[#111] p-8 md:p-20 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }} className="space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-[1px] bg-[#333]" />
                <span className="label-tiny text-[#8e9192]">Collection Vol. 01</span>
              </div>
              <h1 className="font-serif text-5xl md:text-8xl tracking-[-0.02em] text-white leading-[0.9]">
                The <span className="text-[#555] italic">Uniform</span><br />System
              </h1>
              <p className="body-lg text-[#8e9192] max-w-md">Meticulously crafted garments designed for the modern individual.</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }} className="relative aspect-[16/9] lg:aspect-square overflow-hidden group">
              <Image src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop" alt="Shop Header" fill className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500" priority />
            </motion.div>
          </div>
        </div>
      </section>

      <div className="max-w-[1800px] mx-auto w-full px-4 md:px-12 relative">
        {/* Controls */}
        <section className="relative z-40 flex flex-col md:flex-row md:items-center justify-between gap-6 py-8 border-b border-white/5">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileFiltersOpen(true)} className="group flex items-center gap-3 label-tiny bg-[#1a1a1a] px-6 py-3.5 rounded-full hover:bg-[#222] transition-all active:scale-95 text-[#8e9192]">
              <SlidersHorizontal size={14} strokeWidth={1} className="group-hover:text-white transition-colors" /> Refine
            </button>
            <div className="hidden md:flex items-center gap-4">
              <span className="label-tiny text-[#555]">{filteredProducts.length} Pieces</span>
              {selectedCategory && (
                <button onClick={() => updateFilters('category', null)} className="flex items-center gap-2 bg-white text-[#0a0a0a] px-3 py-1.5 rounded-full label-tiny hover:bg-[#e5e2e1] transition-all" style={{ fontSize: '8px' }}>
                  {selectedCategory} <X size={10} />
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between md:justify-end gap-6">
            <div className="flex md:hidden items-center gap-2"><span className="label-tiny text-[#555]">{filteredProducts.length} Items</span></div>
            <div className="relative group">
              <button className="flex items-center gap-3 label-tiny bg-[#1a1a1a] px-6 py-3.5 rounded-full text-[#8e9192]">Sort: <span className="text-[#555]">{sortBy.replace('-', ' ')}</span></button>
              <div className="absolute right-0 top-full mt-3 w-48 bg-[#111] opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all translate-y-2 group-hover:translate-y-0 z-50 overflow-hidden p-2 border border-white/5">
                {["featured", "newest", "price-low", "price-high"].map(opt => (
                  <button key={opt} onClick={() => setSortBy(opt)} className={`w-full text-left px-4 py-3 label-tiny transition-all ${sortBy === opt ? 'bg-white text-[#0a0a0a]' : 'text-[#8e9192] hover:text-white hover:bg-[#1a1a1a]'}`} style={{ fontSize: '9px' }}>{opt.replace('-', ' ')}</button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="flex-1 pb-40 pt-12">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-[50vh] gap-6">
              <div className="relative w-12 h-12"><div className="absolute inset-0 border border-[#333] rounded-full" /><div className="absolute inset-0 border border-t-white rounded-full animate-spin" /></div>
              <p className="label-tiny text-[#555] animate-pulse">Syncing Inventory</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="relative grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 md:gap-x-6 gap-y-12 md:gap-y-20">
              {filteredProducts.map((product: any, idx: number) => {
                const isFullWidth = (idx + 1) % 9 === 0;
                return (<div key={product._id || idx} className={`${isFullWidth ? 'col-span-2' : 'col-span-1'}`}><ProductCard product={product} index={idx} /></div>);
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 p-8 text-center bg-[#111]">
              <div className="w-20 h-20 bg-[#1a1a1a] rounded-full flex items-center justify-center text-[#333] mb-8"><Search size={40} strokeWidth={1} /></div>
              <h3 className="font-serif text-3xl text-white tracking-tight mb-4">No pieces found</h3>
              <p className="text-[#8e9192] max-w-sm mb-12 font-light">Try adjusting your filters.</p>
              <button onClick={clearFilters} className="btn-pill-primary">Reset All Filters</button>
            </div>
          )}
        </section>

        {/* Mobile Filter Drawer */}
        <AnimatePresence>
          {isMobileFiltersOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[600] bg-black/60 backdrop-blur-sm lg:hidden flex justify-end">
              <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="w-full sm:w-[450px] bg-[#111] h-full p-8 md:p-12 overflow-y-auto flex flex-col">
                <div className="flex justify-between items-center mb-16">
                  <h2 className="font-serif text-3xl text-white tracking-tight">Refine</h2>
                  <button onClick={() => setIsMobileFiltersOpen(false)} className="w-12 h-12 bg-[#1a1a1a] text-[#8e9192] flex items-center justify-center hover:bg-[#222] hover:text-white transition-colors"><X size={24} strokeWidth={1} /></button>
                </div>
                <div className="flex-1 space-y-16">
                  <div className="space-y-8">
                    <h3 className="label-tiny text-[#8e9192]">Category</h3>
                    <div className="flex flex-col gap-3">
                      {categories.map((cat: any) => (
                        <button key={cat.slug} onClick={() => updateFilters('category', selectedCategory === cat.slug ? null : cat.slug)} className={`p-6 text-left label-tiny transition-all ${selectedCategory === cat.slug ? 'bg-white text-[#0a0a0a]' : 'bg-[#1a1a1a] text-[#8e9192] hover:bg-[#222] hover:text-white'}`}>{cat.name}</button>
                      ))}
                    </div>
                  </div>
                  {allColors.length > 0 && (
                    <div className="space-y-8">
                      <h3 className="label-tiny text-[#8e9192]">Colors</h3>
                      <div className="grid grid-cols-5 gap-4">
                        {allColors.map((color: string) => {
                          const colorObj = products.find((p: any) => p.colors?.some((c: any) => c.name === color))?.colors?.find((c: any) => c.name === color);
                          return (<button key={color} onClick={() => toggleColor(color)} className={`aspect-square rounded-full transition-all flex items-center justify-center ${selectedColors.includes(color) ? 'ring-2 ring-white ring-offset-2 ring-offset-[#111] scale-110' : 'ring-1 ring-[#333] hover:scale-105'}`}><div className="w-full h-full rounded-full" style={{ backgroundColor: colorObj?.hex || color.toLowerCase().replace(' ', '') }} /></button>);
                        })}
                      </div>
                    </div>
                  )}
                  {allSizes.length > 0 && (
                    <div className="space-y-8">
                      <h3 className="label-tiny text-[#8e9192]">Sizes</h3>
                      <div className="grid grid-cols-4 gap-3">
                        {allSizes.map((size: string) => (
                          <button key={size} onClick={() => toggleSize(size)} className={`h-14 flex items-center justify-center label-tiny transition-all ${selectedSizes.includes(size) ? 'bg-white text-[#0a0a0a]' : 'bg-[#1a1a1a] text-[#8e9192] hover:bg-[#222] hover:text-white'}`}>{size}</button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="pt-12 mt-auto">
                  <button onClick={() => setIsMobileFiltersOpen(false)} className="w-full py-5 bg-white text-[#0a0a0a] label-tiny hover:bg-[#e5e2e1] transition-all">Show Results</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-[#0a0a0a]"><div className="w-12 h-12 border border-[#333] border-t-white rounded-full animate-spin" /></div>}>
      <ShopContent />
    </Suspense>
  );
}
