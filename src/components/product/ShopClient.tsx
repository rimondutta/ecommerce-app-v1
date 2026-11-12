"use client";

import { useState, useMemo, Suspense, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { m, AnimatePresence, useReducedMotion } from "framer-motion";
import { X, ChevronDown, ChevronLeft, ChevronRight, Check } from "lucide-react";
import ProductCardRimon from "@/components/ui/product-card-rimon";
import { cn } from "@/lib/utils";
import {
  matchesAgeRange,
  getColorFallback,
  isColorLight,
  VariationFilterGroup,
  sortAgeRanges,
} from "@/lib/ageHelper";

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface CategoryItem {
  slug: string;
  name: string;
}

export type ShopProduct = React.ComponentProps<typeof ProductCardRimon>["product"] & {
  createdAt?: string;
  hasVariations?: boolean;
  variationTypes?: Array<{
    _id: string;
    name: string;
    slug: string;
    displayType?: string;
  }>;
  variants?: Array<{
    sku?: string;
    combinationLabel?: string;
    price: number;
    comparePrice?: number;
    stock: number;
    isActive?: boolean;
    images?: Array<string | { url: string; alt?: string }>;
    combination?: Array<{
      variationType?: { _id: string; name?: string; slug?: string } | string;
      variationValue?:
        | { _id: string; value?: string; slug?: string; colorHex?: string }
        | string;
    }>;
  }>;
};

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
        "font-display font-semibold text-sm px-4 py-2 rounded-xl transition-all duration-200 whitespace-nowrap",
        selected
          ? "bg-joy-cobalt text-white shadow-[0_4px_12px_rgba(45,91,227,0.3)]"
          : "bg-joy-mist text-joy-navy hover:bg-joy-cobalt/10 hover:text-joy-cobalt"
      )}
    >
      {label}
    </button>
  );
}

function formatAgeLabel(age: string): string {
  const clean = age.trim();
  if (/\b(?:year|years|yrs|yr|month|months|mth|m)\b/i.test(clean)) {
    return clean;
  }
  return `${clean} Years`;
}

function formatAgePill(age: string): string {
  const clean = age.trim();
  if (/\b(?:year|years|yrs|yr|month|months|mth|m)\b/i.test(clean)) {
    return clean;
  }
  return `${clean} yrs`;
}

function SidebarFilterItem({
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
      className="flex items-center gap-3 w-full group py-1.5 text-left"
    >
      <div
        className={cn(
          "w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all shrink-0",
          selected
            ? "bg-joy-cobalt border-joy-cobalt"
            : "border-joy-rule bg-white group-hover:border-joy-cobalt/50"
        )}
      >
        {selected && (
          <svg
            width="8"
            height="8"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        )}
      </div>
      <span
        className={cn(
          "font-display font-medium text-sm transition-colors",
          selected ? "text-joy-navy font-semibold" : "text-joy-muted group-hover:text-joy-navy"
        )}
      >
        {label}
      </span>
    </button>
  );
}

function productMatchesVariants(product: ShopProduct, selectedSlugs: string[]): boolean {
  if (!selectedSlugs || selectedSlugs.length === 0) return true;
  if (!product.hasVariations || !Array.isArray(product.variants) || product.variants.length === 0) {
    return false;
  }

  // Every selected slug should be satisfied by at least one active variant of the product
  return selectedSlugs.every((slug) => {
    const target = slug.toLowerCase();
    return product.variants!.some((v) => {
      if (v.isActive === false) return false;

      // 1. Check combination items
      if (Array.isArray(v.combination)) {
        const match = v.combination.some((c) => {
          const valObj = c.variationValue;
          if (!valObj) return false;
          if (typeof valObj === "object") {
            const vSlug = valObj.slug?.toLowerCase();
            const vVal = valObj.value?.toLowerCase();
            return vSlug === target || vVal === target;
          }
          if (typeof valObj === "string") {
            return valObj.toLowerCase() === target;
          }
          return false;
        });
        if (match) return true;
      }

      // 2. Check combinationLabel (e.g. "Red / M")
      if (v.combinationLabel && typeof v.combinationLabel === "string") {
        const parts = v.combinationLabel.toLowerCase().split(/\s*[\/\-,]\s*/);
        if (parts.includes(target) || v.combinationLabel.toLowerCase().includes(target)) {
          return true;
        }
      }

      // 3. Check SKU (e.g. "PRD-RED")
      if (v.sku && typeof v.sku === "string" && v.sku.toLowerCase().includes(target)) {
        return true;
      }

      return false;
    });
  });
}

