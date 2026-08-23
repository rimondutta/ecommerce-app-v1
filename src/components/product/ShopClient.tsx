"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X, ChevronDown } from "lucide-react";
import ProductCardNike from "@/components/ui/product-card-nike";
import { cn } from "@/lib/utils";

// ─── Flat catalog filter row ───────────────────────────────────────────────
function FilterPill({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "font-body text-sm px-4 py-2 rounded-full transition-all duration-200 whitespace-nowrap border",
        selected
          ? "bg-stamp-red text-white border-stamp-red"
          : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
      )}
    >
      {label}
    </button>
  );
}

function SidebarFilterItem({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 w-full group py-1"
    >
      <div className={cn(
        "w-4 h-4 rounded border flex items-center justify-center transition-colors",
        selected ? "bg-stamp-red border-stamp-red" : "border-gray-300 group-hover:border-gray-400 bg-white"
      )}>
        {selected && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>}
      </div>
      <span className={cn("font-body text-sm transition-colors", selected ? "text-ink-black font-medium" : "text-gray-600 group-hover:text-ink-black")}>
        {label}
      </span>
    </button>
  );
}

function ShopContent({ initialProducts }: { initialProducts: any[] }) {
  const [products] = useState<any[]>(initialProducts);
  const searchParams = useSearchParams();
  const router = useRouter();
  const reduced = useReducedMotion();

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

  // ─── ALL FILTERING / SORTING LOGIC UNTOUCHED ───
  const updateFilters = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null) params.delete(key);
    else params.set(key, value);
    router.push(`/products?${params.toString()}`, { scroll: false });
  };

  const categories = useMemo(() => {
    const m = new Map<string, string>();
    products.forEach((p: any) => {
      if (p.category?.name && p.category?.slug) m.set(p.category.slug, p.category.name);
    });
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

  const activeFilterCount = [selectedCategory, selectedAge].filter(Boolean).length;

  return (
    <div suppressHydrationWarning className="flex-1 bg-transparent min-h-screen text-ink-black font-body">

      {/* ─── Top Utility Bar ─── */}
      <section className="relative bg-paper-white/80 pb-4 pt-32 lg:pt-36">

        {/* Page title row */}
        <div className="px-4 sm:px-10 lg:px-[5vw] py-5 flex items-end justify-between border-b border-gray-200">
          <h1 className="font-body text-4xl md:text-5xl text-ink-black font-medium tracking-tight">
            {selectedCategory || "All Toys"}
          </h1>
          <span className="font-body text-sm text-gray-500 mb-1">
            {filteredProducts.length} products
          </span>
        </div>

        {/* Filter + sort strip */}
        <div className="px-4 sm:px-10 lg:px-[5vw] py-4 flex items-center justify-between">

          {/* Mobile: Filters button */}
          <button
            onClick={() => setIsMobileFiltersOpen(true)}
            className={cn(
              "lg:hidden flex items-center gap-2 font-body text-sm px-4 py-2 border rounded-full transition-colors",
              activeFilterCount > 0 ? "border-stamp-red text-stamp-red bg-stamp-red/5" : "border-gray-300 text-gray-700 hover:border-gray-400"
            )}
          >
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-stamp-red text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium">{activeFilterCount}</span>
            )}
          </button>

          {/* Desktop: inline category pills */}
          <div className="hidden lg:flex items-center gap-2 flex-wrap">
            <FilterPill label="All" selected={!selectedCategory} onClick={() => updateFilters("category", null)} />
            {categories.map((cat) => (
              <FilterPill
                key={cat.slug}
                label={cat.name}
                selected={selectedCategory === cat.name || selectedCategory === cat.slug}
                onClick={() => updateFilters("category", selectedCategory === cat.name ? null : cat.name)}
              />
            ))}
          </div>

          {/* Spacer */}
          {/* Desktop spacer */}
          <div className="flex-1 hidden lg:block" />

          {/* Sort */}
          <div className="relative flex items-center gap-3 shrink-0">
            <span className="font-body text-sm text-gray-500 hidden sm:block">Sort by:</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none font-body text-sm font-medium text-ink-black bg-transparent py-2 pr-8 focus:outline-none cursor-pointer"
                suppressHydrationWarning
              >
                <option value="featured">Featured</option>
                <option value="newest">New Arrivals</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
              <ChevronDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Active filter clear */}
          {(selectedCategory || selectedAge) && (
            <button
              onClick={clearFilters}
              className="hidden lg:flex items-center gap-1 font-body text-sm text-stamp-red hover:text-stamp-red/80 ml-4"
            >
              <X size={14} /> Clear All
            </button>
          )}
        </div>
      </section>

      <div className="px-4 sm:px-10 lg:px-[5vw] py-10 flex flex-col lg:flex-row gap-10">

        {/* ─── Desktop Sidebar ─── */}
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-32 space-y-10">

            <div className="space-y-4">
              <h4 className="font-body text-base font-medium text-ink-black">Categories</h4>
              <div className="space-y-1">
                <SidebarFilterItem label="All Products" selected={!selectedCategory} onClick={() => updateFilters("category", null)} />
                {categories.map((cat) => (
                  <SidebarFilterItem
                    key={cat.slug}
                    label={cat.name}
                    selected={selectedCategory === cat.name || selectedCategory === cat.slug}
                    onClick={() => updateFilters("category", selectedCategory === cat.name ? null : cat.name)}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-body text-base font-medium text-ink-black">Age Range</h4>
              <div className="space-y-1">
                {ageRanges.map((age) => (
                  <SidebarFilterItem
                    key={age}
                    label={`${age} Years`}
                    selected={selectedAge === age}
                    onClick={() => updateFilters("age", selectedAge === age ? null : age)}
                  />
                ))}
              </div>
            </div>

          </div>
        </aside>

        {/* ─── Product Grid ─── */}
        <div className="flex-1">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 sm:gap-x-8 gap-y-10 sm:gap-y-14">
              {filteredProducts.map((product: any, idx: number) => (
                <ProductCardNike
                  key={product._id}
                  product={product}
                  priority={idx < 4}
                  index={idx + 1}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="font-body text-xl font-medium text-gray-500 mb-6">
                No items match your selected filters.
              </p>
              <button
                onClick={clearFilters}
                className="bg-ink-black text-white px-6 py-3 rounded-full font-body text-sm font-medium hover:bg-ink-black/80 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ─── Mobile Filter Drawer ─── */}
      <AnimatePresence>
        {isMobileFiltersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-ink-black/40 z-[1000]"
              onClick={() => setIsMobileFiltersOpen(false)}
            />
            <motion.div
              initial={reduced ? { opacity: 0 } : { y: "100%" }}
              animate={reduced ? { opacity: 1 } : { y: 0 }}
              exit={reduced ? { opacity: 0 } : { y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="fixed inset-x-0 bottom-0 h-[80vh] bg-paper-white z-[1001] flex flex-col overflow-hidden border-t border-rule-grey"
            >
              <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100">
                <h2 className="font-body text-xl font-medium text-ink-black">Filters</h2>
                <button onClick={() => setIsMobileFiltersOpen(false)} className="text-gray-400 hover:text-ink-black transition-colors bg-gray-100 p-2 rounded-full">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
                {/* Sort */}
                <div className="space-y-4">
                  <h3 className="font-body text-sm font-medium text-ink-black">Sort by</h3>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: "featured", label: "Featured" },
                      { value: "newest", label: "Newest" },
                      { value: "price-low", label: "Price ↑" },
                      { value: "price-high", label: "Price ↓" },
                    ].map((opt) => (
                      <FilterPill
                        key={opt.value}
                        label={opt.label}
                        selected={sortBy === opt.value}
                        onClick={() => setSortBy(opt.value)}
                      />
                    ))}
                  </div>
                </div>

                {/* Categories */}
                <div className="space-y-4">
                  <h3 className="font-body text-sm font-medium text-ink-black">Category</h3>
                  <div className="flex flex-wrap gap-2">
                    <FilterPill label="All" selected={!selectedCategory} onClick={() => updateFilters("category", null)} />
                    {categories.map((cat) => (
                      <FilterPill
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
                  <h3 className="font-body text-sm font-medium text-ink-black">Age Range</h3>
                  <div className="flex flex-wrap gap-2">
                    {ageRanges.map((age) => (
                      <FilterPill
                        key={age}
                        label={`${age} yrs`}
                        selected={selectedAge === age}
                        onClick={() => updateFilters("age", selectedAge === age ? null : age)}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 bg-white space-y-3 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
                <button
                  className="w-full bg-ink-black text-white font-body text-sm font-medium py-4 rounded-full hover:bg-ink-black/90 transition-colors"
                  onClick={() => setIsMobileFiltersOpen(false)}
                >
                  View {filteredProducts.length} Products
                </button>
                {(selectedCategory || selectedAge) && (
                  <button
                    onClick={() => { clearFilters(); setIsMobileFiltersOpen(false); }}
                    className="w-full py-2 font-body text-sm font-medium text-stamp-red hover:opacity-70 transition-opacity"
                  >
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
    <Suspense fallback={<div className="min-h-screen bg-transparent" />}>
      <ShopContent initialProducts={initialProducts} />
    </Suspense>
  );
}
