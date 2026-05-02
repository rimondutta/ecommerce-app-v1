"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import MagneticElement from "@/components/ui/MagneticElement";

export default function EditorialHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  useEffect(() => {
    const initGsap = async () => {
      const { gsap } = await import("@/lib/gsap");

      if (!containerRef.current) return;

      const ctx = gsap.context(() => {
        if (imageRef.current) {
          gsap.fromTo(
            imageRef.current,
            { scale: 1.1, filter: "blur(10px)", opacity: 0 },
            { scale: 1, filter: "blur(0px)", opacity: 1, duration: 2, ease: "power3.out" }
          );
        }

        if (contentRef.current) {
          const elements = contentRef.current.children;
          gsap.fromTo(
            elements,
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              stagger: 0.15,
              duration: 1.2,
              ease: "power3.out",
              delay: 0.5
            }
          );
        }
      }, containerRef);

      return () => ctx.revert();
    };

    initGsap();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative h-[100vh] min-h-[700px] w-full overflow-hidden bg-zinc-50 flex items-center justify-center"
    >
      {/* Background Image with Framer Motion Parallax */}
      <motion.div
        ref={imageRef}
        className="absolute inset-0 w-full h-full will-change-transform"
        style={{ y, opacity: 0 }}
      >
        <Image
          src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2040&auto=format&fit=crop"
          alt="Premium Fashion"
          fill
          className="object-cover object-center"
          sizes="100vw"
          priority
        />
        {/* Soft elegant gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/40 via-zinc-900/20 to-zinc-900/60" />
      </motion.div>

      {/* Hero Typography */}
      <motion.div
        ref={contentRef}
        style={{ opacity }}
        className="relative z-10 flex flex-col items-center text-center px-6 md:px-24 w-full max-w-5xl mx-auto will-change-transform mt-20"
      >
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-xs font-medium tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            New Collection 2024
          </div>
        </div>

        <h1 className="font-display font-bold text-5xl md:text-7xl lg:text-[8vw] leading-[1.1] tracking-tight text-white mb-6">
          Modern.<br/>
          Elegant.<br/>
          Timeless.
        </h1>

        <p className="text-white/80 text-sm md:text-lg font-medium max-w-xl leading-relaxed mb-10">
          Exquisite apparel designed for the modern individual. Merging superior comfort with contemporary silhouettes and premium craftsmanship.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <MagneticElement strength={0.1}>
            <Link
              href="/products"
              className="bg-white text-zinc-900 hover:bg-zinc-100 px-8 py-4 rounded-full font-semibold text-sm transition-all shadow-soft-xl hover:shadow-soft-2xl hover:-translate-y-0.5 active:translate-y-0"
            >
              Shop Collection
            </Link>
          </MagneticElement>

          <MagneticElement strength={0.1}>
            <Link
              href="/lookbook"
              className="bg-zinc-900/30 backdrop-blur-md text-white border border-white/20 hover:bg-zinc-900/50 px-8 py-4 rounded-full font-semibold text-sm transition-all"
            >
              View Lookbook
            </Link>
          </MagneticElement>
        </div>
      </motion.div>
    </section>
  );
}
