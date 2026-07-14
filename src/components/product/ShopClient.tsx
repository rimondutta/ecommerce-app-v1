"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, X, ChevronDown } from "lucide-react";
import ProductCardNike from "@/components/ui/product-card-nike";
import { cn } from "@/lib/utils";

function FilterCheckbox({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="flex items-center gap-3 w-full group py-1"
    >
      <div className={cn(
        "w-5 h-5 rounded border flex items-center justify-center transition-colors",
        selected ? "bg-black border-black text-white" : "border-neutral-300 bg-white group-hover:border-black"
      )}>
        {selected && <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      </div>
      <span className="font-sans text-base text-black">{label}</span>
    </button>
  );
}

function ShopContent({ initialProducts }: { initialProducts: any[] }) {
  const [products] = useState<any[]>(initialProducts);
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const categoryParam = searchParams.get("category");
  const ageParam = searchParams.get("age");
  const searchParam = searchParams.get("search");
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryParam);
  const [selectedAge, setSelectedAge] = useState<string | null>(ageParam);
  const [sortBy, setSortBy] = useState("featured");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  useEffect(() => {
    setSelectedCategory(categoryParam);
    setSelectedAge(ageParam);
  }, [categoryParam, ageParam]);

  const updateFilters = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null) params.delete(key);
    else params.set(key, value);
    router.push(`/products?${params.toString()}`, { scroll: false });
  };

  const categories = useMemo(() => {
    const m = new Map<string, string>();
    products.forEach((p: any) => { if (p.category?.name && p.category?.slug) m.set(p.category.slug, p.category.name); });
    return Array.from(m.entries()).map(([slug, name]) => ({ slug, name }));
  }, [products]);

  const ageRanges = ["0-1", "1-3", "3-5", "5-8", "8+"];

  const filteredProducts = useMemo(() => {
    let result = products.filter((p: any) => {
      const catMatch = !selectedCategory || p.category?.slug === selectedCategory || p.category?.name === selectedCategory;
      const ageMatch = !selectedAge || p.ageRange === selectedAge;
      const searchMatch = !searchParam || p.title.toLowerCase().includes(searchParam.toLowerCase());
      return catMatch && ageMatch && searchMatch;
    });
    if (sortBy === "price-low") result.sort((a: any, b: any) => a.price - b.price);
    if (sortBy === "price-high") result.sort((a: any, b: any) => b.price - a.price);
    if (sortBy === "newest") result.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return result;
  }, [products, selectedCategory, selectedAge, sortBy, searchParam]);

  const clearFilters = () => router.push("/products", { scroll: false });

  return (
    <div className="flex-1 bg-white min-h-screen text-black font-sans">
      
      {/* Header */}
      <section className="px-6 md:px-12 py-8 bg-white border-b border-neutral-200 sticky top-0 z-30">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          <h1 className="font-sans font-medium text-2xl tracking-tight text-black">
            {selectedCategory ? selectedCategory : "All Toys"} ({filteredProducts.length})
          </h1>
          
          <div className="flex items-center gap-6">
             <button 
                onClick={() => setIsMobileFiltersOpen(true)}
                className="lg:hidden flex items-center gap-2 text-base font-medium"
             >
               Filters <Filter size={18} />
             </button>
             
             <div className="hidden lg:flex items-center gap-2">
               <span className="text-base text-neutral-500 font-medium">Sort By</span>
               <div className="relative">
                 <select 
                   value={sortBy}
                   onChange={(e) => setSortBy(e.target.value)}
                   className="appearance-none bg-transparent py-1 pr-6 text-base font-medium text-black focus:outline-none cursor-pointer"
                 >
                   <option value="featured">Featured</option>
                   <option value="newest">Newest</option>
                   <option value="price-low">Price: Low-High</option>
                   <option value="price-high">Price: High-Low</option>
                 </select>
                 <ChevronDown size={16} className="absolute right-0 top-1/2 -translate-y-1/2 text-black pointer-events-none" />
               </div>
             </div>
          </div>
        </div>
      </section>

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-10 flex flex-col lg:flex-row gap-12">
        
        {/* Sidebar Filters */}
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-28 space-y-10 pr-6">
            
            {/* Categories */}
            <div className="space-y-4">
              <h4 className="font-sans font-medium text-lg text-black border-b border-neutral-200 pb-2">Category</h4>
              <div className="space-y-3 pt-2">
                {categories.map((cat) => (
                  <FilterCheckbox
                    key={cat.slug}
                    label={cat.name}
                    selected={selectedCategory === cat.name || selectedCategory === cat.slug}
                    onClick={() => updateFilters("category", selectedCategory === cat.name ? null : cat.name)}
                  />
                ))}
              </div>
            </div>

            {/* Age Range */}
            <div className="space-y-4">
              <h4 className="font-sans font-medium text-lg text-black border-b border-neutral-200 pb-2">Age Range</h4>
              <div className="space-y-3 pt-2">
                {ageRanges.map((age) => (
                  <FilterCheckbox
                    key={age}
                    label={`${age} years`}
                    selected={selectedAge === age}
                    onClick={() => updateFilters("age", selectedAge === age ? null : age)}
                  />
                ))}
              </div>
            </div>

            {(selectedCategory || selectedAge) && (
              <button onClick={clearFilters} className="text-sm text-neutral-500 hover:text-black font-medium transition-colors border-b border-neutral-300 pb-0.5">
                Clear all filters
              </button>
            )}
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-8 sm:gap-y-10">
              {filteredProducts.map((product: any, idx: number) => (
                <ProductCardNike key={product._id} product={product} priority={idx < 4} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 bg-white border border-neutral-200 h-64">
              <div className="space-y-2">
                <h3 className="font-sans font-medium text-xl text-black">No toys found</h3>
                <p className="text-neutral-500 font-medium max-w-sm">
                  We couldn't find any toys matching your current filters.
                </p>
              </div>
              <button onClick={clearFilters} className="text-black border-b border-black font-medium pb-0.5 hover:opacity-70">
                Clear Filters
              </button>
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
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000]"
              onClick={() => setIsMobileFiltersOpen(false)}
            />
            <motion.div 
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 h-[80vh] bg-white z-[1001] flex flex-col rounded-t-3xl overflow-hidden"
            >
              <div className="flex justify-between items-center px-6 py-5 border-b border-neutral-200">
                <h2 className="font-sans font-medium text-xl text-black">Filter & Sort</h2>
                <button onClick={() => setIsMobileFiltersOpen(false)} className="p-2 text-black hover:bg-neutral-100 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-10">
                {/* Sort */}
                <div className="space-y-4">
                  <h3 className="font-sans font-medium text-lg text-black">Sort by</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: "featured", label: "Featured" },
                      { value: "newest", label: "Newest" },
                      { value: "price-low", label: "Price: Low-High" },
                      { value: "price-high", label: "Price: High-Low" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setSortBy(opt.value)}
                        className={cn(
                          "text-center px-4 py-3 rounded-full font-medium transition-colors border text-sm",
                          sortBy === opt.value ? "border-black text-black" : "border-neutral-200 text-neutral-600"
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Categories */}
                <div className="space-y-4">
                  <h3 className="font-sans font-medium text-lg text-black">Category</h3>
                  <div className="space-y-3">
                    {categories.map((cat) => (
                      <FilterCheckbox
                        key={cat.slug}
                        label={cat.name}
                        selected={selectedCategory === cat.name}
                        onClick={() => updateFilters("category", selectedCategory === cat.name ? null : cat.name)}
                      />
                    ))}
                  </div>
                </div>

                {/* Age */}
                <div className="space-y-4">
                  <h3 className="font-sans font-medium text-lg text-black">Age Range</h3>
                  <div className="space-y-3">
                    {ageRanges.map((age) => (
                      <FilterCheckbox
                        key={age}
                        label={`${age} years`}
                        selected={selectedAge === age}
                        onClick={() => updateFilters("age", selectedAge === age ? null : age)}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-neutral-200 bg-white space-y-3">
                <button className="w-full bg-black text-white font-sans font-medium rounded-full py-4 text-base hover:bg-neutral-800" onClick={() => setIsMobileFiltersOpen(false)}>
                  Apply ({filteredProducts.length} items)
                </button>
                {(selectedCategory || selectedAge) && (
                  <button onClick={() => { clearFilters(); setIsMobileFiltersOpen(false); }} className="w-full py-2 text-sm font-medium text-neutral-500 hover:text-black">
                    Clear all filters
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ShopClient({ initialProducts }: { initialProducts: any[] }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <ShopContent initialProducts={initialProducts} />
    </Suspense>
  );
}
