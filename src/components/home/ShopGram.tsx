"use client";

import Image from "next/image";
import { ShoppingBag } from "lucide-react";

const images = Array.from({ length: 5 }, (_, i) => ({
  src: `https://picsum.photos/400/400?random=${70 + i}`,
  alt: `Instagram style photo ${i + 1}`,
}));

export default function ShopGram() {
  return (
    <section className="py-16 lg:py-20" aria-label="Shop from Instagram">
      <div className="max-w-[1440px] mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-primary">Shop Gram</h2>
          <p className="text-sm text-gray-500 mt-2">
            Discover our latest looks on Instagram
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {images.map((img, i) => (
            <a
              key={i}
              href="#"
              className="group relative aspect-square rounded-lg overflow-hidden"
              aria-label={`Instagram photo ${i + 1}`}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                <span className="w-10 h-10 rounded-full bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all duration-300">
                  <ShoppingBag size={16} className="text-primary" />
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
