"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import "swiper/css";
import "swiper/css/navigation";

const categories = [
  { name: "Clothing", image: "https://picsum.photos/500/700?random=80" },
  { name: "Sunglasses", image: "https://picsum.photos/500/700?random=81" },
  { name: "Bags", image: "https://picsum.photos/500/700?random=82" },
  { name: "Fashion", image: "https://picsum.photos/500/700?random=83" },
  { name: "Accessories", image: "https://picsum.photos/500/700?random=84" },
];

export default function ShopByCategory() {
  return (
    <section className="py-16 lg:py-20" aria-label="Shop by categories">
      <div className="max-w-[1440px] mx-auto px-4">
        <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-primary mb-8">
          Shop By Categories
        </h2>

        <div className="flex gap-6">
          {/* Swiper area - 75% */}
          <div className="w-full lg:w-3/4">
            <Swiper
              modules={[Navigation]}
              slidesPerView={1.2}
              spaceBetween={16}
              navigation
              breakpoints={{
                640: { slidesPerView: 2, spaceBetween: 20 },
                1024: { slidesPerView: 3, spaceBetween: 24 },
              }}
            >
              {categories.map((cat) => (
                <SwiperSlide key={cat.name}>
                  <a href="#" className="group block relative rounded-xl overflow-hidden">
                    <div className="aspect-[5/7] relative">
                      <Image
                        src={cat.image}
                        alt={cat.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 25vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                      <span className="text-white font-semibold text-base">{cat.name}</span>
                      <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                        <ArrowRight size={14} className="text-primary" />
                      </span>
                    </div>
                  </a>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* Promo card - 25% */}
          <div className="hidden lg:flex w-1/4 bg-accent rounded-xl p-6 flex-col justify-center items-start">
            <h3 className="text-lg font-semibold text-primary mb-2">
              Discovery all new items
            </h3>
            <p className="text-sm text-gray-500 mb-5">
              Explore our latest collection with fresh styles for every season.
            </p>
            <a
              href="#"
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary border-b border-primary pb-0.5 hover:gap-2 transition-all group"
            >
              Shop now
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
