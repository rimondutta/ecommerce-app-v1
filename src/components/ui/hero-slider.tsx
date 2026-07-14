"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

interface SlideData {
  id: string;
  image: string;
  headline: string;
  subtext: string;
  ctaText: string;
  ctaLink: string;
}

interface HeroSliderProps {
  slides: SlideData[];
}

export default function HeroSlider({ slides }: HeroSliderProps) {
  return (
    <div className="w-full relative bg-white">
      <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectFade]}
        effect="fade"
        speed={700}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }}
        className="w-full h-[60vh] md:h-[70vh] lg:h-[85vh] [&_.swiper-pagination-bullet-active]:bg-white [&_.swiper-pagination-bullet]:bg-white/50 [&_.swiper-button-next]:text-white [&_.swiper-button-prev]:text-white"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="relative w-full h-full">
              {/* Image */}
              <div className="absolute inset-0 bg-[#f5f5f5]">
                <Image
                  src={slide.image}
                  alt={slide.headline}
                  fill
                  sizes="100vw"
                  className="object-cover"
                  priority
                />
              </div>

              {/* Content Overlay */}
              <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12 lg:p-16 bg-gradient-to-t from-black/60 via-black/20 to-transparent">
                <div className="max-w-4xl text-white space-y-4 md:space-y-6">
                  <h1 className="font-display font-medium uppercase text-[48px] md:text-[80px] lg:text-[96px] leading-[0.9] tracking-tight text-white drop-shadow-md">
                    {slide.headline}
                  </h1>
                  <p className="font-sans font-medium text-lg md:text-xl text-white max-w-xl drop-shadow-md">
                    {slide.subtext}
                  </p>
                  <div className="pt-4 md:pt-6">
                    <Link 
                      href={slide.ctaLink}
                      className="inline-flex bg-white text-black font-sans font-medium text-base md:text-lg px-8 py-4 rounded-full hover:bg-neutral-200 transition-colors"
                    >
                      {slide.ctaText}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