function ShopGridPure({
  initialProducts,
  allCategories,
  variationFilters,
  ageRanges: ageRangesProp,
  pagination,
  categoryParam,
  ageParam,
  variantParam,
  searchParam,
}: {
  initialProducts: ShopProduct[];
  allCategories?: CategoryItem[];
  variationFilters?: VariationFilterGroup[];
  ageRanges?: string[];
  pagination?: PaginationInfo;
  categoryParam: string | null;
  ageParam: string | null;
  variantParam: string | null;
  searchParam: string | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reduced = useReducedMotion() ?? false;
  const [isPending, startTransition] = useTransition();

  const [sortBy, setSortBy] = useState("featured");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const selectedVariantSlugs = useMemo(() => {
    if (!variantParam) return [];
    return variantParam
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
  }, [variantParam]);

  const updateFilters = (key: string, value: string | null) => {
    const currentParams = new URLSearchParams(searchParams?.toString() || "");
    currentParams.delete("page");

    if (categoryParam) currentParams.set("category", categoryParam);
    if (ageParam) currentParams.set("age", ageParam);
    if (searchParam) currentParams.set("search", searchParam);
    if (variantParam) currentParams.set("variant", variantParam);

    if (value === null) currentParams.delete(key);
    else currentParams.set(key, value);

    startTransition(() => {
      const q = currentParams.toString();
      router.push(q ? `/products?${q}` : "/products", { scroll: false });
    });
  };

  const toggleVariant = (slug: string) => {
    const clean = slug.trim().toLowerCase();
    let updated: string[];
    if (selectedVariantSlugs.includes(clean)) {
      updated = selectedVariantSlugs.filter((s) => s !== clean);
    } else {
      updated = [...selectedVariantSlugs, clean];
    }
    updateFilters("variant", updated.length > 0 ? updated.join(",") : null);
  };

  const clearVariantGroup = (group: VariationFilterGroup) => {
    const groupSlugs = group.values.map((v) => v.slug.toLowerCase());
    const remaining = selectedVariantSlugs.filter((s) => !groupSlugs.includes(s));
    updateFilters("variant", remaining.length > 0 ? remaining.join(",") : null);
  };

  const goToPage = (newPage: number) => {
    const currentParams = new URLSearchParams(searchParams?.toString() || "");
    currentParams.set("page", newPage.toString());
    startTransition(() => {
      router.push(`/products?${currentParams.toString()}`, { scroll: true });
    });
  };

  const categories = useMemo(() => {
    if (allCategories && allCategories.length > 0) {
      return allCategories;
    }
    const m = new Map<string, string>();
    initialProducts.forEach((p: ShopProduct) => {
      const cat = typeof p.category === "object" && p.category !== null ? p.category : null;
      if (cat?.name && cat?.slug) m.set(cat.slug, cat.name);
    });
    return Array.from(m.entries()).map(([slug, name]) => ({ slug, name }));
  }, [allCategories, initialProducts]);

  const ageRanges = useMemo(() => {
    // 1. Prefer server-provided dynamic list (from DB distinct)
    if (ageRangesProp && ageRangesProp.length > 0) return ageRangesProp;
    // 2. Derive from current page's products as fallback
    const seen = new Set<string>();
    initialProducts.forEach((p) => {
      if (p.ageRange && typeof p.ageRange === "string" && p.ageRange.trim()) {
        seen.add(p.ageRange.trim());
      }
    });
    // 3. If nothing in products, return a sensible static default
    return seen.size > 0 ? sortAgeRanges(Array.from(seen)) : ["0-1", "1-3", "3-5", "5-8", "8+"];
  }, [ageRangesProp, initialProducts]);

  const filteredProducts = useMemo(() => {
    const result = initialProducts.filter((p: ShopProduct) => {
      const cat = typeof p.category === "object" && p.category !== null ? p.category : null;
      const catMatch = !categoryParam || cat?.slug === categoryParam || cat?.name === categoryParam;
      const ageMatch = !ageParam || matchesAgeRange(p.ageRange, ageParam);
      const searchMatch = !searchParam || p.title.toLowerCase().includes(searchParam.toLowerCase());
      const variantMatch = productMatchesVariants(p, selectedVariantSlugs);
      return catMatch && ageMatch && searchMatch && variantMatch;
    });

    if (sortBy === "price-low") result.sort((a: ShopProduct, b: ShopProduct) => a.price - b.price);
    if (sortBy === "price-high") result.sort((a: ShopProduct, b: ShopProduct) => b.price - a.price);
    if (sortBy === "newest")
      result.sort(
        (a: ShopProduct, b: ShopProduct) =>
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
    return result;
  }, [initialProducts, categoryParam, ageParam, sortBy, searchParam, selectedVariantSlugs]);

  const clearFilters = () => {
    startTransition(() => {
      router.push("/products", { scroll: false });
    });
  };

  const activeFilterCount = [
    categoryParam,
    ageParam,
    ...(selectedVariantSlugs.length > 0 ? selectedVariantSlugs : []),
  ].filter(Boolean).length;

  const totalDisplayCount = pagination?.total ?? filteredProducts.length;

  return (
    <div suppressHydrationWarning className="flex-1 bg-joy-cream min-h-screen text-joy-navy font-body">
      <section className="relative bg-joy-cream pb-4 pt-32 lg:pt-36">
        <div className="px-4 sm:px-8 lg:px-[5vw] py-5 flex items-end justify-between border-b border-joy-rule">
          <h1 className="font-display font-bold text-4xl md:text-5xl text-joy-navy tracking-tight">
            {categoryParam || "All Toys"}
          </h1>
          <span className="font-body text-sm text-joy-muted mb-1">
            {totalDisplayCount} {totalDisplayCount === 1 ? "product" : "products"}
          </span>
        </div>

        <div className="px-4 sm:px-8 lg:px-[5vw] py-4 flex items-center justify-between gap-4">
          <button
            onClick={() => setIsMobileFiltersOpen(true)}
            className={cn(
              "lg:hidden flex items-center gap-2 font-display font-semibold text-sm px-4 py-2.5 rounded-xl border-2 transition-all",
              activeFilterCount > 0
                ? "border-joy-cobalt text-joy-cobalt bg-joy-cobalt/5"
                : "border-joy-rule text-joy-navy hover:border-joy-cobalt/50"
            )}
          >
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-joy-cobalt text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>

          <div className="hidden lg:flex items-center gap-2 flex-wrap">
            <FilterPill
              label="All"
              selected={!categoryParam}
              onClick={() => updateFilters("category", null)}
            />
            {categories.map((cat) => (
              <FilterPill
                key={cat.slug}
                label={cat.name}
                selected={categoryParam === cat.name || categoryParam === cat.slug}
                onClick={() =>
                  updateFilters("category", categoryParam === cat.name ? null : cat.name)
                }
              />
            ))}
          </div>

          <div className="flex-1 hidden lg:block" />

          <div className="relative flex items-center gap-3 shrink-0">
            <span className="font-display font-medium text-sm text-joy-muted hidden sm:block">
              Sort by:
            </span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none font-display font-semibold text-sm text-joy-navy bg-joy-mist px-4 py-2 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-joy-cobalt/30 cursor-pointer"
                suppressHydrationWarning
              >
                <option value="featured">Featured</option>
                <option value="newest">New Arrivals</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
              <ChevronDown
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-joy-muted pointer-events-none"
              />
            </div>
          </div>

          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="hidden lg:flex items-center gap-1 font-display font-semibold text-sm text-joy-coral hover:text-joy-coral/70 ml-2"
            >
              <X size={14} /> Clear
            </button>
          )}
        </div>
      </section>

      <div
        className={cn(
          "px-4 sm:px-8 lg:px-[5vw] py-10 flex flex-col lg:flex-row gap-10",
          isPending && "opacity-70 pointer-events-none transition-opacity"
        )}
      >
        {/* ── DESKTOP SIDEBAR ── */}
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-32 space-y-6 bg-white border border-joy-rule rounded-2xl p-6 shadow-[0_2px_12px_rgba(26,31,58,0.04)]">
            {/* Category Filter */}
            <div className="space-y-3">
              <h4 className="font-display font-bold text-joy-navy text-xs uppercase tracking-wider text-joy-muted">
                Category
              </h4>
              <div className="space-y-1">
                <SidebarFilterItem
                  label="All Products"
                  selected={!categoryParam}
                  onClick={() => updateFilters("category", null)}
                />
                {categories.map((cat) => (
                  <SidebarFilterItem
                    key={cat.slug}
                    label={cat.name}
                    selected={categoryParam === cat.name || categoryParam === cat.slug}
                    onClick={() =>
                      updateFilters("category", categoryParam === cat.name ? null : cat.name)
                    }
                  />
                ))}
              </div>
            </div>

            {ageRanges.length > 0 && (
            <>
            <div className="border-t border-joy-rule" />

            {/* Age Range Filter */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-display font-bold text-joy-navy text-xs uppercase tracking-wider text-joy-muted">
                  Age Range
                </h4>
                {ageParam && (
                  <button
                    type="button"
                    onClick={() => updateFilters("age", null)}
                    className="text-[11px] font-semibold text-joy-muted hover:text-joy-coral transition-colors"
                  >
                    Reset
                  </button>
                )}
              </div>
              <div className="space-y-1">
                {ageRanges.map((age) => (
                  <SidebarFilterItem
                    key={age}
                    label={formatAgeLabel(age)}
                    selected={ageParam === age}
                    onClick={() => updateFilters("age", ageParam === age ? null : age)}
                  />
                ))}
              </div>
            </div>
            </>
            )}

            {/* Variation Filters (Colors, Sizes, etc.) */}
            {variationFilters &&
              variationFilters.length > 0 &&
              variationFilters.map((group) => {
                const isSwatch =
                  group.displayType === "swatch" ||
                  group.name.toLowerCase().includes("color") ||
                  group.name.toLowerCase().includes("colour") ||
                  group.name.toLowerCase().includes("রং") ||
                  group.values.some((v) => Boolean(v.colorHex));

                const hasSelected = group.values.some((v) =>
                  selectedVariantSlugs.includes(v.slug.toLowerCase())
                );

                return (
                  <div key={group._id} className="pt-6 border-t border-joy-rule space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-display font-bold text-joy-navy text-xs uppercase tracking-wider text-joy-muted">
                        {group.name}
                      </h4>
                      {hasSelected && (
                        <button
                          type="button"
                          onClick={() => clearVariantGroup(group)}
                          className="text-[11px] font-semibold text-joy-muted hover:text-joy-coral transition-colors"
                        >
                          Reset
                        </button>
                      )}
                    </div>

                    {isSwatch ? (
                      /* Color Swatches Grid */
                      <div className="flex flex-wrap gap-2.5 pt-1">
                        {group.values.map((val) => {
                          const isSelected = selectedVariantSlugs.includes(
                            val.slug.toLowerCase()
                          );
                          const hex = val.colorHex || getColorFallback(val.value);
                          const light = isColorLight(hex);

                          return (
                            <button
                              key={val._id}
                              type="button"
                              onClick={() => toggleVariant(val.slug)}
                              title={`${val.value} (${group.name})`}
                              className={cn(
                                "relative w-7 h-7 rounded-full transition-all flex items-center justify-center focus:outline-none",
                                isSelected
                                  ? "ring-2 ring-joy-cobalt ring-offset-2 scale-110 shadow-sm"
                                  : "hover:scale-110 border border-joy-rule/80 hover:border-joy-navy/40"
                              )}
                              style={{ backgroundColor: hex }}
                            >
                              {isSelected && (
                                <Check
                                  size={13}
                                  className={cn(
                                    "stroke-[3]",
                                    light ? "text-gray-900" : "text-white"
                                  )}
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      /* Size / Option Button Pills */
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {group.values.map((val) => {
                          const isSelected = selectedVariantSlugs.includes(
                            val.slug.toLowerCase()
                          );
                          return (
                            <button
                              key={val._id}
                              type="button"
                              onClick={() => toggleVariant(val.slug)}
                              className={cn(
                                "px-3 py-1.5 rounded-xl text-xs font-semibold font-display border transition-all duration-150",
                                isSelected
                                  ? "bg-joy-cobalt text-white border-joy-cobalt shadow-[0_2px_8px_rgba(45,91,227,0.25)]"
                                  : "bg-joy-mist/70 text-joy-navy border-joy-rule hover:border-joy-cobalt/40 hover:bg-joy-mist"
                              )}
                            >
                              {val.value}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </aside>

        {/* ── MAIN PRODUCTS GRID ── */}
        <div className="flex-1">
          {/* Active Filter Pills Bar */}
          {activeFilterCount > 0 && (
            <div className="flex items-center gap-2 flex-wrap mb-6 pb-4 border-b border-joy-rule">
              <span className="text-xs font-semibold text-joy-muted uppercase tracking-wider mr-1">
                Active filters:
              </span>
              {categoryParam && (
                <span className="inline-flex items-center gap-1.5 bg-joy-mist text-joy-navy text-xs font-semibold px-3 py-1.5 rounded-full border border-joy-rule">
                  Category: {categoryParam}
                  <button
                    type="button"
                    onClick={() => updateFilters("category", null)}
                    className="hover:text-joy-coral text-joy-muted transition-colors"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {ageParam && (
                <span className="inline-flex items-center gap-1.5 bg-joy-mist text-joy-navy text-xs font-semibold px-3 py-1.5 rounded-full border border-joy-rule">
                  Age: {ageParam} Years
                  <button
                    type="button"
                    onClick={() => updateFilters("age", null)}
                    className="hover:text-joy-coral text-joy-muted transition-colors"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {selectedVariantSlugs.map((slug) => (
                <span
                  key={slug}
                  className="inline-flex items-center gap-1.5 bg-joy-cobalt/10 text-joy-cobalt text-xs font-semibold px-3 py-1.5 rounded-full border border-joy-cobalt/20"
                >
                  {slug.toUpperCase()}
                  <button
                    type="button"
                    onClick={() => toggleVariant(slug)}
                    className="hover:text-joy-coral text-joy-cobalt transition-colors"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-semibold text-joy-coral hover:underline ml-2"
              >
                Clear all
              </button>
            </div>
          )}

          {filteredProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-8 sm:gap-y-12">
                {filteredProducts.map((product: ShopProduct, idx: number) => (
                  <ProductCardRimon
                    key={product._id}
                    product={product}
                    priority={idx < 4}
                    index={idx + 1}
                  />
                ))}
              </div>

              {/* ── Pagination Controls ── */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12 pt-8 border-t border-joy-rule">
                  <button
                    onClick={() => goToPage(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-semibold font-display border border-joy-rule bg-white text-joy-navy hover:bg-joy-mist disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft size={16} />
                    Prev
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                      .filter(
                        (p) =>
                          p === 1 ||
                          p === pagination.totalPages ||
                          Math.abs(p - pagination.page) <= 1
                      )
                      .map((p, index, array) => {
                        const prev = array[index - 1];
                        const hasGap = prev && p - prev > 1;
                        return (
                          <div key={p} className="flex items-center gap-1">
                            {hasGap && <span className="px-2 text-joy-muted">…</span>}
                            <button
                              onClick={() => goToPage(p)}
                              className={cn(
                                "w-10 h-10 rounded-xl text-sm font-semibold font-display transition-all flex items-center justify-center",
                                p === pagination.page
                                  ? "bg-joy-cobalt text-white shadow-[0_4px_12px_rgba(45,91,227,0.3)]"
                                  : "bg-white text-joy-navy border border-joy-rule hover:bg-joy-mist"
                              )}
                            >
                              {p}
                            </button>
                          </div>
                        );
                      })}
                  </div>
                  <button
                    onClick={() => goToPage(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-semibold font-display border border-joy-rule bg-white text-joy-navy hover:bg-joy-mist disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-joy-mist flex items-center justify-center text-3xl">
                🧸
              </div>
              <p className="font-display font-semibold text-xl text-joy-navy">
                Nothing here yet.
              </p>
              <p className="font-body text-joy-muted text-sm">
                Try adjusting your filters to find what you&apos;re looking for.
              </p>
              <button
                onClick={clearFilters}
                className="bg-joy-cobalt text-white px-6 py-3 rounded-xl font-display font-bold text-sm hover:bg-joy-cobalt/90 transition-colors shadow-[0_4px_16px_rgba(45,91,227,0.3)]"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── MOBILE FILTERS DRAWER ── */}
      <AnimatePresence>
        {isMobileFiltersOpen && (
          <>
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-ink-black/40 z-[1000]"
              onClick={() => setIsMobileFiltersOpen(false)}
            />
            <m.div
              initial={reduced ? { opacity: 0 } : { y: "100%" }}
              animate={reduced ? { opacity: 1 } : { y: 0 }}
              exit={reduced ? { opacity: 0 } : { y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="fixed inset-x-0 bottom-0 h-[82vh] bg-joy-cream z-[1001] flex flex-col overflow-hidden rounded-t-3xl shadow-[0_-20px_60px_rgba(26,31,58,0.15)]"
            >
              <div className="flex justify-between items-center px-6 py-5 border-b border-joy-rule">
                <h2 className="font-display font-bold text-xl text-joy-navy">Filters</h2>
                <button
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="text-joy-muted hover:text-joy-navy transition-colors bg-joy-mist p-2 rounded-xl"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
                {/* Sort by */}
                <div className="space-y-4">
                  <h3 className="font-body text-sm font-semibold text-joy-navy uppercase tracking-wider">
                    Sort by
                  </h3>
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

                {/* Category */}
                <div className="space-y-4">
                  <h3 className="font-body text-sm font-semibold text-joy-navy uppercase tracking-wider">
                    Category
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <FilterPill
                      label="All"
                      selected={!categoryParam}
                      onClick={() => updateFilters("category", null)}
                    />
                    {categories.map((cat) => (
                      <FilterPill
                        key={cat.slug}
                        label={cat.name}
                        selected={categoryParam === cat.name || categoryParam === cat.slug}
                        onClick={() =>
                          updateFilters(
                            "category",
                            categoryParam === cat.name ? null : cat.name
                          )
                        }
                      />
                    ))}
                  </div>
                </div>

                {/* Age Range */}
                {ageRanges.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-body text-sm font-semibold text-joy-navy uppercase tracking-wider">
                      Age Range
                    </h3>
                    {ageParam && (
                      <button
                        type="button"
                        onClick={() => updateFilters("age", null)}
                        className="text-xs font-semibold text-joy-coral"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {ageRanges.map((age) => (
                      <FilterPill
                        key={age}
                        label={formatAgePill(age)}
                        selected={ageParam === age}
                        onClick={() =>
                          updateFilters("age", ageParam === age ? null : age)
                        }
                      />
                    ))}
                  </div>
                </div>
                )}

                {/* Variation Filters (Colors, Sizes, etc.) */}
                {variationFilters &&
                  variationFilters.length > 0 &&
                  variationFilters.map((group) => {
                    const isSwatch =
                      group.displayType === "swatch" ||
                      group.name.toLowerCase().includes("color") ||
                      group.name.toLowerCase().includes("colour") ||
                      group.name.toLowerCase().includes("রং") ||
                      group.values.some((v) => Boolean(v.colorHex));

                    const hasSelected = group.values.some((v) =>
                      selectedVariantSlugs.includes(v.slug.toLowerCase())
                    );

                    return (
                      <div key={group._id} className="space-y-4 pt-4 border-t border-joy-rule">
                        <div className="flex items-center justify-between">
                          <h3 className="font-body text-sm font-semibold text-joy-navy uppercase tracking-wider">
                            {group.name}
                          </h3>
                          {hasSelected && (
                            <button
                              type="button"
                              onClick={() => clearVariantGroup(group)}
                              className="text-xs font-semibold text-joy-coral"
                            >
                              Reset
                            </button>
                          )}
                        </div>

                        {isSwatch ? (
                          <div className="flex flex-wrap gap-3">
                            {group.values.map((val) => {
                              const isSelected = selectedVariantSlugs.includes(
                                val.slug.toLowerCase()
                              );
                              const hex = val.colorHex || getColorFallback(val.value);
                              const light = isColorLight(hex);

                              return (
                                <button
                                  key={val._id}
                                  type="button"
                                  onClick={() => toggleVariant(val.slug)}
                                  className={cn(
                                    "flex items-center gap-2 px-3 py-2 rounded-xl border transition-all text-xs font-semibold",
                                    isSelected
                                      ? "bg-joy-cobalt text-white border-joy-cobalt shadow-sm"
                                      : "bg-white text-joy-navy border-joy-rule"
                                  )}
                                >
                                  <span
                                    className="w-4 h-4 rounded-full border border-black/10 shrink-0 flex items-center justify-center"
                                    style={{ backgroundColor: hex }}
                                  >
                                    {isSelected && (
                                      <Check
                                        size={9}
                                        className={cn(
                                          "stroke-[3]",
                                          light ? "text-gray-900" : "text-white"
                                        )}
                                      />
                                    )}
                                  </span>
                                  {val.value}
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {group.values.map((val) => {
                              const isSelected = selectedVariantSlugs.includes(
                                val.slug.toLowerCase()
                              );
                              return (
                                <button
                                  key={val._id}
                                  type="button"
                                  onClick={() => toggleVariant(val.slug)}
                                  className={cn(
                                    "font-display font-semibold text-xs px-3.5 py-2 rounded-xl border transition-all",
                                    isSelected
                                      ? "bg-joy-cobalt text-white border-joy-cobalt shadow-sm"
                                      : "bg-white text-joy-navy border-joy-rule hover:border-joy-cobalt/40"
                                  )}
                                >
                                  {val.value}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>

              <div className="p-6 border-t border-joy-rule bg-white space-y-3">
                <button
                  className="w-full bg-joy-cobalt text-white font-display font-bold text-sm py-4 rounded-xl hover:bg-joy-cobalt/90 transition-colors shadow-[0_4px_16px_rgba(45,91,227,0.3)]"
                  onClick={() => setIsMobileFiltersOpen(false)}
                >
                  View {totalDisplayCount}{" "}
                  {totalDisplayCount === 1 ? "Product" : "Products"}
                </button>
                {activeFilterCount > 0 && (
                  <button
                    onClick={() => {
                      clearFilters();
                      setIsMobileFiltersOpen(false);
                    }}
                    className="w-full py-2 font-display font-semibold text-sm text-joy-coral hover:opacity-70 transition-opacity"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            </m.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function ShopContent({
  initialProducts,
  allCategories,
  variationFilters,
  ageRanges,
  pagination,
}: {
  initialProducts: ShopProduct[];
  allCategories?: CategoryItem[];
  variationFilters?: VariationFilterGroup[];
  ageRanges?: string[];
  pagination?: PaginationInfo;
}) {
  const searchParams = useSearchParams();

  return (
    <ShopGridPure
      initialProducts={initialProducts}
      allCategories={allCategories}
      variationFilters={variationFilters}
      ageRanges={ageRanges}
      pagination={pagination}
      categoryParam={searchParams.get("category")}
      ageParam={searchParams.get("age")}
      variantParam={searchParams.get("variant")}
      searchParam={searchParams.get("search")}
    />
  );
}

export default function ShopClient({
  initialProducts,
  allCategories,
  variationFilters,
  ageRanges,
  pagination,
}: {
  initialProducts: ShopProduct[];
  allCategories?: CategoryItem[];
  variationFilters?: VariationFilterGroup[];
  ageRanges?: string[];
  pagination?: PaginationInfo;
}) {
  return (
    <Suspense
      fallback={
        <ShopGridPure
          initialProducts={initialProducts}
          allCategories={allCategories}
          variationFilters={variationFilters}
          ageRanges={ageRanges}
          pagination={pagination}
          categoryParam={null}
          ageParam={null}
          variantParam={null}
          searchParam={null}
        />
      }
    >
      <ShopContent
        initialProducts={initialProducts}
        allCategories={allCategories}
        variationFilters={variationFilters}
        ageRanges={ageRanges}
        pagination={pagination}
      />
    </Suspense>
  );
}
