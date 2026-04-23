"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { EffectFade, Autoplay, Pagination } from "swiper/modules";
import { ArrowRight } from "lucide-react";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";

const slides = [
  {
    image: "https://picsum.photos/2000/1125?random=100",
    subtitle: "New Season Collection",
    title: "The Summer\nEdit Drops",
    cta: "Shop collection",
  },
  {
    image: "https://picsum.photos/2000/1125?random=101",
    subtitle: "Best Spring Style",
    title: "Glamorous\n& Glowing",
    cta: "Discover now",
  },
  {
    image: "https://picsum.photos/2000/1125?random=102",
    subtitle: "Trending Fashion",
    title: "New Arrivals\nFor You",
    cta: "Shop collection",
  },
];

export default function HeroSlider() {
  return (
    <section className="relative w-full" aria-label="Hero slider">
      <Swiper
        modules={[EffectFade, Autoplay, Pagination]}
        effect="fade"
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        loop
        className="w-full h-[60vh] sm:h-[70vh] lg:h-[90vh]"
      >
        {slides.map((slide, i) => (
          <SwiperSlide key={i}>
            <div className="relative w-full h-full">
              <img
                src={slide.image}
                alt={slide.title.replace("\n", " ")}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />
              <div className="absolute inset-0 flex items-center">
                <div className="max-w-[1440px] mx-auto px-4 w-full">
                  <div className="max-w-xl">
                    <p
                      className="text-white/80 text-sm sm:text-base uppercase tracking-widest mb-3 opacity-0 animate-fade-in-up"
                      style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}
                    >
                      {slide.subtitle}
                    </p>
                    <h1
                      className="text-white text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight whitespace-pre-line opacity-0 animate-fade-in-up"
                      style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}
                    >
                      {slide.title}
                    </h1>
                    <a
                      href="#shop"
                      className="inline-flex items-center gap-2 mt-6 sm:mt-8 bg-white text-primary px-6 py-3 text-sm font-semibold rounded-full hover:bg-gray-100 transition-all opacity-0 animate-fade-in-up group"
                      style={{ animationDelay: "0.6s", animationFillMode: "forwards" }}
                    >
                      {slide.cta}
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
