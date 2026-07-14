"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

const OVERLAY_COLORS: Record<string, string> = {
  sun:   "bg-sun/20",
  coral: "bg-coral/20",
  mint:  "bg-mint/20",
  grape: "bg-grape/20",
};

interface CategoryTileProps {
  name: string;
  slug: string;
  image?: string;
  accent?: "sun" | "coral" | "mint" | "grape";
  className?: string;
}

export default function CategoryTile({ name, slug, image, accent = "sun", className }: CategoryTileProps) {
  return (
    <Link
      href={`/products?category=${name}`}
      className={cn(
        "group relative overflow-hidden rounded-[var(--radius-card)]",
        "aspect-[4/3] md:aspect-auto",
        className
      )}
    >
      {/* Image */}
      {image ? (
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, 33vw"
        />
      ) : (
        <div className="absolute inset-0 bg-shelf-wood" />
      )}

      {/* Color Overlay */}
      <div className={cn(
        "absolute inset-0 transition-opacity duration-300",
        OVERLAY_COLORS[accent],
        "group-hover:opacity-80 opacity-60"
      )} />

      {/* Darkening gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-ink/20 to-transparent" />

      {/* Label */}
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
        <h3 className="font-display font-bold text-lg md:text-xl text-paper drop-shadow-md">
          {name}
        </h3>
      </div>
    </Link>
  );
}
