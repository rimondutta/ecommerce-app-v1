"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";
import { useQuickLook } from "@/store/quickLookStore";

interface EditorialSectionProps {
  product: any;
  index: number;
}

export default function EditorialSection({ product, index }: EditorialSectionProps) {
  const { openQuickLook } = useQuickLook();
  const mainImage = product.images?.[0]?.url || product.images?.[0]?.src || "https://placehold.co/1200x800?text=Editorial+Pick";

  return (
    <motion.div 
      className="col-span-full grid grid-cols-1 lg:grid-cols-12 gap-0 bg-neutral-900 overflow-hidden min-h-[70vh] my-12 relative"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Visual Side */}
      <div className="lg:col-span-7 relative h-[50vh] lg:h-auto overflow-hidden group">
        <Image
          src={mainImage}
          alt={product.title}
          fill
          className="object-cover transition-transform duration-[3s] ease-out group-hover:scale-110"
          sizes="(max-width: 1024px) 100vw, 60vw"
          priority
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
        
        {/* Floating Badge */}
        <div className="absolute top-12 left-12 flex items-center gap-4 bg-white px-6 py-4 rounded-full shadow-2xl">
            <Star className="fill-black text-black" size={16} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Editorial Selection 0{index + 1}</span>
        </div>
      </div>

      {/* Content Side */}
      <div className="lg:col-span-5 flex flex-col justify-center p-12 lg:p-24 space-y-12 text-white relative">
        <div className="space-y-6">
          <span className="text-[12px] font-black uppercase tracking-[0.6em] text-white/70 italic font-serif">
            FEATURED ARCHIVE PIECE
          </span>
          <h2 className="text-6xl lg:text-8xl font-black uppercase tracking-tighter leading-[0.85] break-words">
            {product.title}
          </h2>
        </div>

        <p className="text-xl text-white/80 font-serif italic max-w-md leading-relaxed">
          "{product.description || "A masterclass in modern silhouette and fabric engineering, defined by its exceptional drape and timeless presence in any collection."}"
        </p>

        <div className="flex flex-col sm:flex-row gap-6">
          <button
            onClick={() => openQuickLook(product)}
            className="px-10 py-6 bg-white text-black text-[11px] font-black uppercase tracking-[0.4em] hover:bg-neutral-200 transition-all flex items-center justify-center gap-4"
            data-cursor="LOOK"
          >
            Quick View <ArrowRight size={18} />
          </button>
          
          <Link
            href={`/products/${product.slug}`}
            className="px-10 py-6 border border-white/20 text-white text-[11px] font-black uppercase tracking-[0.4em] hover:bg-white hover:text-black transition-all flex items-center justify-center"
          >
            Full Story
          </Link>
        </div>

        {/* Decorative Background Text */}
        <div className="absolute -bottom-10 -right-10 text-[200px] font-black text-white/[0.03] pointer-events-none select-none uppercase tracking-tighter">
          {index + 1}
        </div>
      </div>
    </motion.div>
  );
}
