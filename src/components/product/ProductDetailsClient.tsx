"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/providers/CartProvider";
import { useWishlist } from "@/store/wishlistStore";
import { useToast } from "@/components/playshelf/Toast";
import {
  Star,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ShoppingCart,
  Zap,
  Heart,
  Share2,
  Truck,
  ShieldCheck,
  RefreshCcw,
} from "lucide-react";
import { cn, getOptimizedCloudinaryUrl, extractPiecesCount, toBengaliNumber, formatPcsLabel } from "@/lib/utils";
import {
  trackViewContent,
  trackAddToCart,
  trackAddToWishlist,
} from "@/lib/fbPixel";
import OrderWithAIButton from "@/components/ai/OrderWithAIButton";
import AISuggestions from "@/components/ai/AISuggestions";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ProductCard, { ProductCardData } from "@/components/ui/ProductCard";

/* ─────────────────────────── Types ─────────────────────────── */

interface VariationValue {
  _id: string;
  value: string;
  colorHex?: string;
}

interface VariationType {
  _id: string;
  name: string;
  slug?: string;
  displayType?: string;
  values?: VariationValue[];
}

interface VariantCombination {
  variationType: { _id: string; name?: string };
  variationValue: { _id: string; value?: string; colorHex?: string };
}

interface ProductVariant {
  _id: string;
  price: number;
  comparePrice?: number;
  combinationLabel?: string;
  stock: number;
  isActive: boolean;
  combination: VariantCombination[];
  images?: Array<string | { url: string; alt?: string }>;
}

interface ProductImage {
  url: string;
  alt?: string;
}

interface ProductReview {
  _id?: string;
  title?: string;
  name?: string;
  rating: number;
  text?: string;
  date: string | Date;
  status?: string;
}

export interface DetailedProduct {
  _id: string;
  title: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  description?: string;
  longDescription?: string;
  descriptionHeading?: string;
  keyFeatures?: string[];
  attributes?: Array<{ name: string; value: string }>;
  specifications?: Array<{ name: string; value: string }>;
  ageRange?: string;
  images?: ProductImage[];
  category?: { _id?: string; name?: string; slug?: string };
  inventory?: number;
  rating?: number;
  reviewCount?: number;
  reviews?: ProductReview[];
  hasVariations?: boolean;
  variationTypes?: VariationType[];
  variants?: ProductVariant[];
  isFreeShipping?: boolean;
  shippingRate?: number;
  soldCount?: number;
}

/* ─────────────────────────── Star row ─────────────────────────── */

function StarRow({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={size}
          className={
            i < Math.floor(rating)
              ? "fill-amber-400 text-amber-400"
              : "fill-gray-200 text-gray-200"
          }
        />
      ))}
    </div>
  );
}

/* ─────────────────────────── Markdown renderer ─────────────────────────── */

const MD_COMPONENTS = {
  h1: ({ children }: { children?: React.ReactNode }) => (
    <h1 className="text-xl font-bold text-[#1E1B4B] mt-4 mb-2">{children}</h1>
  ),
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h2 className="text-lg font-bold text-[#1E1B4B] mt-3 mb-2">{children}</h2>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="text-base font-bold text-[#1E1B4B] mt-2 mb-1">{children}</h3>
  ),
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="list-disc pl-5 space-y-1 mb-2">{children}</ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="list-decimal pl-5 space-y-1 mb-2">{children}</ol>
  ),
  a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[#5428D8] hover:underline font-semibold"
    >
      {children}
    </a>
  ),
};

/* ── Helpers for Pieces / Bundle Variation Cards & Auto-Compare ── */

function isPiecesVariation(vt: VariationType & { values: VariationValue[] }): boolean {
  if (vt.displayType === "swatch" || vt.displayType === "button" || vt.displayType === "dropdown") return false;
  if (vt.displayType === "cards" || vt.displayType === "pcs") return true;
  const s = (vt.slug || "").toLowerCase();
  const n = (vt.name || "").toLowerCase();
  if (
    s.includes("piece") || s.includes("pcs") || s.includes("pack") ||
    s.includes("bundle") || s.includes("quantity") ||
    n.includes("piece") || n.includes("pcs") || n.includes("পিস") ||
    n.includes("পরিমাণ") || n.includes("প্যাক")
  ) {
    return true;
  }
  return Boolean(
    vt.values?.some((val) =>
      val.value.includes("পিস") ||
      val.value.toLowerCase().includes("pc") ||
      /^\d+$/.test(val.value.trim()) ||
      /^[০-৯]+$/.test(val.value.trim())
    )
  );
}

function getVariantBadge(index: number, total: number, savings: number): string | null {
  if (total === 1) {
    return savings > 0 ? `SAVE ${savings.toLocaleString()} TK` : null;
  }
  if (total === 2) {
    if (index === 0) return savings > 0 ? `SAVE ${savings.toLocaleString()} TK` : null;
    return "BEST VALUE";
  }
  // 3 or more variants (exactly as in user's design)
  if (index === 0) {
    return savings > 0 ? `SAVE ${savings.toLocaleString()} TK` : null;
  }
  if (index === 1) {
    return "MOST POPULAR";
  }
  if (index === total - 1) {
    return "BEST PRICE";
  }
  return savings > 0 ? `SAVE ${savings.toLocaleString()} TK` : null;
}

/* ─────────────────────────── Main component ─────────────────────────── */

