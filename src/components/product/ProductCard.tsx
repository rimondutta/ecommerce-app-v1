"use client";

import { useState } from "react";
import Image from "next/image";
import { Heart, Eye, Repeat, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/providers/CartProvider";
import { useWishlist } from "@/components/providers/WishlistProvider";
import type { Product } from "@/data/products";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const [activeColor, setActiveColor] = useState(0);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");
  const { addItem } = useCart();
  const { toggleItem, isWishlisted } = useWishlist();

  const currentImage = product.colors[activeColor]?.image || product.images[0].src;
  const hoverImage = product.images[1]?.src || product.images[0].src;

  const handleQuickAdd = () => {
    if (!selectedSize && product.sizes.length > 0) {
      setShowQuickAdd(true);
      return;
    }
    addItem({
      id: String(product.id),
      slug: product.slug,
      title: product.title,
      price: product.priceNum,
      quantity: 1,
      color: product.colors[activeColor]?.name || "",
      size: selectedSize || product.sizes[0] || "",
      image: currentImage,
    });
    setShowQuickAdd(false);
    setSelectedSize("");
  };

  return (
    <div className="group relative" aria-label={product.title}>
      {/* Image Container */}
      <div
        className="relative aspect-[4/5] rounded-lg overflow-hidden bg-gray-100 cursor-pointer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Main Image */}
        <Image
          src={currentImage}
          alt={product.images[0].alt}
          fill
          className={`object-cover transition-opacity duration-500 ${hovered ? "opacity-0" : "opacity-100"}`}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        {/* Hover Image */}
        <Image
          src={hoverImage}
          alt={product.images[1]?.alt || product.images[0].alt}
          fill
          className={`object-cover transition-opacity duration-500 ${hovered ? "opacity-100" : "opacity-0"}`}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />

        {/* Badge */}
        {product.badge && (
          <span
            className={`absolute top-3 left-3 px-2.5 py-1 text-[10px] font-bold uppercase rounded-md z-10 ${
              product.badge === "Best Seller"
                ? "bg-primary text-white"
                : product.badge === "New"
                ? "bg-green-600 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            {product.badge}
          </span>
        )}

        {/* Action Buttons */}
        <div
          className={`absolute bottom-3 left-3 right-3 flex items-center justify-center gap-2 transition-all duration-300 z-10 ${
            hovered ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <button
            onClick={handleQuickAdd}
            className="flex-1 bg-white text-primary text-xs font-semibold py-2.5 rounded-lg hover:bg-primary hover:text-white transition-colors shadow-md"
            aria-label={`Quick add ${product.title}`}
          >
            <ShoppingBag size={14} className="inline mr-1.5" />
            Quick add
          </button>
          <button
            onClick={() => toggleItem(String(product.id))}
            className={`w-9 h-9 rounded-lg flex items-center justify-center shadow-md transition-colors ${
              isWishlisted(String(product.id)) ? "bg-red-500 text-white" : "bg-white text-primary hover:bg-red-50"
            }`}
            aria-label={`${isWishlisted(String(product.id)) ? "Remove from" : "Add to"} wishlist`}
          >
            <Heart size={14} fill={isWishlisted(String(product.id)) ? "currentColor" : "none"} />
          </button>
          <button
            className="w-9 h-9 rounded-lg bg-white text-primary flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors"
            aria-label="Compare"
          >
            <Repeat size={14} />
          </button>
          <button
            className="w-9 h-9 rounded-lg bg-white text-primary flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors"
            aria-label="Quick view"
          >
            <Eye size={14} />
          </button>
        </div>
      </div>

      {/* Quick Add Modal (inline) */}
      {showQuickAdd && (
        <div className="absolute top-0 left-0 right-0 z-20 bg-white rounded-lg shadow-xl border border-gray-100 p-4 animate-fade-in-up">
          <p className="text-xs font-semibold text-primary mb-2">Select size:</p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {product.sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                  selectedSize === size
                    ? "bg-primary text-white border-primary"
                    : "border-gray-200 text-gray-600 hover:border-primary"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleQuickAdd}
              disabled={!selectedSize}
              className="flex-1 bg-primary text-white text-xs font-semibold py-2 rounded-md disabled:opacity-40 hover:bg-secondary transition-colors"
            >
              Add to cart
            </button>
            <button
              onClick={() => { setShowQuickAdd(false); setSelectedSize(""); }}
              className="px-3 py-2 text-xs text-gray-500 hover:text-primary transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Product Info */}
      <div className="mt-3 space-y-1.5">
        {/* Title */}
        <a href="#" className="text-sm font-medium text-primary hover:text-peeper-gray transition-colors line-clamp-1">
          {product.title}
        </a>

        {/* Price */}
        <p className="text-base font-semibold text-primary">{product.price}</p>

        {/* Color Swatches */}
        {product.colors.length > 1 && (
          <div className="flex items-center gap-1.5">
            {product.colors.map((color, idx) => (
              <button
                key={color.name}
                onClick={() => setActiveColor(idx)}
                className={`w-4 h-4 rounded-full border-2 transition-all ${
                  activeColor === idx ? "border-primary scale-110" : "border-gray-300"
                } ${color.bgClass}`}
                aria-label={`Color: ${color.name}`}
                title={color.name}
              />
            ))}
          </div>
        )}

        {/* Size pills */}
        <div className="flex flex-wrap gap-1">
          {product.sizes.map((size) => (
            <span
              key={size}
              className="px-2 py-0.5 text-[10px] text-gray-500 bg-gray-100 rounded-md hover:bg-gray-200 cursor-pointer transition-colors"
            >
              {size}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
