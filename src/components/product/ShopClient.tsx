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
  isStampRed = false,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  isStampRed?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "font-mono text-[10px] uppercase tracking-[0.12em] px-3 py-1.5 border transition-colors duration-200 whitespace-nowrap",
        selected
          ? isStampRed
            ? "bg-stamp-red text-paper-white border-stamp-red"
            : "bg-ink-black text-paper-white border-ink-black"
          : "bg-paper-white text-ink-black border-rule-grey hover:border-ink-black"
      )}
    >
      {label}
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

      {/* ─── Sticky utility bar ─── */}
      <section className="relative bg-paper-white/80 backdrop-blur-xl border-b border-rule-grey">

        {/* Page title row */}
        <div className="px-4 sm:px-10 lg:px-[5vw] py-5 flex items-baseline justify-between border-b border-rule-grey">
          <h1 className="font-display text-[32px] md:text-[44px] uppercase text-ink-black leading-none tracking-[-0.01em]">
            {selectedCategory || "All Toys"}
          </h1>
          <span className="font-mono text-[11px] text-rule-grey uppercase tracking-[0.1em]">
            {filteredProducts.length} items
          </span>
        </div>

        {/* Filter + sort strip */}
        <div className="px-4 sm:px-10 lg:px-[5vw] py-3 flex items-center gap-3 overflow-x-auto no-scrollbar">

          {/* Mobile: Filters button */}
          <button
            onClick={() => setIsMobileFiltersOpen(true)}
            className={cn(
              "lg:hidden flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] px-3 py-1.5 border border-rule-grey hover:border-ink-black transition-colors shrink-0",
              activeFilterCount > 0 && "border-stamp-red text-stamp-red"
            )}
          >
            Filter
            {activeFilterCount > 0 && (
              <span className="bg-stamp-red text-paper-white w-4 h-4 flex items-center justify-center text-[9px] leading-none">{activeFilterCount}</span>
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
          <div className="flex-1 hidden lg:block" />

          {/* Sort */}
          <div className="relative flex items-center gap-1.5 shrink-0">
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-rule-grey hidden sm:block">Sort</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none font-mono text-[10px] uppercase tracking-[0.12em] text-ink-black bg-paper-white border border-rule-grey px-3 py-1.5 pr-6 focus:outline-none focus:border-ink-black cursor-pointer"
                suppressHydrationWarning
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="price-low">Price ↑</option>
                <option value="price-high">Price ↓</option>
              </select>
              <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-black pointer-events-none" />
            </div>
          </div>

          {/* Active filter clear */}
          {(selectedCategory || selectedAge) && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.1em] text-stamp-red shrink-0 hover:opacity-70 transition-opacity"
            >
              <X size={10} /> Clear
            </button>
          )}
        </div>
      </section>

      <div className="px-4 sm:px-10 lg:px-[5vw] py-10 flex flex-col lg:flex-row gap-10">

        {/* ─── Desktop Sidebar ─── */}
        <aside className="hidden lg:block w-48 shrink-0">
          <div className="sticky top-40 space-y-8">

            <div className="space-y-3">
              <h4 className="font-mono text-[10px] uppercase tracking-[0.12em] text-rule-grey border-b border-rule-grey pb-2">Category</h4>
              <div className="space-y-2">
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
            </div>

            <div className="space-y-3">
              <h4 className="font-mono text-[10px] uppercase tracking-[0.12em] text-rule-grey border-b border-rule-grey pb-2">Age Range</h4>
              <div className="space-y-2">
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

            {(selectedCategory || selectedAge) && (
              <button
                onClick={clearFilters}
                className="font-mono text-[10px] uppercase tracking-[0.1em] text-stamp-red flex items-center gap-1 hover:opacity-70 transition-opacity"
              >
                <X size={10} /> Clear filters
              </button>
            )}
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
              <p className="font-display text-[48px] uppercase text-rule-grey leading-none mb-4">—</p>
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-rule-grey mb-6">
                No items match your filters
              </p>
              <button
                onClick={clearFilters}
                className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-black border border-ink-black px-5 py-2.5 hover:bg-ink-black hover:text-paper-white transition-colors"
              >
                Clear Filters
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
              <div className="flex justify-between items-center px-6 py-5 border-b border-rule-grey">
                <h2 className="font-display text-[22px] uppercase text-ink-black">Filter & Sort</h2>
                <button onClick={() => setIsMobileFiltersOpen(false)} className="text-ink-black hover:text-rule-grey transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
                {/* Sort */}
                <div className="space-y-3">
                  <h3 className="font-mono text-[10px] uppercase tracking-[0.12em] text-rule-grey border-b border-rule-grey pb-2">Sort by</h3>
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
                <div className="space-y-3">
                  <h3 className="font-mono text-[10px] uppercase tracking-[0.12em] text-rule-grey border-b border-rule-grey pb-2">Category</h3>
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
                <div className="space-y-3">
                  <h3 className="font-mono text-[10px] uppercase tracking-[0.12em] text-rule-grey border-b border-rule-grey pb-2">Age Range</h3>
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

              <div className="p-6 border-t border-rule-grey bg-paper-grey space-y-3">
                <button
                  className="w-full bg-ink-black text-paper-white font-mono text-[11px] uppercase tracking-[0.15em] py-4 hover:bg-rule-grey hover:text-ink-black transition-colors"
                  onClick={() => setIsMobileFiltersOpen(false)}
                >
                  View {filteredProducts.length} Items
                </button>
                {(selectedCategory || selectedAge) && (
                  <button
                    onClick={() => { clearFilters(); setIsMobileFiltersOpen(false); }}
                    className="w-full py-2 font-mono text-[10px] uppercase tracking-[0.1em] text-stamp-red hover:opacity-70 transition-opacity"
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
