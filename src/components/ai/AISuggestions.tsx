"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SuggestedProduct } from '@/lib/ai/suggestions';
import { Sparkles, Star, Package } from 'lucide-react';

interface AISuggestionsProps {
  productId?: string;
  initialSuggestions?: SuggestedProduct[];
  compact?: boolean;
}

export default function AISuggestions({
  productId,
  initialSuggestions,
  compact = false,
}: AISuggestionsProps) {
  const [suggestions, setSuggestions] = useState<SuggestedProduct[]>(initialSuggestions || []);
  const [loading, setLoading] = useState(!initialSuggestions?.length && Boolean(productId));

  useEffect(() => {
    if (initialSuggestions && initialSuggestions.length > 0) {
      setSuggestions(initialSuggestions);
      return;
    }

    if (!productId) return;

    let isMounted = true;
    fetch(`/api/ai/suggest?productId=${encodeURIComponent(productId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.suggestions && Array.isArray(data.suggestions)) {
          setSuggestions(data.suggestions);
        }
      })
      .catch((err) => console.warn('[AISuggestions] fetch error:', err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [productId, initialSuggestions]);

  if (loading) {
    return (
      <div className="py-6 space-y-4 font-bengali">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-purple-200 animate-spin" />
          <span className="text-sm font-semibold text-gray-500">আপনার জন্য AI সাজেশন লোড হচ্ছে...</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-100 rounded-xl h-48 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  if (compact) {
    return (
      <div className="space-y-3 font-bengali">
        <div className="flex items-center gap-1.5 text-xs font-bold text-purple-700">
          <Sparkles size={14} className="text-purple-600 animate-pulse" />
          <span>আপনার পছন্দ হতে পারে এমন কিছু খেলনা:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {suggestions.map((p) => (
            <Link
              key={p._id}
              href={`/products/${p.slug}`}
              className="flex gap-2.5 p-2 rounded-xl bg-purple-50/70 hover:bg-purple-100/70 border border-purple-200/50 transition-colors"
            >
              <div className="relative w-12 h-12 rounded-lg bg-white overflow-hidden shrink-0 border border-purple-100">
                {p.image ? (
                  <Image src={p.image} alt={p.title} fill sizes="48px" className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Package size={16} />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-900 truncate">{p.title}</p>
                <p className="text-[11px] text-purple-700 truncate leading-tight mt-0.5">{p.reason}</p>
                <p className="text-xs font-bold text-gray-900 mt-0.5">৳{p.price.toLocaleString()}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className="py-8 font-bengali">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-sm">
            <Sparkles size={18} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">আপনার জন্য AI সাজেশন</h3>
            <p className="text-xs text-gray-500">বিশেষজ্ঞ বুদ্ধিমত্তা দিয়ে বাছাইকৃত সেরা খেলনাসমূহ</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {suggestions.map((item) => (
          <Link
            key={item._id}
            href={`/products/${item.slug}`}
            className="group flex flex-col bg-white rounded-2xl border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all overflow-hidden"
          >
            <div className="relative aspect-square w-full bg-gray-50 overflow-hidden">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Package size={32} />
                </div>
              )}
              {item.badge && (
                <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/80 text-white text-[10px] font-bold rounded-full">
                  {item.badge}
                </span>
              )}
            </div>

            <div className="p-3 flex-1 flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold text-gray-900 line-clamp-2 group-hover:text-purple-600 transition-colors">
                  {item.title}
                </p>
                {item.reason && (
                  <p className="text-[11px] text-purple-700 bg-purple-50 px-2 py-1 rounded-md mt-1.5 line-clamp-2 font-medium">
                    ✨ {item.reason}
                  </p>
                )}
              </div>

              <div className="mt-3 flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-sm font-bold text-gray-900">৳{item.price.toLocaleString()}</span>
                  {item.compareAtPrice && item.compareAtPrice > item.price && (
                    <span className="text-xs text-gray-400 line-through">
                      ৳{item.compareAtPrice.toLocaleString()}
                    </span>
                  )}
                </div>
                {item.rating ? (
                  <div className="flex items-center gap-0.5 text-amber-500 text-xs font-semibold">
                    <Star size={12} fill="currentColor" />
                    <span>{item.rating}</span>
                  </div>
                ) : null}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

