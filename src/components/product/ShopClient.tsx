"use client";

import React, { useState, useMemo, Suspense, useTransition, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { m, AnimatePresence, useReducedMotion } from "framer-motion";
import { X, ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import ProductCard, { ProductCardData } from "@/components/ui/ProductCard";
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
  _id?: string;
  slug: string;
  name: string;
  count?: number;
}

export type ShopProduct = ProductCardData & {
  createdAt?: string;
  hasVariations?: boolean;
  ageRange?: string;
  tags?: string[];
  rating?: number;
  reviewCount?: number;
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

// Preset discount options matching reference image
const PRESET_DISCOUNTS = [
  { label: "Up to 5%", min: 0.1, max: 5 },
  { label: "5% - 10%", min: 5, max: 10 },
  { label: "10% - 15%", min: 10, max: 15 },
  { label: "15% - 25%", min: 15, max: 25 },
  { label: "25% or more", min: 25, max: 100 },
];

function productMatchesVariants(
  product: ShopProduct,
  selectedSlugs: string[],
  variationFilters?: VariationFilterGroup[]
): boolean {
  if (!selectedSlugs || selectedSlugs.length === 0) return true;
  if (!product.hasVariations || !Array.isArray(product.variants) || product.variants.length === 0) {
    return false;
  }

  // Lookup map for unpopulated variationValue IDs
  const idToValueMap = new Map<string, { slug: string; value: string }>();
  if (variationFilters) {
    variationFilters.forEach((g) => {
      g.values?.forEach((v) => {
        idToValueMap.set(String(v._id), {
          slug: v.slug.toLowerCase(),
          value: v.value.toLowerCase(),
        });
      });
    });
  }

  return selectedSlugs.every((slug) => {
    const target = slug.toLowerCase();
    return product.variants!.some((v) => {
      if (v.isActive === false) return false;

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
            const mapped = idToValueMap.get(valObj);
            if (mapped && (mapped.slug === target || mapped.value === target)) {
              return true;
            }
            return valObj.toLowerCase() === target;
          }
          return false;
        });
        if (match) return true;
      }

      if (v.combinationLabel && typeof v.combinationLabel === "string") {
        const parts = v.combinationLabel.toLowerCase().split(/\s*[\/\-,]\s*/);
        if (parts.includes(target) || v.combinationLabel.toLowerCase().includes(target)) {
          return true;
        }
      }

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
  availableSizes,
  availableColors,
  ageRanges: ageRangesProp,
  pagination,
  categoryParam,
  ageParam,
  variantParam,
  searchParam,
  tagParam,
  minPriceParam,
  maxPriceParam,
  ratingParam,
  discountParam,
}: {
  initialProducts: ShopProduct[];
  allCategories?: CategoryItem[];
  variationFilters?: VariationFilterGroup[];
  availableSizes?: Array<{ label: string; slug: string }>;
  availableColors?: Array<{ name: string; hex: string; slug: string }>;
  ageRanges?: string[];
  pagination?: PaginationInfo;
  categoryParam: string | null;
  ageParam: string | null;
  variantParam: string | null;
  searchParam: string | null;
  tagParam: string | null;
  minPriceParam: string | null;
  maxPriceParam: string | null;
  ratingParam: string | null;
  discountParam: string | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reduced = useReducedMotion() ?? false;
  const [isPending, startTransition] = useTransition();

  const [sortBy, setSortBy] = useState("featured");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Price inputs local state
  const [minPriceInput, setMinPriceInput] = useState(minPriceParam || "");
  const [maxPriceInput, setMaxPriceInput] = useState(maxPriceParam || "");

  // Scroll ref for category list
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  // Multi-category selected slugs/names
  const selectedCategorySlugs = useMemo(() => {
    if (!categoryParam) return [];
    return categoryParam
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
  }, [categoryParam]);

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
    if (tagParam) currentParams.set("tag", tagParam);
    if (minPriceParam) currentParams.set("minPrice", minPriceParam);
    if (maxPriceParam) currentParams.set("maxPrice", maxPriceParam);
    if (ratingParam) currentParams.set("rating", ratingParam);
    if (discountParam) currentParams.set("discount", discountParam);

    if (value === null || value === "") currentParams.delete(key);
    else currentParams.set(key, value);

    startTransition(() => {
      const q = currentParams.toString();
      router.push(q ? `/products?${q}` : "/products", { scroll: false });
    });
  };

  const toggleCategory = (slugOrName: string) => {
    const clean = slugOrName.trim().toLowerCase();
    let updated: string[];
    if (selectedCategorySlugs.includes(clean)) {
      updated = selectedCategorySlugs.filter((s) => s !== clean);
    } else {
      updated = [...selectedCategorySlugs, clean];
    }
    updateFilters("category", updated.length > 0 ? updated.join(",") : null);
  };

  const handleApplyPrice = () => {
    const currentParams = new URLSearchParams(searchParams?.toString() || "");
    currentParams.delete("page");

    if (minPriceInput.trim()) {
      currentParams.set("minPrice", minPriceInput.trim());
    } else {
      currentParams.delete("minPrice");
    }

    if (maxPriceInput.trim()) {
      currentParams.set("maxPrice", maxPriceInput.trim());
    } else {
      currentParams.delete("maxPrice");
    }

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

  const goToPage = (newPage: number) => {
    const currentParams = new URLSearchParams(searchParams?.toString() || "");
    currentParams.set("page", newPage.toString());
    startTransition(() => {
      router.push(`/products?${currentParams.toString()}`, { scroll: true });
    });
  };

  // Pure dynamic categories from database / server
  const categories: CategoryItem[] = useMemo(() => {
    if (allCategories && allCategories.length > 0) {
      return allCategories;
    }
    const m = new Map<string, CategoryItem>();
    initialProducts.forEach((p: ShopProduct) => {
      const cat = typeof p.category === "object" && p.category !== null ? p.category : null;
      if (cat?.name && cat?.slug) {
        m.set(cat.slug.toLowerCase(), { slug: cat.slug, name: cat.name });
      }
    });
    return Array.from(m.values());
  }, [allCategories, initialProducts]);

  // Compute product count per category dynamically
  const fallbackCategoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    initialProducts.forEach((p: ShopProduct) => {
      const cat = typeof p.category === "object" && p.category !== null ? p.category : null;
      if (cat?.slug) {
        const s = cat.slug.toLowerCase();
        counts.set(s, (counts.get(s) || 0) + 1);
      }
      if (cat?.name) {
        const n = cat.name.toLowerCase();
        counts.set(n, (counts.get(n) || 0) + 1);
      }
    });
    return counts;
  }, [initialProducts]);

  const ageRanges = useMemo(() => {
    if (ageRangesProp && ageRangesProp.length > 0) return ageRangesProp;
    const seen = new Set<string>();
    initialProducts.forEach((p) => {
      if (p.ageRange && typeof p.ageRange === "string" && p.ageRange.trim()) {
        seen.add(p.ageRange.trim());
      }
    });
    return seen.size > 0 ? sortAgeRanges(Array.from(seen)) : ["0-1", "1-3", "3-5", "5-8", "8+"];
  }, [ageRangesProp, initialProducts]);

  const filteredProducts = useMemo(() => {
    const result = initialProducts.filter((p: ShopProduct) => {
      const cat = typeof p.category === "object" && p.category !== null ? p.category : null;

      // Category matching (supports multi-category)
      const catMatch =
        selectedCategorySlugs.length === 0 ||
        selectedCategorySlugs.some(
          (sel) =>
            cat?.slug?.toLowerCase() === sel ||
            cat?.name?.toLowerCase() === sel
        );

      const ageMatch = !ageParam || matchesAgeRange(p.ageRange, ageParam);
      const searchMatch = !searchParam || p.title.toLowerCase().includes(searchParam.toLowerCase());
      const variantMatch = productMatchesVariants(p, selectedVariantSlugs, variationFilters);
      const tagMatch = !tagParam || (Array.isArray(p.tags) && p.tags.some((t) => t.toLowerCase() === tagParam.toLowerCase()));

      // Price filter
      const minP = minPriceParam ? parseFloat(minPriceParam) : 0;
      const maxP = maxPriceParam ? parseFloat(maxPriceParam) : Infinity;
      const priceMatch = p.price >= minP && p.price <= maxP;

      // Rating filter
      const minR = ratingParam ? parseFloat(ratingParam) : 0;
      const ratingMatch = minR === 0 || ((p.rating || 4.5) >= minR);

      // Discount filter
      let discountMatch = true;
      if (discountParam) {
        const discPct = p.compareAtPrice && p.compareAtPrice > p.price
          ? Math.round(((p.compareAtPrice - p.price) / p.compareAtPrice) * 100)
          : 0;
        const [dMin, dMax] = discountParam.split("-").map(Number);
        if (!isNaN(dMin)) {
          discountMatch = discPct >= dMin && (isNaN(dMax) ? true : discPct <= dMax);
        }
      }

      return catMatch && ageMatch && searchMatch && variantMatch && tagMatch && priceMatch && ratingMatch && discountMatch;
    });

    if (sortBy === "price-low") result.sort((a: ShopProduct, b: ShopProduct) => a.price - b.price);
    if (sortBy === "price-high") result.sort((a: ShopProduct, b: ShopProduct) => b.price - a.price);
    if (sortBy === "newest")
      result.sort(
        (a: ShopProduct, b: ShopProduct) =>
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
    return result;
  }, [initialProducts, selectedCategorySlugs, ageParam, sortBy, searchParam, selectedVariantSlugs, tagParam, minPriceParam, maxPriceParam, ratingParam, discountParam, variationFilters]);

  // Pure dynamic sizes extracted from variable products and variation types added in dashboard
  const dynamicSizes = useMemo(() => {
    // 1. If server passed availableSizes that are in actual variable products
    if (availableSizes && availableSizes.length > 0) {
      return availableSizes;
    }

    // 2. Client-side dynamic discovery: check if any product actually has variations
    const variableProds = initialProducts.filter(
      (p) => p.hasVariations && Array.isArray(p.variants) && p.variants.length > 0
    );

    if (variableProds.length === 0 && (!availableSizes || availableSizes.length === 0)) {
      // No variable products at all -> do NOT show SIZE
      return [];
    }

    const sizeGroup = variationFilters?.find((g) => {
      const n = (g.name || "").toLowerCase();
      const s = (g.slug || "").toLowerCase();
      return (
        s === "size" ||
        s === "sizes" ||
        n === "size" ||
        n === "sizes" ||
        s.includes("size") ||
        n.includes("size") ||
        n.includes("সাইজ")
      );
    });

    const sizesMap = new Map<string, { label: string; slug: string }>();

    variableProds.forEach((p) => {
      p.variants?.forEach((v) => {
        if (v.isActive === false) return;

        if (Array.isArray(v.combination)) {
          v.combination.forEach((c) => {
            const valObj = c.variationValue;
            const typeObj = c.variationType;

            const isSizeType =
              (typeof typeObj === "object" &&
                typeObj !== null &&
                ((typeObj.slug && typeObj.slug.toLowerCase().includes("size")) ||
                  (typeObj.name && typeObj.name.toLowerCase().includes("size")))) ||
              (sizeGroup &&
                (c.variationType === sizeGroup._id ||
                  (typeof typeObj === "object" && typeObj?._id === sizeGroup._id)));

            if (typeof valObj === "object" && valObj !== null && valObj.value) {
              if (isSizeType || !typeObj) {
                const s = (valObj.slug || valObj.value).toLowerCase();
                if (!sizesMap.has(s)) {
                  sizesMap.set(s, { label: valObj.value, slug: valObj.slug || s });
                }
              }
            } else if (typeof valObj === "string" && sizeGroup) {
              const matchedVal = sizeGroup.values.find((gv) => gv._id === valObj || gv.slug === valObj);
              if (matchedVal) {
                const s = matchedVal.slug.toLowerCase();
                if (!sizesMap.has(s)) {
                  sizesMap.set(s, { label: matchedVal.value, slug: matchedVal.slug });
                }
              }
            }
          });
        }

        if (sizesMap.size === 0 && v.combinationLabel && typeof v.combinationLabel === "string") {
          const parts = v.combinationLabel.split(/\s*[\/\-,]\s*/).map((s) => s.trim());
          parts.forEach((part) => {
            if (part) {
              const matchedVal = sizeGroup?.values.find(
                (gv) => gv.value.toLowerCase() === part.toLowerCase() || gv.slug.toLowerCase() === part.toLowerCase()
              );
              if (matchedVal) {
                const s = matchedVal.slug.toLowerCase();
                if (!sizesMap.has(s)) {
                  sizesMap.set(s, { label: matchedVal.value, slug: matchedVal.slug });
                }
              }
            }
          });
        }
      });
    });

    if (sizesMap.size === 0 && variableProds.length > 0 && sizeGroup && sizeGroup.values.length > 0) {
      sizeGroup.values.forEach((v) => {
        sizesMap.set(v.slug.toLowerCase(), { label: v.value, slug: v.slug });
      });
    }

    return Array.from(sizesMap.values());
  }, [availableSizes, variationFilters, initialProducts]);

  // Pure dynamic colors extracted from variable products and variation types added in dashboard
  const dynamicColors = useMemo(() => {
    // 1. If server passed availableColors that are in actual variable products
    if (availableColors && availableColors.length > 0) {
      return availableColors;
    }

    // 2. Client-side dynamic discovery: check if any product actually has variations
    const variableProds = initialProducts.filter(
      (p) => p.hasVariations && Array.isArray(p.variants) && p.variants.length > 0
    );

    if (variableProds.length === 0 && (!availableColors || availableColors.length === 0)) {
      // No variable products at all -> do NOT show COLORS
      return [];
    }

    const colorGroup = variationFilters?.find((g) => {
      const n = (g.name || "").toLowerCase();
      const s = (g.slug || "").toLowerCase();
      const d = (g.displayType || "").toLowerCase();
      return (
        d === "swatch" ||
        s === "color" ||
        s === "colour" ||
        s === "colors" ||
        n === "color" ||
        n === "colour" ||
        n === "colors" ||
        s.includes("color") ||
        n.includes("color") ||
        n.includes("colour") ||
        n.includes("রং")
      );
    });

    const colorsMap = new Map<string, { name: string; hex: string; slug: string }>();

    variableProds.forEach((p) => {
      p.variants?.forEach((v) => {
        if (v.isActive === false) return;

        if (Array.isArray(v.combination)) {
          v.combination.forEach((c) => {
            const valObj = c.variationValue;
            const typeObj = c.variationType;

            const isColorType =
              (typeof typeObj === "object" &&
                typeObj !== null &&
                ((typeObj.slug && typeObj.slug.toLowerCase().includes("color")) ||
                  (typeObj.name && typeObj.name.toLowerCase().includes("color")))) ||
              (colorGroup &&
                (c.variationType === colorGroup._id ||
                  (typeof typeObj === "object" && typeObj?._id === colorGroup._id)));

            if (typeof valObj === "object" && valObj !== null && valObj.value) {
              if (isColorType || valObj.colorHex || !typeObj) {
                const s = (valObj.slug || valObj.value).toLowerCase();
                if (!colorsMap.has(s)) {
                  colorsMap.set(s, {
                    name: valObj.value,
                    hex: valObj.colorHex || getColorFallback(valObj.value),
                    slug: valObj.slug || s,
                  });
                }
              }
            } else if (typeof valObj === "string" && colorGroup) {
              const matchedVal = colorGroup.values.find((gv) => gv._id === valObj || gv.slug === valObj);
              if (matchedVal) {
                const s = matchedVal.slug.toLowerCase();
                if (!colorsMap.has(s)) {
                  colorsMap.set(s, {
                    name: matchedVal.value,
                    hex: matchedVal.colorHex || getColorFallback(matchedVal.value),
                    slug: matchedVal.slug,
                  });
                }
              }
            }
          });
        }

        if (colorsMap.size === 0 && v.combinationLabel && typeof v.combinationLabel === "string") {
          const parts = v.combinationLabel.split(/\s*[\/\-,]\s*/).map((s) => s.trim());
          parts.forEach((part) => {
            if (part) {
              const matchedVal = colorGroup?.values.find(
                (gv) => gv.value.toLowerCase() === part.toLowerCase() || gv.slug.toLowerCase() === part.toLowerCase()
              );
              if (matchedVal) {
                const s = matchedVal.slug.toLowerCase();
                if (!colorsMap.has(s)) {
                  colorsMap.set(s, {
                    name: matchedVal.value,
                    hex: matchedVal.colorHex || getColorFallback(matchedVal.value),
                    slug: matchedVal.slug,
                  });
                }
              }
            }
          });
        }
      });
    });

    if (colorsMap.size === 0 && variableProds.length > 0 && colorGroup && colorGroup.values.length > 0) {
      colorGroup.values.forEach((v) => {
        colorsMap.set(v.slug.toLowerCase(), {
          name: v.value,
          hex: v.colorHex || getColorFallback(v.value),
          slug: v.slug,
        });
      });
    }

    return Array.from(colorsMap.values());
  }, [availableColors, variationFilters, initialProducts]);

  const clearFilters = () => {
    setMinPriceInput("");
    setMaxPriceInput("");
    startTransition(() => {
      router.push("/products", { scroll: false });
    });
  };

  const activeFilterCount = [
    categoryParam,
    ageParam,
    tagParam,
    minPriceParam,
    maxPriceParam,
    ratingParam,
    discountParam,
    ...(selectedVariantSlugs.length > 0 ? selectedVariantSlugs : []),
  ].filter(Boolean).length;

  const totalDisplayCount = pagination?.total ?? filteredProducts.length;

  // Helper to scroll category container up/down
  const scrollCategories = (direction: "up" | "down") => {
    if (!categoryScrollRef.current) return;
    categoryScrollRef.current.scrollBy({
      top: direction === "up" ? -60 : 60,
      behavior: "smooth",
    });
  };

  /* ─────────────────────────────────────────────────────────────
     RENDER: Reusable Filter Panel (Shared for Desktop & Mobile)
     Matching the Reference UI with 100% Dynamic Categories
     ───────────────────────────────────────────────────────────── */
  const renderFilterContent = () => (
    <div className="space-y-6 text-[#2D1810]">
      {/* ── 1. CATEGORY (100% Dynamic from Database) ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#2D1810]">
            CATEGORY
          </h3>
          {categories.length > 5 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => scrollCategories("up")}
                className="p-0.5 text-stone-500 hover:text-[#2D1810] transition-colors cursor-pointer"
                aria-label="Scroll categories up"
              >
                <ChevronUp size={14} strokeWidth={2.5} />
              </button>
              <button
                type="button"
                onClick={() => scrollCategories("down")}
                className="p-0.5 text-stone-500 hover:text-[#2D1810] transition-colors cursor-pointer"
                aria-label="Scroll categories down"
              >
                <ChevronDown size={14} strokeWidth={2.5} />
              </button>
            </div>
          )}
        </div>

        {/* Scrollable list of database categories */}
        <div
          ref={categoryScrollRef}
          className="max-h-52 overflow-y-auto space-y-2.5 pr-2 custom-filter-scroll"
        >
          {categories.length > 0 ? (
            categories.map((cat) => {
              const isSelected =
                selectedCategorySlugs.includes(cat.slug.toLowerCase()) ||
                selectedCategorySlugs.includes(cat.name.toLowerCase());
              const count =
                cat.count !== undefined
                  ? cat.count
                  : fallbackCategoryCounts.get(cat.slug.toLowerCase()) ??
                    fallbackCategoryCounts.get(cat.name.toLowerCase());

              return (
                <label
                  key={cat.slug}
                  className="flex items-center justify-between gap-3 text-sm font-normal text-stone-700 hover:text-[#2D1810] cursor-pointer select-none group py-0.5"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleCategory(cat.slug || cat.name)}
                      className="w-4 h-4 rounded border-stone-300 text-[#2D1810] accent-[#2D1810] focus:ring-0 cursor-pointer shrink-0"
                    />
                    <span
                      className={cn(
                        "transition-colors truncate",
                        isSelected && "font-semibold text-[#2D1810]"
                      )}
                    >
                      {cat.name}
                    </span>
                  </div>
                  {count !== undefined && count > 0 && (
                    <span className="text-xs text-stone-400 font-normal shrink-0">
                      ({count})
                    </span>
                  )}
                </label>
              );
            })
          ) : (
            <p className="text-xs text-stone-400 py-1">No categories found</p>
          )}
        </div>
      </div>

      {/* ── 2. PRICE RANGE ── */}
      <div className="pt-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#2D1810] mb-3">
          PRICE RANGE
        </h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPriceInput}
            onChange={(e) => setMinPriceInput(e.target.value)}
            className="w-full bg-white text-[#2D1810] text-sm text-center placeholder:text-stone-400 rounded-2xl border border-stone-200 py-2 px-3 focus:outline-none focus:border-[#2D1810] transition-colors"
          />
          <span className="text-stone-400 font-medium px-1">-</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPriceInput}
            onChange={(e) => setMaxPriceInput(e.target.value)}
            className="w-full bg-white text-[#2D1810] text-sm text-center placeholder:text-stone-400 rounded-2xl border border-stone-200 py-2 px-3 focus:outline-none focus:border-[#2D1810] transition-colors"
          />
        </div>
        <button
          type="button"
          onClick={handleApplyPrice}
          className="w-full mt-2.5 py-2.5 px-4 rounded-full bg-[#F5EDE8] hover:bg-[#EBDDD4] text-[#2D1810] font-bold text-xs uppercase tracking-wider transition-colors text-center cursor-pointer shadow-xs"
        >
          Apply
        </button>
      </div>

      {/* ── 3. RATING ── */}
      <div className="pt-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#2D1810] mb-3">
          RATING
        </h3>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((stars) => {
            const isSelected = ratingParam === String(stars);
            return (
              <label
                key={stars}
                className="flex items-center gap-2.5 text-sm cursor-pointer select-none group"
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => updateFilters("rating", isSelected ? null : String(stars))}
                  className="w-4 h-4 rounded border-stone-300 text-[#2D1810] accent-[#2D1810] focus:ring-0 cursor-pointer"
                />
                <div className="flex items-center gap-1 text-[#C88A2D]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className="text-base leading-none">
                      {i < stars ? "★" : "☆"}
                    </span>
                  ))}
                  <span className="text-xs font-medium text-[#78716C] ml-1.5">
                    & up
                  </span>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* ── 4. COLORS (Dynamic: shows only when admin adds color in variable product) ── */}
      {dynamicColors.length > 0 && (
        <div className="pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#2D1810] mb-3">
            COLORS
          </h3>
          <div className="flex items-center gap-2.5 flex-wrap">
            {dynamicColors.map((col) => {
              const isSelected =
                selectedVariantSlugs.includes(col.slug.toLowerCase()) ||
                selectedVariantSlugs.includes(col.name.toLowerCase());
              const isLight = isColorLight(col.hex);
              return (
                <button
                  key={col.slug}
                  type="button"
                  onClick={() => toggleVariant(col.slug)}
                  title={col.name}
                  className={cn(
                    "w-7 h-7 rounded-full transition-all flex items-center justify-center cursor-pointer focus:outline-none",
                    isLight && "border border-stone-300",
                    isSelected
                      ? "ring-2 ring-offset-2 ring-[#2D1810] scale-110 shadow-xs"
                      : "hover:scale-105"
                  )}
                  style={{ backgroundColor: col.hex }}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* ── 5. SIZE (Dynamic: shows only when admin adds size in variable product) ── */}
      {dynamicSizes.length > 0 && (
        <div className="pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#2D1810] mb-3">
            SIZE
          </h3>
          <div className="flex flex-wrap gap-2">
            {dynamicSizes.map((size) => {
              const isSelected =
                selectedVariantSlugs.includes(size.slug.toLowerCase()) ||
                selectedVariantSlugs.includes(size.label.toLowerCase());
              return (
                <button
                  key={size.slug}
                  type="button"
                  onClick={() => toggleVariant(size.slug)}
                  className={cn(
                    "rounded-2xl px-3.5 py-2 text-xs font-medium transition-colors cursor-pointer",
                    isSelected
                      ? "bg-[#2D1810] text-white font-bold shadow-xs"
                      : "bg-[#F5EDE8] text-[#2D1810] hover:bg-[#EBDDD4]"
                  )}
                >
                  {size.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 6. DISCOUNT ── */}
      <div className="pt-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#2D1810] mb-3">
          DISCOUNT
        </h3>
        <div className="space-y-2">
          {PRESET_DISCOUNTS.map((disc) => {
            const key = `${disc.min}-${disc.max}`;
            const isSelected = discountParam === key;
            return (
              <label
                key={key}
                className="flex items-center gap-2.5 text-sm font-normal text-stone-700 hover:text-[#2D1810] cursor-pointer select-none group"
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => updateFilters("discount", isSelected ? null : key)}
                  className="w-4 h-4 rounded border-stone-300 text-[#2D1810] accent-[#2D1810] focus:ring-0 cursor-pointer"
                />
                <span className={cn("transition-colors", isSelected && "font-semibold text-[#2D1810]")}>
                  {disc.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div suppressHydrationWarning className="flex-1 bg-[#FAF7F2] min-h-screen text-[#2D1810] font-body">
      {/* ── Top Header Section ── */}
      <section className="relative pb-4 pt-28 lg:pt-32">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-end justify-between border-b border-stone-200/80">
          <div>
            <h1 className="font-extrabold text-3xl md:text-4xl text-[#2D1810] tracking-tight">
              {tagParam === "specialoffer" ? "Special Deals" : (categoryParam ? categoryParam.split(",").join(", ") : "All Products")}
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Find the perfect match from our curated collection
            </p>
          </div>
          <span className="text-sm font-medium text-stone-500 mb-1">
            {totalDisplayCount} {totalDisplayCount === 1 ? "product" : "products"}
          </span>
        </div>

        {/* ── Mobile Filter Trigger & Desktop Sort ── */}
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setIsMobileFiltersOpen(true)}
            className={cn(
              "lg:hidden flex items-center gap-2 font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-full border transition-all cursor-pointer",
              activeFilterCount > 0
                ? "border-[#2D1810] text-white bg-[#2D1810]"
                : "border-stone-300 text-[#2D1810] bg-white hover:border-[#2D1810]"
            )}
          >
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-[#F5EDE8] text-[#2D1810] w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>

          <div className="flex-1 hidden lg:block" />

          {/* Sort By Dropdown */}
          <div className="relative flex items-center gap-2 ml-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500 hidden sm:block">
              Sort by:
            </span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none font-semibold text-xs sm:text-sm text-[#2D1810] bg-white border border-stone-200 px-4 py-2 pr-8 rounded-full focus:outline-none focus:border-[#2D1810] cursor-pointer shadow-xs"
                suppressHydrationWarning
              >
                <option value="featured">Featured</option>
                <option value="newest">New Arrivals</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
              <ChevronDown
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Layout: Sidebar & Product Grid ── */}
      <div
        className={cn(
          "max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-16 flex flex-col lg:flex-row gap-8 items-start",
          isPending && "opacity-70 pointer-events-none transition-opacity"
        )}
      >
        {/* ── DESKTOP SIDEBAR (Reference UI Design) ── */}
        <aside className="hidden lg:block w-72 shrink-0 self-start sticky top-[168px] z-20">
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/80 shadow-xs">
            {renderFilterContent()}
          </div>
        </aside>

        {/* ── MAIN PRODUCTS GRID ── */}
        <div className="flex-1 w-full">
          {/* Active Filter Badges */}
          {activeFilterCount > 0 && (
            <div className="flex items-center gap-2 flex-wrap mb-6 pb-4 border-b border-stone-200/80">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-400 mr-1">
                Active:
              </span>
              {selectedCategorySlugs.map((slug) => {
                const matched = categories.find(
                  (c) =>
                    c.slug.toLowerCase() === slug ||
                    c.name.toLowerCase() === slug
                );
                const label = matched?.name || slug;
                return (
                  <span
                    key={slug}
                    className="inline-flex items-center gap-1.5 bg-[#F5EDE8] text-[#2D1810] text-xs font-semibold px-3 py-1.5 rounded-full border border-stone-200"
                  >
                    Category: {label}
                    <button
                      type="button"
                      onClick={() => toggleCategory(slug)}
                      className="hover:text-red-600 transition-colors cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </span>
                );
              })}
              {tagParam && (
                <span className="inline-flex items-center gap-1.5 bg-[#F5EDE8] text-[#2D1810] text-xs font-semibold px-3 py-1.5 rounded-full border border-stone-200">
                  {tagParam}
                  <button
                    type="button"
                    onClick={() => updateFilters("tag", null)}
                    className="hover:text-red-600 transition-colors cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {(minPriceParam || maxPriceParam) && (
                <span className="inline-flex items-center gap-1.5 bg-[#F5EDE8] text-[#2D1810] text-xs font-semibold px-3 py-1.5 rounded-full border border-stone-200">
                  ৳{minPriceParam || "0"} - ৳{maxPriceParam || "Max"}
                  <button
                    type="button"
                    onClick={() => {
                      setMinPriceInput("");
                      setMaxPriceInput("");
                      updateFilters("minPrice", null);
                      updateFilters("maxPrice", null);
                    }}
                    className="hover:text-red-600 transition-colors cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {ratingParam && (
                <span className="inline-flex items-center gap-1.5 bg-[#F5EDE8] text-[#2D1810] text-xs font-semibold px-3 py-1.5 rounded-full border border-stone-200">
                  {ratingParam}★ & up
                  <button
                    type="button"
                    onClick={() => updateFilters("rating", null)}
                    className="hover:text-red-600 transition-colors cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {discountParam && (
                <span className="inline-flex items-center gap-1.5 bg-[#F5EDE8] text-[#2D1810] text-xs font-semibold px-3 py-1.5 rounded-full border border-stone-200">
                  {discountParam}% off
                  <button
                    type="button"
                    onClick={() => updateFilters("discount", null)}
                    className="hover:text-red-600 transition-colors cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {selectedVariantSlugs.map((slug) => (
                <span
                  key={slug}
                  className="inline-flex items-center gap-1.5 bg-[#F5EDE8] text-[#2D1810] text-xs font-semibold px-3 py-1.5 rounded-full border border-stone-200 capitalize"
                >
                  {slug}
                  <button
                    type="button"
                    onClick={() => toggleVariant(slug)}
                    className="hover:text-red-600 transition-colors cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-bold text-red-600 underline underline-offset-2 ml-2 hover:opacity-80 transition-opacity cursor-pointer"
              >
                Clear all
              </button>
            </div>
          )}

          {filteredProducts.length > 0 ? (
            <>
              {/* Product grid matching homepage: 2 on mobile, 3 on md/lg, 4 on 2xl */}
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-3.5 sm:gap-4.5">
                {filteredProducts.map((product: ShopProduct, idx: number) => (
                  <div key={product._id} className="h-full">
                    <ProductCard
                      product={product}
                      badgeColor="red"
                      cartButtonColor="purple"
                      priority={idx < 4}
                    />
                  </div>
                ))}
              </div>

              {/* ── Pagination Controls ── */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12 pt-8 border-t border-stone-200/80">
                  <button
                    onClick={() => goToPage(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="flex items-center gap-1 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold border border-stone-200 bg-white text-[#2D1810] hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
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
                            {hasGap && <span className="px-2 text-stone-400">…</span>}
                            <button
                              onClick={() => goToPage(p)}
                              className={cn(
                                "w-9 h-9 sm:w-10 sm:h-10 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center justify-center",
                                p === pagination.page
                                  ? "bg-[#2D1810] text-white shadow-xs"
                                  : "bg-white text-[#2D1810] border border-stone-200 hover:bg-stone-50"
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
                    className="flex items-center gap-1 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold border border-stone-200 bg-white text-[#2D1810] hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-stone-200/80 p-8 text-center gap-3">
              <div className="w-16 h-16 rounded-full bg-[#F5EDE8] flex items-center justify-center text-3xl">
                🔍
              </div>
              <h2 className="font-extrabold text-xl text-[#2D1810]">
                No matching products found
              </h2>
              <p className="text-sm text-stone-500 max-w-sm">
                Try adjusting or clearing your filters to see more available products.
              </p>
              <button
                onClick={clearFilters}
                className="mt-2 bg-[#2D1810] text-white px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider hover:bg-[#1E110A] transition-colors shadow-xs"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── MOBILE FILTERS DRAWER (Matching Reference UI) ── */}
      <AnimatePresence>
        {isMobileFiltersOpen && (
          <>
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs z-[1000]"
              onClick={() => setIsMobileFiltersOpen(false)}
            />
            <m.div
              initial={reduced ? { opacity: 0 } : { y: "100%" }}
              animate={reduced ? { opacity: 1 } : { y: 0 }}
              exit={reduced ? { opacity: 0 } : { y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="fixed inset-x-0 bottom-0 h-[85vh] bg-white z-[1001] flex flex-col overflow-hidden rounded-t-[32px] shadow-2xl"
            >
              <div className="flex justify-between items-center px-6 py-4 border-b border-stone-200">
                <h2 className="font-extrabold text-lg text-[#2D1810]">Filter Products</h2>
                <button
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="w-9 h-9 rounded-full bg-[#F5EDE8] flex items-center justify-center text-[#2D1810] hover:bg-[#EBDDD4] transition-colors"
                >
                  <X size={18} strokeWidth={2.5} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-6 custom-filter-scroll">
                {renderFilterContent()}
              </div>

              <div className="p-4 px-6 border-t border-stone-200 bg-white flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    clearFilters();
                    setIsMobileFiltersOpen(false);
                  }}
                  className="flex-1 py-3 font-bold text-xs uppercase tracking-wider text-[#2D1810] bg-[#F5EDE8] hover:bg-[#EBDDD4] rounded-full transition-colors text-center cursor-pointer"
                >
                  Reset
                </button>
                <button
                  type="button"
                  className="flex-2 py-3 font-bold text-xs uppercase tracking-wider text-white bg-[#2D1810] hover:bg-[#1E110A] rounded-full transition-colors text-center shadow-xs cursor-pointer"
                  onClick={() => setIsMobileFiltersOpen(false)}
                >
                  View ({totalDisplayCount})
                </button>
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
  availableSizes,
  availableColors,
  ageRanges,
  pagination,
  initialTag,
  initialMinPrice,
  initialMaxPrice,
  initialRating,
  initialDiscount,
}: {
  initialProducts: ShopProduct[];
  allCategories?: CategoryItem[];
  variationFilters?: VariationFilterGroup[];
  availableSizes?: Array<{ label: string; slug: string }>;
  availableColors?: Array<{ name: string; hex: string; slug: string }>;
  ageRanges?: string[];
  pagination?: PaginationInfo;
  initialTag?: string | null;
  initialMinPrice?: string | null;
  initialMaxPrice?: string | null;
  initialRating?: string | null;
  initialDiscount?: string | null;
}) {
  const searchParams = useSearchParams();

  return (
    <ShopGridPure
      initialProducts={initialProducts}
      allCategories={allCategories}
      variationFilters={variationFilters}
      availableSizes={availableSizes}
      availableColors={availableColors}
      ageRanges={ageRanges}
      pagination={pagination}
      categoryParam={searchParams.get("category")}
      ageParam={searchParams.get("age")}
      variantParam={searchParams.get("variant")}
      searchParam={searchParams.get("search")}
      tagParam={searchParams.get("tag") || initialTag || null}
      minPriceParam={searchParams.get("minPrice") || initialMinPrice || null}
      maxPriceParam={searchParams.get("maxPrice") || initialMaxPrice || null}
      ratingParam={searchParams.get("rating") || initialRating || null}
      discountParam={searchParams.get("discount") || initialDiscount || null}
    />
  );
}

export default function ShopClient({
  initialProducts,
  allCategories,
  variationFilters,
  availableSizes,
  availableColors,
  ageRanges,
  pagination,
  initialTag,
  initialMinPrice,
  initialMaxPrice,
  initialRating,
  initialDiscount,
}: {
  initialProducts: ShopProduct[];
  allCategories?: CategoryItem[];
  variationFilters?: VariationFilterGroup[];
  availableSizes?: Array<{ label: string; slug: string }>;
  availableColors?: Array<{ name: string; hex: string; slug: string }>;
  ageRanges?: string[];
  pagination?: PaginationInfo;
  initialTag?: string | null;
  initialMinPrice?: string | null;
  initialMaxPrice?: string | null;
  initialRating?: string | null;
  initialDiscount?: string | null;
}) {
  return (
    <Suspense
      fallback={
        <ShopGridPure
          initialProducts={initialProducts}
          allCategories={allCategories}
          variationFilters={variationFilters}
          availableSizes={availableSizes}
          availableColors={availableColors}
          ageRanges={ageRanges}
          pagination={pagination}
          categoryParam={null}
          ageParam={null}
          variantParam={null}
          searchParam={null}
          tagParam={initialTag || null}
          minPriceParam={initialMinPrice || null}
          maxPriceParam={initialMaxPrice || null}
          ratingParam={initialRating || null}
          discountParam={initialDiscount || null}
        />
      }
    >
      <ShopContent
        initialProducts={initialProducts}
        allCategories={allCategories}
        variationFilters={variationFilters}
        availableSizes={availableSizes}
        availableColors={availableColors}
        ageRanges={ageRanges}
        pagination={pagination}
        initialTag={initialTag}
        initialMinPrice={initialMinPrice}
        initialMaxPrice={initialMaxPrice}
        initialRating={initialRating}
        initialDiscount={initialDiscount}
      />
    </Suspense>
  );
}