export default function ProductDetailsClient({
  product: initialProduct,
  relatedProducts,
  isAiAvailable = true,
}: {
  product: DetailedProduct;
  relatedProducts?: DetailedProduct[];
  isAiAvailable?: boolean;
}) {
  const router = useRouter();
  const { addItem, openCart } = useCart();
  const { showToast } = useToast();
  const { toggleItem, isWishlisted } = useWishlist();

  const product = initialProduct;
  const wishlisted = isWishlisted(product._id);

  /* ── FB Pixel ── */
  useEffect(() => {
    try {
      trackViewContent(product);
    } catch {
      /* noop */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product._id]);

  /* ── State ── */
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState("description");
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: "",
    text: "",
    name: "",
  });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  /* ── Variants ── */
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >(() => {
    if (
      product.hasVariations &&
      product.variants &&
      product.variants.length > 0
    ) {
      const first =
        product.variants.find(
          (v: ProductVariant) => v.isActive && v.stock > 0
        ) ||
        product.variants.find((v: ProductVariant) => v.isActive) ||
        product.variants[0];
      if (first) {
        const defaults: Record<string, string> = {};
        first.combination?.forEach((c: VariantCombination) => {
          if (c.variationType?._id && c.variationValue?._id)
            defaults[c.variationType._id] = c.variationValue._id;
        });
        return defaults;
      }
    }
    return {};
  });

  const matchingVariant =
    product.hasVariations && product.variants && product.variants.length > 0
      ? product.variants.find(
          (v: ProductVariant) =>
            v.isActive &&
            v.combination.every(
              (c: VariantCombination) =>
                selectedOptions[c.variationType._id] === c.variationValue._id
            )
        )
      : null;

  /* ── Pricing & Stock ── */
  const totalVariationStock = useMemo(() => {
    if (!product.hasVariations || !Array.isArray(product.variants) || product.variants.length === 0) {
      return product.inventory ?? 0;
    }
    return product.variants.reduce(
      (sum: number, v: { stock?: number; isActive?: boolean }) =>
        sum + (v.isActive !== false ? (Number(v.stock) || 0) : 0),
      0
    );
  }, [product.hasVariations, product.variants, product.inventory]);

  // Unit compare price for automatic calculate across pcs / bundle options
  const unitComparePrice = useMemo(() => {
    if (product.variants && Array.isArray(product.variants)) {
      for (const v of product.variants) {
        if (v.isActive && v.comparePrice && v.comparePrice > 0) {
          const comboStr = v.combinationLabel || (v.combination?.[0]?.variationValue as { value?: string })?.value || '';
          const pcs = extractPiecesCount(comboStr);
          if (pcs > 0) {
            return v.comparePrice / pcs;
          }
        }
      }
    }
    if (product.compareAtPrice && product.compareAtPrice > 0) {
      return product.compareAtPrice;
    }
    if (product.price && product.price > 0) {
      return Math.round(product.price * 1.5);
    }
    return 0;
  }, [product.variants, product.compareAtPrice, product.price]);

  const currentPrice = matchingVariant ? matchingVariant.price : product.price;

  const currentComparePrice = useMemo(() => {
    if (matchingVariant) {
      if (matchingVariant.comparePrice && matchingVariant.comparePrice > 0) {
        return matchingVariant.comparePrice;
      }
      const pcs = extractPiecesCount(matchingVariant.combinationLabel || '');
      if (unitComparePrice > 0 && pcs > 0) {
        return Math.round(unitComparePrice * pcs);
      }
      return null;
    }
    return product.compareAtPrice || null;
  }, [matchingVariant, unitComparePrice, product.compareAtPrice]);

  const currentInventory =
    (matchingVariant ? matchingVariant.stock : totalVariationStock) ?? 0;
  const hasDiscount = Boolean(
    currentComparePrice && currentComparePrice > currentPrice
  );
  const discountPercentage =
    hasDiscount && currentComparePrice
      ? Math.round(
          ((currentComparePrice - currentPrice) / currentComparePrice) * 100
        )
      : 0;

  /* ── Color image matching ── */
  const COLOR_KEYWORDS: Record<string, string[]> = useMemo(
    () => ({
      red: ["red", "crimson", "maroon", "লাল"],
      blue: ["blue", "navy", "cyan", "নীল"],
      green: ["green", "emerald", "সবুজ"],
      yellow: ["yellow", "amber", "হলুদ"],
      pink: ["pink", "rose", "গোলাপি"],
      black: ["black", "dark", "কালো"],
      white: ["white", "light", "সাদা"],
      orange: ["orange", "কমলা"],
      purple: ["purple", "violet", "বেগুনি"],
      brown: ["brown", "বাদামি"],
      gray: ["gray", "grey", "silver", "ধূসর"],
    }),
    []
  );

  const findColorImageIndex = useCallback(
    (
      valName: string,
      gallery: Array<{ url: string; alt?: string }>
    ): number => {
      if (!valName || !gallery.length) return -1;
      const raw = valName.toLowerCase().trim();
      let searchTerms = [raw];
      for (const [key, list] of Object.entries(COLOR_KEYWORDS)) {
        if (list.some((term) => raw.includes(term))) {
          searchTerms = Array.from(new Set([raw, key, ...list]));
          break;
        }
      }
      for (let i = 0; i < gallery.length; i++) {
        const alt = (gallery[i].alt || "").toLowerCase();
        if (searchTerms.some((term) => alt.includes(term))) return i;
      }
      for (let i = 0; i < gallery.length; i++) {
        let url = (gallery[i].url || "").toLowerCase();
        try {
          url = decodeURIComponent(url);
        } catch {
          /* noop */
        }
        if (searchTerms.some((term) => url.includes(term))) return i;
      }
      return -1;
    },
    [COLOR_KEYWORDS]
  );

  /* ── Gallery ── */
  const currentGallery = useMemo(() => {
    const allImages = (product.images || []).map((img) => ({
      url: img.url,
      alt: img.alt || product.title,
    }));
    if (!matchingVariant?.images || matchingVariant.images.length === 0)
      return allImages;
    const variantImages = matchingVariant.images.map((img) => ({
      url: typeof img === "string" ? img : img.url,
      alt:
        typeof img === "string" ? product.title : img.alt || product.title,
    }));
    const existingUrls = new Set(variantImages.map((img) => img.url));
    return [
      ...variantImages,
      ...allImages.filter((img) => !existingUrls.has(img.url)),
    ];
  }, [product.images, product.title, matchingVariant]);

  const totalImages = currentGallery.length || 0;
  const prevImage = () =>
    setActiveImage(activeImage === 0 ? totalImages - 1 : activeImage - 1);
  const nextImage = () =>
    setActiveImage(activeImage === totalImages - 1 ? 0 : activeImage + 1);

  /* ── Option select ── */
  const handleOptionSelect = (
    vtId: string,
    valId: string,
    valName: string
  ) => {
    const nextOptions = { ...selectedOptions, [vtId]: valId };
    setSelectedOptions(nextOptions);
    const nextVariant = product.variants?.find(
      (v: ProductVariant) =>
        v.isActive &&
        v.combination.every(
          (c: VariantCombination) =>
            (c.variationType._id === vtId
              ? valId
              : nextOptions[c.variationType._id]) === c.variationValue._id
        )
    );
    if (nextVariant?.images && nextVariant.images.length > 0) {
      const vImg = nextVariant.images[0];
      const targetUrl = typeof vImg === "string" ? vImg : vImg?.url;
      if (targetUrl) {
        const found = currentGallery.findIndex((g) => g.url === targetUrl);
        setActiveImage(found !== -1 ? found : 0);
        return;
      }
      setActiveImage(0);
      return;
    }
    const matchIdx = findColorImageIndex(valName, currentGallery);
    if (matchIdx !== -1) setActiveImage(matchIdx);
  };

  useEffect(() => {
    if (!currentGallery || currentGallery.length === 0) return;
    if (matchingVariant?.images && matchingVariant.images.length > 0) {
      setActiveImage(0);
      return;
    }
    const selectedVals: string[] = [];
    Object.entries(selectedOptions).forEach(([vtId, valId]) => {
      const vt = product.variationTypes?.find((t) => t._id === vtId);
      const val = vt?.values?.find((v) => v._id === valId);
      if (val?.value) selectedVals.push(val.value);
    });
    for (const valName of selectedVals) {
      const idx = findColorImageIndex(valName, currentGallery);
      if (idx !== -1) {
        setActiveImage(idx);
        break;
      }
    }
  }, [selectedOptions, matchingVariant, currentGallery, findColorImageIndex]);

  /* ── Variation groups ── */
  const variationGroups = product.hasVariations
    ? product.variationTypes?.map((vt: VariationType) => {
        const uniqueValues = new Map<string, VariationValue>();
        product.variants?.forEach((v: ProductVariant) => {
          if (!v.isActive) return;
          const c = v.combination.find(
            (combo: VariantCombination) =>
              combo.variationType._id === vt._id
          );
          if (c && !uniqueValues.has(c.variationValue._id))
            uniqueValues.set(
              c.variationValue._id,
              c.variationValue as VariationValue
            );
        });
        return { ...vt, values: Array.from(uniqueValues.values()) };
      })
    : [];

  /* ── Cart / Buy ── */
  const buildCartItem = () => {
    const firstImage = matchingVariant?.images?.[0];
    const imageUrl =
      typeof firstImage === "string"
        ? firstImage
        : firstImage?.url || product.images?.[0]?.url || "/placeholder.jpg";
    return {
      id: product._id,
      slug: product.slug,
      title: matchingVariant?.combinationLabel
        ? `${product.title} - ${matchingVariant.combinationLabel}`
        : product.title,
      price: matchingVariant ? matchingVariant.price : product.price,
      quantity,
      image: imageUrl,
      variantId: matchingVariant?._id,
      isFreeShipping: Boolean(product.isFreeShipping),
    };
  };

  const handleAddToCart = () => {
    addItem(buildCartItem());
    try {
      trackAddToCart(product, quantity);
    } catch {
      /* noop */
    }
    showToast(`"${product.title}" added to cart!`, "success");
    openCart();
  };

  const handleBuyNow = () => {
    addItem(buildCartItem());
    try {
      trackAddToCart(product, quantity);
    } catch {
      /* noop */
    }
    router.push("/checkout");
  };

  const handleWishlistClick = () => {
    toggleItem(product._id);
    if (!wishlisted) {
      showToast("Added to wishlist!", "success");
      try {
        trackAddToWishlist(product);
      } catch {
        /* noop */
      }
    } else {
      showToast("Removed from wishlist", "info");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: product.title, url: window.location.href }).catch(() => {/* noop */});
    } else {
      await navigator.clipboard.writeText(window.location.href).catch(() => {/* noop */});
      showToast("Link copied!", "success");
    }
  };

  /* ── Review submit ── */
  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReview(true);
    try {
      const res = await fetch(`/api/products/${product._id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviewForm),
      });
      if (!res.ok) throw new Error("Failed");
      showToast("Review submitted!", "success");
      setIsWritingReview(false);
      setReviewForm({ rating: 5, title: "", text: "", name: "" });
      router.refresh();
    } catch {
      showToast("Error submitting review.", "error");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  /* ── WhatsApp ── */
  const whatsappUrl = `https://wa.me/8801616921965?text=Hi! I'm interested in the ${encodeURIComponent(product.title)}. Is it available?`;

  /* ════════════════════════════════════════════
      RENDER
     ════════════════════════════════════════════ */
  return (
    <div className="bg-[#F9F7FF] min-h-screen text-[#1E1B4B]">

      {/* ── Breadcrumb bar ── */}
      <div className="py-3.5 px-4 sm:px-8 lg:px-[5vw]">
        <div className="max-w-[1400px] mx-auto">
          <nav className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
            <Link href="/" className="hover:text-[#5428D8] transition-colors">Home</Link>
            <span className="text-gray-400">›</span>
            <Link href="/products" className="hover:text-[#5428D8] transition-colors">
              {product.category?.name || "Shop"}
            </Link>
            <span className="text-gray-400">›</span>
            <span className="text-[#1E1B4B] font-medium line-clamp-1">{product.title}</span>
          </nav>
        </div>
      </div>

      {/* ── Product showcase ── */}
      <section className="px-4 sm:px-8 lg:px-[5vw] py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16">

          {/* ════ COL 1 — Image Gallery ════ */}
          <div className="flex flex-col md:flex-row gap-3 lg:sticky lg:top-[80px] h-fit">

            {/* Vertical thumbnails (desktop) */}
            {currentGallery.length > 1 && (
              <div className="hidden md:flex flex-col gap-2 w-[72px] shrink-0">
                {currentGallery.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={cn(
                      "relative w-[72px] h-[72px] overflow-hidden rounded-xl border-2 transition-all duration-200 bg-white",
                      activeImage === idx
                        ? "border-[#5428D8] shadow-[0_0_0_3px_rgba(84,40,216,0.15)]"
                        : "border-gray-200 opacity-60 hover:opacity-100 hover:border-[#5428D8]/40"
                    )}
                  >
                    <Image
                      src={getOptimizedCloudinaryUrl(img.url, { width: 144 })}
                      alt={img.alt || "Thumbnail"}
                      fill
                      className="object-cover"
                      sizes="72px"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main image */}
            <div className="relative flex-1 aspect-square bg-white rounded-2xl overflow-hidden border border-gray-100">
              {currentGallery[activeImage] && (
                <Image
                  key={currentGallery[activeImage].url}
                  src={getOptimizedCloudinaryUrl(
                    currentGallery[activeImage].url,
                    { width: 900 }
                  )}
                  alt={currentGallery[activeImage].alt || product.title}
                  fill
                  className="object-contain transition-opacity duration-300"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              )}

              {/* Wishlist button on image */}
              <button
                onClick={handleWishlistClick}
                className={cn(
                  "absolute top-3 right-3 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center transition-all",
                  wishlisted
                    ? "text-red-500"
                    : "text-gray-400 hover:text-red-400"
                )}
              >
                <Heart
                  size={18}
                  fill={wishlisted ? "currentColor" : "none"}
                />
              </button>

              {/* Discount badge on image */}
              {hasDiscount && (
                <div className="absolute top-3 left-3 bg-[#5428D8] text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  -{discountPercentage}%
                </div>
              )}

              {/* Out of stock */}
              {currentInventory <= 0 && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-2xl">
                  <span className="bg-white text-[#1E1B4B] font-bold text-sm px-4 py-2 rounded-full">
                    Sold Out
                  </span>
                </div>
              )}

              {/* Nav arrows */}
              {totalImages > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-all"
                    aria-label="Previous"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-all"
                    aria-label="Next"
                  >
                    <ChevronRight size={16} />
                  </button>
                </>
              )}
            </div>

            {/* Mobile thumbnails */}
            {currentGallery.length > 1 && (
              <div className="flex md:hidden gap-2 overflow-x-auto pb-1">
                {currentGallery.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={cn(
                      "relative w-14 h-14 shrink-0 border-2 rounded-xl overflow-hidden transition-all bg-white",
                      activeImage === idx
                        ? "border-[#5428D8]"
                        : "border-gray-200 opacity-50"
                    )}
                  >
                    <Image
                      src={getOptimizedCloudinaryUrl(img.url, { width: 120 })}
                      alt={img.alt || "Thumbnail"}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ════ COL 2 — Product Info ════ */}
          <div className="flex flex-col">

            {/* Discount badge + title */}
            <div className="flex flex-wrap items-start gap-2 mb-2">
              {hasDiscount && (
                <span className="bg-[#5428D8] text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  -{discountPercentage}%
                </span>
              )}
            </div>
            <h1 className="font-bold text-2xl md:text-3xl text-[#1E1B4B] leading-tight mb-3">
              {product.title}
            </h1>

            {/* Rating row */}
            {(product.reviewCount ?? 0) > 0 && (
              <div className="flex items-center gap-2 mb-3">
                <StarRow rating={product.rating || 0} size={15} />
                <span className="text-sm text-gray-500 font-medium">
                  {product.rating?.toFixed(1)} (
                  {(product.reviewCount || 0) >= 1000
                    ? `${((product.reviewCount || 0) / 1000).toFixed(1)}k`
                    : product.reviewCount}{" "}
                  reviews)
                </span>
                {(product.soldCount ?? 0) > 0 && (
                  <>
                    <span className="text-gray-300">·</span>
                    <span className="text-sm text-gray-500 font-medium">
                      {(product.soldCount ?? 0) >= 1000
                        ? `${((product.soldCount ?? 0) / 1000).toFixed(1)}k+`
                        : `${product.soldCount}+`}{" "}
                      Sold
                    </span>
                  </>
                )}
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-4">
              <span className="font-bold text-3xl text-[#5428D8]">
                ৳{currentPrice.toLocaleString()}
              </span>
              {hasDiscount && currentComparePrice && (
                <span className="text-lg text-gray-400 line-through">
                  ৳{currentComparePrice.toLocaleString()}
                </span>
              )}
            </div>


            {/* Short description */}
            {product.description && (
              <p className="text-sm text-gray-600 leading-relaxed mb-5 line-clamp-3">
                {product.description.replace(/[#*_`]/g, "")}
              </p>
            )}

            {/* Variations */}
            {product.hasVariations &&
              variationGroups &&
              variationGroups.length > 0 && (
                <div className="flex flex-col gap-4 mb-5">
                  {variationGroups.map(
                    (vt: VariationType & { values: VariationValue[] }) => {
                      const isCards =
                        vt.displayType === "cards" ||
                        vt.displayType === "pcs" ||
                        (!["button", "swatch", "dropdown"].includes(vt.displayType || "") &&
                          isPiecesVariation(vt));
                      const isSwatch = vt.displayType === "swatch";
                      const isDropdown = vt.displayType === "dropdown";

                      return (
                        <div key={vt._id}>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                            {vt.name}:{" "}
                            <span className="text-[#1E1B4B] normal-case ml-1 font-bold">
                              {
                                vt.values.find(
                                  (val) => val._id === selectedOptions[vt._id]
                                )?.value
                              }
                            </span>
                          </p>

                          {/* 1. Bundle Cards Layout (Pieces / Packs) */}
                          {isCards ? (
                            <div className="flex flex-col gap-3.5 pt-1.5 mb-2">
                              {vt.values.map((val: VariationValue, idx: number) => {
                                const isSelected = selectedOptions[vt._id] === val._id;

                                const variantForVal = product.variants?.find((v: ProductVariant) => {
                                  if (!v.isActive) return false;
                                  return v.combination.some((c: VariantCombination) => {
                                    const vId = typeof c.variationValue === "string" ? c.variationValue : c.variationValue?._id;
                                    return vId === val._id;
                                  });
                                });

                                const variantPrice = variantForVal ? variantForVal.price : product.price;
                                const pcs = extractPiecesCount(val.value);

                                let variantComparePrice = variantForVal?.comparePrice && variantForVal.comparePrice > 0
                                  ? variantForVal.comparePrice
                                  : (unitComparePrice > 0 && pcs > 0 ? Math.round(unitComparePrice * pcs) : null);

                                if (variantComparePrice && variantComparePrice <= variantPrice) {
                                  variantComparePrice = null;
                                }

                                const savings = variantComparePrice && variantComparePrice > variantPrice
                                  ? variantComparePrice - variantPrice
                                  : 0;

                                const badge = getVariantBadge(idx, vt.values.length, savings);

                                return (
                                  <div
                                    key={val._id}
                                    onClick={() => handleOptionSelect(vt._id, val._id, val.value)}
                                    className={cn(
                                      "relative flex items-center justify-between p-3.5 sm:p-4 rounded-2xl cursor-pointer transition-all duration-200 select-none",
                                      isSelected
                                        ? "border-2 border-black bg-white shadow-sm"
                                        : "border border-gray-200 bg-white hover:border-gray-300"
                                    )}
                                  >
                                    {/* Floating Top Badge */}
                                    {badge && (
                                      <span className="absolute -top-2.5 right-4 sm:right-6 bg-[#E11D48] text-white text-[10px] sm:text-[11px] font-black px-3 py-0.5 rounded-full uppercase tracking-wider shadow-sm z-10 pointer-events-none">
                                        {badge}
                                      </span>
                                    )}

                                    {/* Left: Radio + Label + Inline Savings */}
                                    <div className="flex items-center gap-3 min-w-0 pr-2">
                                      {/* Radio Circle */}
                                      <div
                                        className={cn(
                                          "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                                          isSelected ? "border-black bg-white" : "border-gray-300 bg-white"
                                        )}
                                      >
                                        {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-black" />}
                                      </div>

                                      {/* Title + Pill */}
                                      <div className="flex items-center flex-wrap gap-2 min-w-0">
                                        <span className="text-sm sm:text-base font-bold text-gray-900 leading-tight">
                                          {formatPcsLabel(val.value)}
                                        </span>

                                        {/* Inline Savings Pill */}
                                        {savings > 0 && (idx > 0 || !badge) && (
                                          <span className="bg-[#F3F4F6] text-gray-700 text-xs font-semibold px-2.5 py-0.5 rounded-full shrink-0">
                                            save {savings.toLocaleString()} tk
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    {/* Right: Prices */}
                                    <div className="flex flex-col items-end shrink-0 pl-2 text-right">
                                      <span className="text-base sm:text-xl font-black text-gray-900 tracking-tight leading-tight">
                                        ৳ {variantPrice.toLocaleString()}
                                      </span>
                                      {variantComparePrice && (
                                        <span className="text-xs sm:text-sm text-gray-400 line-through font-medium leading-tight mt-0.5">
                                          ৳ {variantComparePrice.toLocaleString()}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : isSwatch ? (
                            /* 2. Color Swatches Layout (Color) */
                            <div className="flex flex-wrap gap-2.5 items-center">
                              {vt.values.map((val: VariationValue) => {
                                const isSelected = selectedOptions[vt._id] === val._id;
                                if (val.colorHex) {
                                  return (
                                    <button
                                      key={val._id}
                                      type="button"
                                      onClick={() => handleOptionSelect(vt._id, val._id, val.value)}
                                      className={cn(
                                        "w-9 h-9 rounded-full border-2 transition-all duration-200 relative flex items-center justify-center",
                                        isSelected
                                          ? "border-[#5428D8] ring-2 ring-[#5428D8]/30 scale-110 shadow-md"
                                          : "border-gray-300 hover:scale-105 shadow-sm"
                                      )}
                                      style={{ backgroundColor: val.colorHex }}
                                      title={val.value}
                                      aria-label={val.value}
                                    >
                                      {isSelected && (
                                        <span
                                          className={cn(
                                            "w-2 h-2 rounded-full",
                                            val.colorHex.toLowerCase() === "#ffffff" || val.colorHex.toLowerCase() === "#fff"
                                              ? "bg-black"
                                              : "bg-white"
                                          )}
                                        />
                                      )}
                                    </button>
                                  );
                                }
                                return (
                                  <button
                                    key={val._id}
                                    type="button"
                                    onClick={() => handleOptionSelect(vt._id, val._id, val.value)}
                                    className={cn(
                                      "px-3.5 py-1.5 text-sm rounded-lg border transition-all duration-200 font-medium",
                                      isSelected
                                        ? "bg-[#5428D8] text-white border-[#5428D8] shadow-sm"
                                        : "bg-white text-[#1E1B4B] border-gray-200 hover:border-[#5428D8] hover:bg-purple-50"
                                    )}
                                  >
                                    {val.value}
                                  </button>
                                );
                              })}
                            </div>
                          ) : isDropdown ? (
                            /* 3. Dropdown Select Layout */
                            <div className="relative max-w-xs">
                              <select
                                value={selectedOptions[vt._id] || ""}
                                onChange={(e) => {
                                  const found = vt.values.find((v) => v._id === e.target.value);
                                  if (found) handleOptionSelect(vt._id, found._id, found.value);
                                }}
                                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-900 outline-none focus:border-[#5428D8] focus:ring-2 focus:ring-[#5428D8]/20 transition-all cursor-pointer shadow-sm appearance-none pr-10"
                              >
                                {vt.values.map((val: VariationValue) => (
                                  <option key={val._id} value={val._id}>
                                    {val.value}
                                  </option>
                                ))}
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                                <ChevronDown size={16} />
                              </div>
                            </div>
                          ) : (
                            /* 4. Pill Buttons Layout (Size / Options) */
                            <div className="flex flex-wrap gap-2">
                              {vt.values.map((val: VariationValue) => {
                                const isSelected = selectedOptions[vt._id] === val._id;
                                return (
                                  <button
                                    key={val._id}
                                    type="button"
                                    onClick={() => handleOptionSelect(vt._id, val._id, val.value)}
                                    className={cn(
                                      "px-4 py-2 text-sm rounded-xl border transition-all duration-200 font-semibold select-none",
                                      isSelected
                                        ? "bg-[#5428D8] text-white border-[#5428D8] shadow-sm"
                                        : "bg-white text-[#1E1B4B] border-gray-200 hover:border-[#5428D8] hover:bg-purple-50"
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
                    }
                  )}
                </div>
              )}

            {/* Age range */}
            {product.ageRange && (
              <p className="text-xs text-gray-500 mb-4">
                Ages: <span className="font-semibold text-[#1E1B4B]">{product.ageRange}</span>
              </p>
            )}

            {/* Quantity */}
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Quantity:
              </p>
              <div className="flex items-center border border-gray-200 rounded-xl w-fit bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center text-xl font-bold text-[#1E1B4B] hover:text-[#5428D8] transition-colors"
                  aria-label="Decrease"
                >
                  −
                </button>
                <span className="w-10 text-center font-bold text-base text-[#1E1B4B]">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center text-xl font-bold text-[#1E1B4B] hover:text-[#5428D8] transition-colors"
                  aria-label="Increase"
                >
                  +
                </button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <button
                onClick={handleAddToCart}
                disabled={currentInventory <= 0}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 bg-[#5428D8] text-white font-bold text-sm rounded-xl hover:bg-[#4A1FB8] disabled:opacity-60 transition-colors shadow-[0_4px_16px_rgba(84,40,216,0.35)]"
              >
                <ShoppingCart size={18} />
                {currentInventory <= 0 ? "Out of Stock" : "Add to Cart"}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={currentInventory <= 0}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 bg-white text-[#5428D8] border-2 border-[#5428D8] font-bold text-sm rounded-xl hover:bg-purple-50 disabled:opacity-60 transition-colors"
              >
                <Zap size={18} />
                Buy Now
              </button>
            </div>

            {/* AI Order Button */}
            <div className="mb-3">
              <OrderWithAIButton
                product={{
                  _id: product._id,
                  title: product.title,
                  price: currentPrice,
                  inventory: currentInventory,
                  images: product.images,
                  hasVariations: product.hasVariations,
                }}
                disabled={currentInventory <= 0}
                initialAvailable={isAiAvailable}
              />
            </div>

            {/* WhatsApp */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full mb-4 py-3 bg-[#25D366] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 hover:bg-[#128C7E] transition-colors shadow-[0_4px_16px_rgba(37,211,102,0.3)]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
              </svg>
              Chat on WhatsApp
            </a>

            {/* Wishlist + Share */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleWishlistClick}
                className={cn(
                  "flex items-center gap-1.5 text-sm font-medium transition-colors",
                  wishlisted
                    ? "text-red-500"
                    : "text-gray-500 hover:text-red-400"
                )}
              >
                <Heart size={16} fill={wishlisted ? "currentColor" : "none"} />
                {wishlisted ? "Wishlisted" : "Add to Wishlist"}
              </button>
              <span className="text-gray-200">|</span>
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#5428D8] font-medium transition-colors"
              >
                <Share2 size={16} />
                Share
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          TABS — Full width below grid
         ════════════════════════════════════════════ */}
      <section id="reviews" className="px-4 sm:px-8 lg:px-[5vw] py-8 border-t border-gray-100">
        <div className="max-w-[1100px] mx-auto">

          {/* Tab bar */}
          <div className="flex gap-0 border-b border-gray-200 mb-6 sm:mb-8 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {[
              { key: "description", label: "Product Description" },
              { key: "specs", label: "Specifications" },
              {
                key: "reviews",
                label: `Reviews${product.reviewCount ? ` (${product.reviewCount})` : ""}`,
              },
              { key: "shipping", label: "Shipping & Return" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={cn(
                  "shrink-0 px-3.5 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all duration-200 whitespace-nowrap",
                  activeTab === key
                    ? "border-[#5428D8] text-[#5428D8]"
                    : "border-transparent text-gray-500 hover:text-[#1E1B4B]"
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Description tab */}
          {activeTab === "description" && (
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold text-xl text-[#1E1B4B] mb-4">
                  {product.descriptionHeading || product.title}
                </h3>
                <div className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none mb-6">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={MD_COMPONENTS}
                  >
                    {product.longDescription || product.description || ""}
                  </ReactMarkdown>
                </div>
                {/* Feature checkmarks (Dynamic from admin or attributes) */}
                {((product.keyFeatures && product.keyFeatures.length > 0) || (product.attributes && product.attributes.length > 0) || (product.specifications && product.specifications.length > 0)) && (
                  <div className="flex flex-wrap gap-2.5">
                    {(product.keyFeatures && product.keyFeatures.length > 0
                      ? product.keyFeatures
                      : (product.specifications || product.attributes || []).slice(0, 4).map(a => `${a.name}: ${a.value}`)
                    ).map((f) => (
                      <span
                        key={f}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full"
                      >
                        <span className="text-green-500 font-bold">✓</span> {f}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {/* Lifestyle / Product image */}
              {currentGallery.length > 0 && (
                <div className="relative aspect-[4/3] bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
                  <Image
                    src={getOptimizedCloudinaryUrl(
                      currentGallery[Math.min(1, currentGallery.length - 1)].url,
                      { width: 700 }
                    )}
                    alt={product.title}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              )}
            </div>
          )}

          {/* Specs tab */}
          {activeTab === "specs" && (
            <div className="max-w-2xl">
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs">
                {(() => {
                  const specsList: Array<{ label: string; value: string }> = [];

                  // Base specs
                  if (product._id) {
                    specsList.push({ label: "SKU", value: (product._id || "").slice(-8).toUpperCase() });
                  }
                  if (product.category?.name) {
                    specsList.push({ label: "Category", value: product.category.name });
                  }
                  if (product.ageRange) {
                    specsList.push({ label: "Age Recommendation", value: product.ageRange });
                  }
                  if (product.isFreeShipping !== undefined) {
                    specsList.push({
                      label: "Fast Delivery",
                      value: product.isFreeShipping ? "Yes (Free Delivery)" : "Standard Rates Apply",
                    });
                  }
                  specsList.push({
                    label: "Availability",
                    value: currentInventory > 0 ? `In Stock (${currentInventory} units)` : "Out of stock",
                  });

                  // Dynamic Admin-Controlled Custom Specifications
                  const customSpecs = (product.specifications && product.specifications.length > 0)
                    ? product.specifications
                    : (product.attributes || []);

                  customSpecs.forEach((spec) => {
                    if (spec.name && spec.value) {
                      specsList.push({ label: spec.name, value: spec.value });
                    }
                  });

                  return specsList.map(({ label, value }, i) => (
                    <div
                      key={`${label}-${i}`}
                      className={cn(
                        "flex flex-col sm:flex-row sm:items-center px-5 py-3.5 text-sm border-b border-gray-100 last:border-b-0",
                        i % 2 === 0 ? "bg-gray-50/60" : "bg-white"
                      )}
                    >
                      <span className="w-48 font-bold text-gray-700 shrink-0 mb-1 sm:mb-0">
                        {label}
                      </span>
                      <span className="text-[#1E1B4B] font-medium leading-relaxed">
                        {value}
                      </span>
                    </div>
                  ));
                })()}
              </div>
            </div>
          )}

          {/* Reviews tab */}
          {activeTab === "reviews" && (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Summary */}
                <div className="flex flex-col items-center bg-white rounded-2xl border border-gray-100 p-8 min-w-[220px]">
                  <span className="font-bold text-6xl text-[#1E1B4B] leading-none mb-2">
                    {product.rating || 0}
                  </span>
                  <StarRow rating={product.rating || 0} size={20} />
                  <span className="text-sm text-gray-500 mt-2">
                    {product.reviewCount || 0} reviews
                  </span>
                  {!isWritingReview && (
                    <button
                      onClick={() => setIsWritingReview(true)}
                      className="mt-5 w-full py-2.5 px-4 bg-[#5428D8] text-white font-bold text-sm rounded-xl hover:bg-[#4A1FB8] transition-colors"
                    >
                      Write a Review
                    </button>
                  )}
                </div>

                {/* Reviews list */}
                <div className="flex-1 space-y-5">
                  {isWritingReview && (
                    <form
                      onSubmit={submitReview}
                      className="bg-white p-6 rounded-2xl border border-gray-100 space-y-4"
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="font-bold text-lg text-[#1E1B4B]">Write a Review</h3>
                        <button
                          type="button"
                          onClick={() => setIsWritingReview(false)}
                          className="text-sm text-gray-400 hover:text-gray-700 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() =>
                              setReviewForm((p) => ({ ...p, rating: star }))
                            }
                          >
                            <Star
                              size={22}
                              className={
                                star <= reviewForm.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "fill-gray-200 text-gray-200"
                              }
                            />
                          </button>
                        ))}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          required
                          type="text"
                          value={reviewForm.name}
                          onChange={(e) =>
                            setReviewForm((p) => ({ ...p, name: e.target.value }))
                          }
                          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#1E1B4B] outline-none focus:border-[#5428D8]"
                          placeholder="Your name"
                        />
                        <input
                          required
                          type="text"
                          value={reviewForm.title}
                          onChange={(e) =>
                            setReviewForm((p) => ({ ...p, title: e.target.value }))
                          }
                          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#1E1B4B] outline-none focus:border-[#5428D8]"
                          placeholder="Review title"
                        />
                      </div>
                      <textarea
                        required
                        value={reviewForm.text}
                        onChange={(e) =>
                          setReviewForm((p) => ({ ...p, text: e.target.value }))
                        }
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#1E1B4B] outline-none focus:border-[#5428D8] min-h-[100px]"
                        placeholder="Tell us what you think..."
                      />
                      <button
                        type="submit"
                        disabled={isSubmittingReview}
                        className="w-full py-3 bg-[#5428D8] text-white font-bold text-sm rounded-xl hover:bg-[#4A1FB8] disabled:opacity-70 transition-colors"
                      >
                        {isSubmittingReview ? "Submitting..." : "Submit Review"}
                      </button>
                    </form>
                  )}

                  {product.reviews && product.reviews.length > 0 ? (
                    <div className="space-y-4">
                      {product.reviews
                        .filter((r: ProductReview) => r.status !== "pending")
                        .sort(
                          (a: ProductReview, b: ProductReview) =>
                            new Date(b.date).getTime() -
                            new Date(a.date).getTime()
                        )
                        .map((review: ProductReview, i: number) => (
                          <div
                            key={i}
                            className="bg-white p-5 rounded-2xl border border-gray-100"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-bold text-base text-[#1E1B4B]">
                                  {review.title}
                                </h4>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <StarRow rating={review.rating} size={12} />
                                  <span className="text-xs text-gray-400">
                                    by {review.name} •{" "}
                                    {new Date(review.date).toLocaleDateString(
                                      "en-US",
                                      {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      }
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {review.text}
                            </p>
                          </div>
                        ))}
                    </div>
                  ) : (
                    !isWritingReview && (
                      <div className="bg-white p-8 rounded-2xl border border-gray-100 text-center">
                        <p className="text-sm text-gray-500">
                          No reviews yet. Be the first!
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Shipping & Return tab */}
          {activeTab === "shipping" && (
            <div className="max-w-xl space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-4">
                <Truck className="text-[#5428D8] shrink-0 mt-0.5" size={22} />
                <div>
                  <h4 className="font-bold text-sm text-[#1E1B4B] mb-1">Fast Delivery</h4>
                  <p className="text-sm text-gray-600">
                    Nationwide delivery across Bangladesh. Dhaka city: 1–2 business days. Outside Dhaka: 2–4 business days.
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-4">
                <RefreshCcw className="text-[#5428D8] shrink-0 mt-0.5" size={22} />
                <div>
                  <h4 className="font-bold text-sm text-[#1E1B4B] mb-1">Easy Returns</h4>
                  <p className="text-sm text-gray-600">
                    Not satisfied? Return within 30 days of delivery for a full
                    refund. Items must be unused and in original packaging.
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-4">
                <ShieldCheck className="text-[#5428D8] shrink-0 mt-0.5" size={22} />
                <div>
                  <h4 className="font-bold text-sm text-[#1E1B4B] mb-1">Secure Payment</h4>
                  <p className="text-sm text-gray-600">
                    All payments are 100% secured with industry-standard SSL
                    encryption. We accept bKash, Nagad, Rocket, and all major
                    cards.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* AI Suggestions */}
      <section className="px-4 sm:px-8 lg:px-[5vw] border-t border-gray-100">
        <div className="max-w-[1400px] mx-auto">
          <AISuggestions productId={product._id} />
        </div>
      </section>

      {/* Related Products — full grid below */}
      {relatedProducts && relatedProducts.length > 0 && (
        <section className="px-4 sm:px-8 lg:px-[5vw] py-12 border-t border-gray-100">
          <div className="max-w-[1400px] mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-bold text-2xl md:text-3xl text-[#1E1B4B]">
                You May Also Like
              </h2>
              <Link
                href="/products"
                className="text-sm font-semibold text-[#5428D8] hover:underline"
              >
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-4.5">
              {relatedProducts.slice(0, 10).map((rp, idx) => (
                <div key={rp._id} className="h-full">
                  <ProductCard
                    product={rp as unknown as ProductCardData}
                    badgeColor="red"
                    cartButtonColor="purple"
                    priority={idx < 5}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
