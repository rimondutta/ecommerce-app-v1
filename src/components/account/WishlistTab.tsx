"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { m } from "framer-motion";
import { Heart, ShoppingBag, ArrowUpRight, Sparkles } from "lucide-react";
import ProductCard, { ProductCardData } from "@/components/ui/ProductCard";
import { useCart } from "@/components/providers/CartProvider";
import { useToast } from "@/components/playshelf/Toast";

interface WishlistTabProps {
  wishlistIds: string[];
}

export default function WishlistTab({ wishlistIds }: WishlistTabProps) {
  const [fetched, setFetched] = useState<{
    key: string;
    products: ProductCardData[];
  }>({ key: "", products: [] });
  const { addItem, openCart } = useCart();
  const { showToast } = useToast();

  // Stable key of IDs we need (re-fetch only when IDs added; removal filters immediately)
  const wishlistKey = useMemo(() => wishlistIds.join(","), [wishlistIds]);

  useEffect(() => {
    if (wishlistIds.length === 0) return;

    let ignore = false;

    async function loadWishlist() {
      try {
        const res = await fetch(
          `/api/store/products?ids=${encodeURIComponent(wishlistKey)}&limit=50`
        );
        const data = await res.json();
        if (!ignore) {
          setFetched({
            key: wishlistKey,
            products: Array.isArray(data.products) ? data.products : [],
          });
        }
      } catch (err) {
        console.error("[WishlistTab] Failed to fetch wishlist:", err);
        if (!ignore) {
          setFetched((prev) => ({ ...prev, key: wishlistKey }));
        }
      }
    }

    loadWishlist();
    return () => {
      ignore = true;
    };
  }, [wishlistIds.length, wishlistKey]);

  // Filter live wishlist IDs immediately so un-hearting an item updates UI with zero delay
  const products = useMemo(() => {
    if (wishlistIds.length === 0) return [];
    const idSet = new Set(wishlistIds);
    return fetched.products.filter((p) => idSet.has(p._id));
  }, [wishlistIds, fetched.products]);

  const loading =
    wishlistIds.length > 0 && fetched.key !== wishlistKey && products.length === 0;

  const handleAddAllToCart = () => {
    const inStockProducts = products.filter((p) => (p.inventory ?? 1) > 0);
    if (inStockProducts.length === 0) {
      showToast("No in-stock items to add right now", "info");
      return;
    }

    inStockProducts.forEach((p) => {
      const firstImg = p.images?.[0];
      const imgUrl =
        typeof firstImg === "string"
          ? firstImg
          : firstImg?.url || "/images/placeholder.png";
      addItem({
        id: p._id,
        slug: p.slug,
        title: p.title,
        price: p.price,
        quantity: 1,
        image: imgUrl,
      });
    });

    showToast(`Added ${inStockProducts.length} saved item(s) to cart!`, "success");
    openCart();
  };

  return (
    <m.div
      key="wishlist"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      {/* Header Bar */}
      <div className="bg-white/95 backdrop-blur-md rounded-[22px] border border-[#EDE4D8] p-5 flex flex-wrap items-center justify-between gap-4 shadow-[0_2px_10px_rgba(44,36,22,0.04)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200/70 flex items-center justify-center text-rose-500">
            <Heart size={18} className="fill-rose-500/20" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#2C2416]">
              Saved Wishlist
            </h2>
            <p className="text-xs text-[#7A6E62]">
              {wishlistIds.length} {wishlistIds.length === 1 ? "toy" : "toys"} saved across your devices
            </p>
          </div>
        </div>

        {products.length > 0 && (
          <button
            type="button"
            onClick={handleAddAllToCart}
            className="inline-flex items-center gap-2 rounded-xl bg-[#5428D8] hover:bg-[#4318C4] text-white text-xs font-bold px-4 py-2.5 shadow-[0_2px_10px_rgba(84,40,216,0.22)] transition-all cursor-pointer"
          >
            <ShoppingBag size={14} />
            Add All to Cart
          </button>
        )}
      </div>

      {/* Skeleton / Content / Empty */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-white rounded-[18px] border border-[#EDE4D8] overflow-hidden animate-pulse"
            >
              <div className="aspect-square bg-[#F5ECE0]" />
              <div className="p-3.5 space-y-2.5">
                <div className="h-3 w-20 bg-[#EDE4D8] rounded" />
                <div className="h-4 w-full bg-[#EDE4D8] rounded" />
                <div className="h-4 w-16 bg-[#EDE4D8] rounded" />
                <div className="h-9 w-full bg-[#F3F0FE] rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white/95 backdrop-blur-md rounded-[26px] border border-[#EDE4D8] p-10 sm:p-14 text-center shadow-[0_4px_20px_rgba(44,36,22,0.04)]">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200/70 flex items-center justify-center text-rose-500 mx-auto mb-4">
            <Sparkles size={28} strokeWidth={1.8} />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-[#2C2416]">
            Your wishlist is empty
          </h3>
          <p className="text-sm text-[#7A6E62] mt-1.5 max-w-sm mx-auto">
            Tap the heart icon on any toy you love to save it here for quick gifting or checkout later.
          </p>
          <Link
            href="/products"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#5428D8] hover:bg-[#4318C4] text-white text-sm font-semibold px-6 py-3 shadow-[0_4px_14px_rgba(84,40,216,0.28)] transition-all hover:-translate-y-0.5"
          >
            Explore Toys
            <ArrowUpRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              badgeColor="red"
              cartButtonColor="purple"
            />
          ))}
        </div>
      )}
    </m.div>
  );
}
