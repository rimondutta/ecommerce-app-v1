"use client";
import { useState, useEffect, useMemo, Fragment, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ProductCard from "@/components/ui/ProductCard";
import EditorialSection from "@/components/ui/EditorialSection";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/components/providers/CartProvider";
import { useWishlist } from "@/components/providers/WishlistProvider";


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
  const [isScrolled, setIsScrolled] = useState(false);

  const { addItem, openCart } = useCart();
  const { toggleItem, isWishlisted } = useWishlist();

  // Fetch products from DB
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/store/products");
        const data = await res.json();
        if (data.products) {
          setProducts(data.products);
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Sync state with URL params - Robust implementation
  useEffect(() => {
    setSelectedCategory(categoryParam);
    setSelectedColors(colorsParam ? colorsParam.split(',') : []);
    setSelectedSizes(sizesParam ? sizesParam.split(',') : []);
  }, [categoryParam, colorsParam, sizesParam]);

  // Utility to update URL filters
  const updateFilters = (key: string, value: string | null | string[]) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value === null || (Array.isArray(value) && value.length === 0)) {
      params.delete(key);
    } else if (Array.isArray(value)) {
      params.set(key, value.join(','));
    } else {
      params.set(key, value);
    }
    
    router.push(`/products?${params.toString()}`, { scroll: false });
  };

  // Handle scroll for sticky effects
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Extract unique filter options from DB data
  const categories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach((p: any) => {
      if (p.category?.name) cats.add(p.category.name);
    });
    return Array.from(cats);
  }, [products]);

  const allColors = useMemo(() => {
    const colors = new Set<string>();
    products.forEach((p: any) => p.colors?.forEach((c: any) => colors.add(c.name)));
    return Array.from(colors);
  }, [products]);

  const allSizes = useMemo(() => {
    const sizes = new Set<string>();
    products.forEach((p: any) => p.sizes?.forEach((s: string) => sizes.add(s)));
    return Array.from(sizes).sort();
  }, [products]);

  // Filter and Sort Logic
  const filteredProducts = useMemo(() => {
    let result = products.filter((p: any) => {
      const categoryMatch = !selectedCategory || p.category?.name === selectedCategory;
      const colorMatch = selectedColors.length === 0 || p.colors?.some((c: any) => selectedColors.includes(c.name));
      const sizeMatch = selectedSizes.length === 0 || p.sizes?.some((s: string) => selectedSizes.includes(s));
      return categoryMatch && colorMatch && sizeMatch;
    });

    if (sortBy === "price-low") result.sort((a: any, b: any) => a.price - b.price);
    if (sortBy === "price-high") result.sort((a: any, b: any) => b.price - a.price);
    if (sortBy === "newest") result.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return result;
  }, [products, selectedCategory, selectedColors, selectedSizes, sortBy]);

  const toggleColor = (color: string) => {
    const newColors = selectedColors.includes(color) 
      ? selectedColors.filter((c: string) => c !== color) 
      : [...selectedColors, color];
    updateFilters('colors', newColors);
  };

  const toggleSize = (size: string) => {
    const newSizes = selectedSizes.includes(size) 
      ? selectedSizes.filter((s: string) => s !== size) 
      : [...selectedSizes, size];
    updateFilters('sizes', newSizes);
  };

  const clearFilters = () => {
    router.push('/products', { scroll: false });
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F9F9F9] min-h-screen font-sans text-neutral-900 relative">
      
      {/* LUXURY EDITORIAL HERO */}
      <section className="relative pt-32 md:pt-40 pb-24 px-6 md:px-12 overflow-hidden bg-white">
          <div className="max-w-[1800px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-end">
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-8"
              >
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-600">Flex Wear Collection / Vol. 01</span>
                  <h1 className="font-display font-black text-6xl md:text-9xl tracking-tighter text-neutral-900 leading-[0.85] uppercase">
                    The <br />
                    <span className="text-neutral-400 italic">Uniform</span> <br />
                    System
                  </h1>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-start gap-8"
              >
                  <p className="text-neutral-600 text-xl md:text-2xl max-w-md font-medium leading-relaxed">
                    A collection of meticulously crafted garments designed for the modern architect of life.
                  </p>
                  <div className="flex items-center gap-10">
                      <div className="flex flex-col">
                          <span className="text-2xl font-black">2.4k+</span>
                          <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-500">Items Sold</span>
                      </div>
                      <div className="h-10 w-[1px] bg-neutral-100" />
                      <div className="flex flex-col">
                          <span className="text-2xl font-black">128</span>
                          <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-500">Total Pieces</span>
                      </div>
                  </div>
              </motion.div>
          </div>
      </section>

      <div className="max-w-[1800px] mx-auto w-full px-6 md:px-12 relative">

        {/* SHOP CONTROLS - MINIMAL TACTICAL BAR */}
        <section className={`relative z-40 flex items-center justify-between gap-6 transition-all duration-700 py-6 border-b border-black/5 bg-[#F9F9F9]`}>
          <div className="flex items-center gap-6 md:gap-12">
            <button 
              onClick={() => setIsMobileFiltersOpen(true)}
              className="group flex items-center gap-3 font-black text-[10px] uppercase tracking-[0.2em] active:scale-95 transition-all bg-white px-4 py-2 border border-black/5 rounded-full"
              data-cursor="FILTER"
            >
              <SlidersHorizontal size={12} className="group-hover:rotate-90 transition-transform duration-500" /> 
              Refine
            </button>
            
            <div className="hidden md:flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-600">
               <div className="bg-black text-white px-3 py-1">
                  {filteredProducts.length} Items
               </div>
               {selectedCategory && (
                 <button onClick={() => updateFilters('category', null)} className="flex items-center gap-2 hover:text-black border-b border-black/20">
                   {selectedCategory} <X size={10} />
                 </button>
               )}
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-8">
            <div className="relative group">
              <button className="flex items-center gap-3 font-black text-[10px] uppercase tracking-[0.2em] cursor-pointer bg-white px-4 py-2 border border-black/5 rounded-full">
                Sort: <span className="text-neutral-500">{sortBy.replace('-', ' ')}</span>
              </button>
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-black/10 shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all translate-y-2 group-hover:translate-y-0 z-50">
                {["featured", "newest", "price-low", "price-high"].map(opt => (
                  <button
                    key={opt}
                    onClick={() => setSortBy(opt)}
                    className={`w-full text-left px-5 py-3 text-[10px] font-black uppercase tracking-[0.1em] hover:bg-black hover:text-white transition-all ${sortBy === opt ? 'bg-neutral-50 text-black' : 'text-neutral-500'}`}
                  >
                    {opt.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="flex-1 pb-40 pt-12">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
              <div className="w-12 h-12 border-[3px] border-neutral-100 border-t-neutral-900 rounded-full animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500 animate-pulse">Syncing Database</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="relative grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 md:gap-x-8 gap-y-12 md:gap-y-20">
              {filteredProducts.map((product: any, idx: number) => {
                // Editorial Spacing Logic
                const isEditorial = (idx + 1) % 13 === 6;
                const isFullWidth = (idx + 1) % 7 === 0; // Every 7th item is full-width on mobile

                if (isEditorial) {
                  return (
                    <div key={`editorial-${product._id || idx}`} className="col-span-2 md:col-span-3 xl:col-span-4 py-12 md:py-24">
                      <EditorialSection 
                        product={product} 
                        index={Math.floor(idx / 13)} 
                      />
                    </div>
                  );
                }

                return (
                  <div key={product._id || idx} className={`${isFullWidth ? 'col-span-2' : 'col-span-1'}`}>
                    <ProductCard product={product} index={idx} />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[50vh] p-8 text-center bg-white border border-black/5 shadow-sm rounded-sm">
              <h3 className="font-black text-4xl uppercase tracking-tighter mb-4">No results found</h3>
              <p className="text-neutral-400 max-w-sm mb-12 font-medium">Try adjusting your refine parameters.</p>
              <button 
                onClick={clearFilters}
                className="px-12 py-5 bg-black text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-neutral-800 transition-all active:scale-95"
              >
                Clear All
              </button>
            </div>
          )}
        </section>

        {/* MOBILE FILTER DRAWER */}
        <AnimatePresence>
          {isMobileFiltersOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-md lg:hidden flex justify-end"
            >
              <motion.div 
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="w-[90%] bg-white h-full p-6 md:p-10 overflow-y-auto flex flex-col shadow-2xl"
              >
                 <div className="flex justify-between items-center mb-16">
                    <h2 className="font-black text-3xl md:text-4xl uppercase tracking-tighter italic">Refine</h2>
                    <button onClick={() => setIsMobileFiltersOpen(false)} className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center hover:bg-neutral-200 transition-colors">
                       <X size={24} />
                    </button>
                 </div>
                 
                 <div className="flex-1 space-y-16">
                    <div className="space-y-6">
                       <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400">Category</h3>
                       <div className="flex flex-col gap-2">
                         {categories.map((cat: string) => (
                           <button 
                             key={cat}
                             onClick={() => updateFilters('category', selectedCategory === cat ? null : cat)}
                             className={`p-5 rounded-sm text-left text-[14px] font-bold uppercase tracking-widest transition-all ${selectedCategory === cat ? 'bg-black text-white' : 'bg-neutral-50 text-neutral-500 hover:bg-neutral-100'}`}
                           >
                             {cat}
                           </button>
                         ))}
                       </div>
                    </div>
                    {/* Colors */}
                    {allColors.length > 0 && (
                      <div className="space-y-6">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400">Colors</h3>
                        <div className="grid grid-cols-5 gap-4">
                           {allColors.map((color: string) => {
                             const colorObj = products.find((p: any) => p.colors?.some((c: any) => c.name === color))?.colors?.find((c: any) => c.name === color);
                             return (
                               <button
                                 key={color}
                                 onClick={() => toggleColor(color)}
                                 className={`aspect-square rounded-full transition-all flex items-center justify-center ${selectedColors.includes(color) ? 'ring-2 ring-black ring-offset-4' : 'ring-1 ring-black/10'}`}
                               >
                                 <div className="w-full h-full rounded-full" style={{ backgroundColor: colorObj?.hex || color.toLowerCase().replace(' ', '') }} />
                               </button>
                             );
                           })}
                        </div>
                      </div>
                    )}

                    {/* Sizes */}
                    {allSizes.length > 0 && (
                      <div className="space-y-6">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400">Sizes</h3>
                        <div className="flex flex-wrap gap-3">
                           {allSizes.map((size: string) => (
                             <button
                               key={size}
                               onClick={() => toggleSize(size)}
                               className={`h-14 min-w-14 px-4 font-black transition-all border ${selectedSizes.includes(size) ? 'bg-black text-white border-black' : 'bg-white border-neutral-200 text-neutral-400'}`}
                             >
                               {size}
                             </button>
                           ))}
                        </div>
                      </div>
                    )}
                 </div>

                 <div className="pt-12 mt-auto">
                    <button 
                      onClick={() => setIsMobileFiltersOpen(false)}
                      className="w-full py-6 bg-black text-white text-[11px] font-black uppercase tracking-[0.4em] shadow-2xl active:scale-95 transition-all"
                    >
                      View Results
                    </button>
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
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="w-12 h-12 border-[3px] border-neutral-100 border-t-neutral-900 rounded-full animate-spin" />
      </div>
    }>
      <ShopContent />
    </Suspense>
  )
}
