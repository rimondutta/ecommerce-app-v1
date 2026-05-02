"use client";
import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ProductCard from "@/components/ui/ProductCard";
import EditorialSection from "@/components/ui/EditorialSection";
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
    <div className="flex-1 flex flex-col bg-zinc-50/50 min-h-screen font-sans text-zinc-900 relative">
      
      {/* MODERN SOFT HERO */}
      <section className="relative pt-32 md:pt-40 pb-12 px-4 md:px-12 overflow-hidden">
          <div className="max-w-[1800px] mx-auto bg-white rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-20 shadow-soft-sm border border-zinc-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-zinc-50 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl pointer-events-none opacity-50" />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center relative z-10">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-8"
                  >
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-100 rounded-full text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-pulse" />
                        Collection Vol. 01
                      </div>
                      <h1 className="font-display font-bold text-5xl md:text-8xl tracking-tight text-zinc-900 leading-[1.1]">
                        The <span className="text-zinc-400">Uniform</span> <br />
                        System
                      </h1>
                      <p className="text-zinc-500 text-lg md:text-xl max-w-md font-medium leading-relaxed">
                        Meticulously crafted garments designed for the modern individual. A balance of form and function.
                      </p>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="relative aspect-[16/9] lg:aspect-square rounded-[2rem] overflow-hidden shadow-soft-2xl"
                  >
                      <Image 
                        src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop"
                        alt="Shop Header"
                        fill
                        className="object-cover"
                        priority
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </motion.div>
              </div>
          </div>
      </section>

      <div className="max-w-[1800px] mx-auto w-full px-4 md:px-12 relative">

        {/* SHOP CONTROLS */}
        <section className={`relative z-40 flex flex-col md:flex-row md:items-center justify-between gap-6 py-8 border-b border-zinc-200/50`}>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileFiltersOpen(true)}
              className="group flex items-center gap-3 font-bold text-[11px] uppercase tracking-widest bg-white px-6 py-3.5 rounded-full shadow-soft-sm border border-zinc-100 hover:shadow-soft transition-all active:scale-95"
            >
              <SlidersHorizontal size={14} className="text-zinc-400 group-hover:text-zinc-900 transition-colors" /> 
              Refine Results
            </button>
            
            <div className="hidden md:flex items-center gap-4">
               <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">
                  {filteredProducts.length} Pieces Found
               </span>
               {selectedCategory && (
                 <button 
                   onClick={() => updateFilters('category', null)} 
                   className="flex items-center gap-2 bg-zinc-100 text-zinc-900 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all"
                 >
                   {selectedCategory} <X size={12} />
                 </button>
               )}
            </div>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-6">
            <div className="flex md:hidden items-center gap-2">
               <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                  {filteredProducts.length} Items
               </span>
            </div>
            
            <div className="relative group">
              <button className="flex items-center gap-3 font-bold text-[11px] uppercase tracking-widest bg-white px-6 py-3.5 rounded-full shadow-soft-sm border border-zinc-100">
                Sort By: <span className="text-zinc-400">{sortBy.replace('-', ' ')}</span>
              </button>
              <div className="absolute right-0 top-full mt-3 w-48 bg-white rounded-2xl shadow-soft-2xl border border-zinc-100 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all translate-y-2 group-hover:translate-y-0 z-50 overflow-hidden p-2">
                {["featured", "newest", "price-low", "price-high"].map(opt => (
                  <button
                    key={opt}
                    onClick={() => setSortBy(opt)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${sortBy === opt ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'}`}
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
            <div className="flex flex-col items-center justify-center h-[50vh] gap-6">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 border-[3px] border-zinc-100 rounded-full" />
                <div className="absolute inset-0 border-[3px] border-t-zinc-900 rounded-full animate-spin" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 animate-pulse">Syncing Inventory</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="relative grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 md:gap-x-8 gap-y-12 md:gap-y-20">
              {filteredProducts.map((product: any, idx: number) => {
                const isFullWidth = (idx + 1) % 9 === 0;

                return (
                  <div key={product._id || idx} className={`${isFullWidth ? 'col-span-2' : 'col-span-1'}`}>
                    <ProductCard product={product} index={idx} />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 p-8 text-center bg-white rounded-[3rem] shadow-soft-sm border border-zinc-100">
              <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-300 mb-8">
                <Search size={40} />
              </div>
              <h3 className="font-display font-bold text-3xl text-zinc-900 tracking-tight mb-4">No pieces found</h3>
              <p className="text-zinc-500 max-w-sm mb-12 font-medium leading-relaxed">Try adjusting your filters to find what you're looking for.</p>
              <button 
                onClick={clearFilters}
                className="px-10 py-4 bg-zinc-900 text-white text-[11px] font-bold uppercase tracking-widest rounded-full hover:bg-zinc-800 transition-all shadow-soft-xl active:scale-95"
              >
                Reset All Filters
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
              className="fixed inset-0 z-[600] bg-zinc-900/40 backdrop-blur-md lg:hidden flex justify-end"
            >
              <motion.div 
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="w-full sm:w-[450px] bg-white h-full p-8 md:p-12 overflow-y-auto flex flex-col shadow-2xl rounded-l-[3rem]"
              >
                 <div className="flex justify-between items-center mb-16">
                    <h2 className="font-display font-bold text-3xl text-zinc-900 tracking-tight">Refine Results</h2>
                    <button 
                      onClick={() => setIsMobileFiltersOpen(false)} 
                      className="w-12 h-12 bg-zinc-50 text-zinc-500 rounded-full flex items-center justify-center hover:bg-zinc-100 transition-colors shadow-soft-sm"
                    >
                       <X size={24} />
                    </button>
                 </div>
                 
                 <div className="flex-1 space-y-16">
                    <div className="space-y-8">
                       <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Shop By Category</h3>
                       <div className="flex flex-col gap-3">
                         {categories.map((cat: string) => (
                           <button 
                             key={cat}
                             onClick={() => updateFilters('category', selectedCategory === cat ? null : cat)}
                             className={`p-6 rounded-2xl text-left text-sm font-bold uppercase tracking-widest transition-all ${selectedCategory === cat ? 'bg-zinc-900 text-white shadow-soft-xl' : 'bg-zinc-50 text-zinc-500 hover:bg-zinc-100'}`}
                           >
                             {cat}
                           </button>
                         ))}
                       </div>
                    </div>
                    {/* Colors */}
                    {allColors.length > 0 && (
                      <div className="space-y-8">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Available Colors</h3>
                        <div className="grid grid-cols-5 gap-4">
                           {allColors.map((color: string) => {
                             const colorObj = products.find((p: any) => p.colors?.some((c: any) => c.name === color))?.colors?.find((c: any) => c.name === color);
                             return (
                               <button
                                 key={color}
                                 onClick={() => toggleColor(color)}
                                 className={`aspect-square rounded-full transition-all flex items-center justify-center ${selectedColors.includes(color) ? 'ring-2 ring-zinc-900 ring-offset-4 scale-110 shadow-soft' : 'ring-1 ring-zinc-100 hover:scale-105'}`}
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
                      <div className="space-y-8">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Select Sizes</h3>
                        <div className="grid grid-cols-4 gap-3">
                           {allSizes.map((size: string) => (
                             <button
                               key={size}
                               onClick={() => toggleSize(size)}
                               className={`h-14 flex items-center justify-center rounded-2xl font-bold transition-all border ${selectedSizes.includes(size) ? 'bg-zinc-900 text-white border-zinc-900 shadow-soft-xl' : 'bg-white border-zinc-100 text-zinc-400 hover:border-zinc-900 hover:text-zinc-900'}`}
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
                      className="w-full py-6 bg-zinc-900 text-white text-[11px] font-bold uppercase tracking-[0.2em] rounded-[1.5rem] shadow-soft-2xl active:scale-95 transition-all"
                    >
                      Show Results
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
