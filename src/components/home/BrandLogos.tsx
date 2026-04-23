"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

const brands = [
  "CHANEL", "DIOR", "GUCCI", "PRADA", "VERSACE", "BURBERRY",
  "FENDI", "HERMES", "BALENCIAGA", "VALENTINO",
];

export default function BrandLogos() {
  return (
    <section className="py-10 border-y border-gray-100" aria-label="Brand partners">
      <div className="max-w-[1440px] mx-auto px-4">
        <Swiper
          modules={[Autoplay]}
          autoplay={{ delay: 2000, disableOnInteraction: false }}
          slidesPerView={3}
          spaceBetween={30}
          loop
          breakpoints={{
            640: { slidesPerView: 4 },
            1024: { slidesPerView: 6 },
          }}
        >
          {brands.map((brand) => (
            <SwiperSlide key={brand}>
              <div className="flex items-center justify-center h-16 grayscale hover:grayscale-0 opacity-40 hover:opacity-100 transition-all duration-300 cursor-pointer">
                <span className="text-xl font-bold tracking-widest text-gray-700">{brand}</span>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
