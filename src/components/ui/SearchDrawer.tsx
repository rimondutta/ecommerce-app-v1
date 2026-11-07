"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, X, Loader2, ArrowRight } from "lucide-react";
import { trackSearch } from "@/lib/fbPixel";

interface SearchProduct {
  _id: string;
  title: string;
  slug?: string;
  price?: number;
  images?: Array<{ url?: string }>;
  image?: string;
}

interface SearchDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchDrawer({ isOpen, onClose }: SearchDrawerProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when drawer opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Fetch search results with debounce
  useEffect(() => {
    if (!query.trim()) {
      return;
    }
    const timer = setTimeout(() => {
      setLoading(true);
      fetch(`/api/store/products?search=${encodeURIComponent(query)}`)
        .then((res) => res.json())
        .then((d) => {
          setResults(d.products || d.data || []);
          if ((d.products || d.data)?.length > 0) {
            try { trackSearch(query); } catch { /* noop */ }
          }
        })
        .catch(() => { })
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Reset query when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => setQuery(""), 300); // Wait for exit animation
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
        {/* Header / Input */}
        <div className="p-4 border-b flex items-center gap-3">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search products..."
            value={query}
            onChange={(e) => {
              const val = e.target.value;
              setQuery(val);
              if (!val.trim()) {
                setResults([]);
                setLoading(false);
              }
            }}
            className="flex-1 bg-transparent border-none outline-none text-base placeholder:text-gray-400"
          />
          {loading && <Loader2 className="w-5 h-5 animate-spin text-gray-400" />}
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {query.trim() === "" ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              Type something to search products...
            </div>
          ) : results.length === 0 && !loading ? (
            <div className="text-center py-12 text-gray-500 text-sm">
              No products found for &quot;{query}&quot;
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((product) => {
                const image = product.images?.[0]?.url || product.image || "/placeholder.png";
                return (
                  <Link
                    key={product._id}
                    href={`/products/${product.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors group"
                  >
                    <div className="w-14 h-14 relative bg-gray-100 rounded-lg overflow-hidden shrink-0">
                      <Image
                        src={image}
                        alt={product.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900 truncate">
                        {product.title}
                      </h4>
                      <p className="text-xs text-gray-500">
                        ৳{product.price?.toLocaleString()}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
