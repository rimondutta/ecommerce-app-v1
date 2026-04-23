"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";

const testimonials = [
  {
    stars: 5,
    heading: "Best Quality Products",
    text: "I absolutely love my new outfit! The quality is amazing and it fits perfectly. The delivery was fast and the packaging was beautiful. Highly recommend!",
    author: "Sarah M.",
    location: "Dhaka, BD",
    product: { name: "Ribbed Tank Top", price: "৳1,865", image: "https://picsum.photos/80/100?random=1" },
  },
  {
    stars: 5,
    heading: "Amazing Customer Service",
    text: "The customer service team was incredibly helpful when I needed to exchange sizes. The process was smooth and my new items arrived quickly.",
    author: "Emily R.",
    location: "Chattogram, BD",
    product: { name: "Cotton Jersey Top", price: "৳985", image: "https://picsum.photos/80/100?random=9" },
  },
  {
    stars: 5,
    heading: "Fast Shipping & Great Packaging",
    text: "Ordered on Monday, received on Wednesday. The packaging was eco-friendly and the clothes looked exactly as pictured on the website.",
    author: "Jessica K.",
    location: "Sylhet, BD",
    product: { name: "Loose Fit Hoodie", price: "৳2,745", image: "https://picsum.photos/80/100?random=7" },
  },
  {
    stars: 4,
    heading: "Stylish & Comfortable",
    text: "These are now my go-to everyday clothes. They're comfortable enough for all day wear but still look stylish enough for a night out.",
    author: "Maria L.",
    location: "Rajshahi, BD",
    product: { name: "Linen-Blend Dress", price: "৳3,735", image: "https://picsum.photos/80/100?random=10" },
  },
  {
    stars: 5,
    heading: "Great Value for Money",
    text: "I was surprised by the quality considering the price point. These clothes rival brands that charge three times as much. I'll definitely be a returning customer.",
    author: "Amy C.",
    location: "Khulna, BD",
    product: { name: "Slim Fit Sweater", price: "৳2,085", image: "https://picsum.photos/80/100?random=5" },
  },
];

export default function Testimonials() {
  const swiperRef = useRef<SwiperType | null>(null);

  return (
    <section className="py-16 lg:py-20" aria-label="Customer testimonials">
      <div className="max-w-[1440px] mx-auto px-4">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-primary">Happy Clients</h2>
            <p className="text-sm text-gray-500 mt-2">
              Hear what our customers have to say
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => swiperRef.current?.slidePrev()}
              className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => swiperRef.current?.slideNext()}
              className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <Swiper
          modules={[Navigation]}
          onSwiper={(swiper) => { swiperRef.current = swiper; }}
          slidesPerView={1}
          spaceBetween={20}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3, spaceBetween: 24 },
          }}
        >
          {testimonials.map((t, i) => (
            <SwiperSlide key={i}>
              <div className="border border-gray-100 rounded-xl p-6 h-full flex flex-col">
                {/* Stars */}
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: 5 }, (_, j) => (
                    <Star
                      key={j}
                      size={14}
                      className={j < t.stars ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}
                    />
                  ))}
                </div>

                <h4 className="font-semibold text-sm text-primary mb-2">{t.heading}</h4>
                <p className="text-xs text-gray-500 leading-relaxed flex-1">&ldquo;{t.text}&rdquo;</p>

                <div className="mt-4 pt-4 border-t border-gray-50">
                  <p className="text-xs font-semibold text-primary">{t.author}</p>
                  <p className="text-[10px] text-gray-400">{t.location}</p>
                </div>

                {/* Product reference */}
                <div className="mt-3 flex items-center gap-3 bg-gray-50 rounded-lg p-2">
                  <div className="w-10 h-12 relative rounded overflow-hidden shrink-0 bg-gray-200">
                    <Image
                      src={t.product.image}
                      alt={t.product.name}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-primary truncate">{t.product.name}</p>
                    <p className="text-[10px] font-semibold text-primary">{t.product.price}</p>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
