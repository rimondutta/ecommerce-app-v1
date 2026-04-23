"use client";

import { useState } from "react";
import { products } from "@/data/products";
import ProductCard from "@/components/ui/ProductCard";

export default function BestSellers() {
  const [visibleCount, setVisibleCount] = useState(8);
  const displayProducts = products.slice(0, visibleCount);

  return (
    <section className="py-16 lg:py-20" id="products" aria-label="Best seller products">
      <div className="max-w-[1440px] mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-primary">Best Seller</h2>
          <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
            Shop the most popular items loved by our customers
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {displayProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {visibleCount < products.length && (
          <div className="text-center mt-10">
            <button
              onClick={() => setVisibleCount((prev) => Math.min(prev + 4, products.length))}
              className="px-8 py-3 border-2 border-primary text-primary text-sm font-semibold rounded-full hover:bg-primary hover:text-white transition-all duration-300"
              aria-label="Load more products"
            >
              Load more
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
