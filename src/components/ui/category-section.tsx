"use client";

import React, { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Category {
  name: string;
  slug: string;
  image: string;
}

interface CategorySectionProps {
  categories: Category[];
}

export default function CategorySection({ categories }: CategorySectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!categories || categories.length === 0) return null;

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  return (
    <section className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-sans text-2xl md:text-[28px] text-black tracking-wide">
          Featured Collections
        </h2>
        <Link
          href="/products"
          className="text-xs font-semibold text-black uppercase tracking-wider underline underline-offset-4 decoration-1 hover:text-gray-600 transition-colors"
        >
          VIEW ALL
        </Link>
      </div>

      {/* Carousel/Grid Container */}
      <div 
        ref={scrollRef}
        className="flex overflow-x-auto snap-x snap-mandatory gap-4 md:gap-6 pb-4 scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {categories.map((category, i) => (
          <Link
            key={category.slug}
            href={`/products?category=${category.slug}`}
            className="group flex-none w-[280px] md:w-[calc(25%-18px)] snap-start flex flex-col cursor-pointer"
          >
            {/* Image Container */}
            <div className="relative w-full aspect-[4/3] mb-4 bg-gray-50 overflow-hidden">
              <Image
                src={category.image || "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=800"}
                alt={category.name}
                fill
                sizes="(max-width: 768px) 280px, 25vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                priority={i === 0}
              />
            </div>

            {/* Content */}
            <h3 className="font-sans text-base md:text-lg text-black mb-1.5 transition-colors">
              {category.name}
            </h3>
            <span className="text-xs font-medium text-black underline underline-offset-4 decoration-1 hover:text-gray-600 transition-colors inline-block w-fit">
              Shop Now
            </span>
          </Link>
        ))}
      </div>

      {/* Navigation Arrows (Desktop only) */}
      {categories.length > 4 && (
        <div className="hidden md:flex justify-end gap-3 mt-6">
          <button 
            onClick={() => scroll("left")}
            className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-black hover:text-black transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <button 
            onClick={() => scroll("right")}
            className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-black hover:text-black transition-colors"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>
      )}
      
      {/* Fallback CSS for hiding scrollbar if style object doesn't work */}
      <style dangerouslySetInnerHTML={{__html: `
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
      `}} />
    </section>
  );
}
