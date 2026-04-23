"use client";

import { useState, useMemo } from "react";
import { useCart } from "@/components/providers/CartProvider";
import { useWishlist } from "@/components/providers/WishlistProvider";
import { Heart, ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export default function ModernProductGrid({ 
  initialProducts = [], 
  categories = [] 
}: { 
  initialProducts?: any[],
  categories?: any[]
}) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [visibleCount, setVisibleCount] = useState(8);
  const { addItem } = useCart();
  const { toggleItem, isWishlisted } = useWishlist();

  const normalizedProducts = useMemo(() => {
    return initialProducts.map(p => ({
      id: p._id?.toString() || p.id,
      title: p.title,
      priceNum: p.price,
      category: typeof p.category === 'object' ? p.category.name : (p.category || "Uncategorized"),
      categorySlug: typeof p.category === 'object' ? p.category.slug : "",
      images: p.images?.map((img: any) => ({ src: img.url, alt: img.alt })) || [],
      colors: p.colors?.map((c: any) => ({ name: c.name, hex: c.hex || c.value })) || [],
      sizes: p.sizes || [],
      slug: p.slug,
      badge: p.badge
    }));
  }, [initialProducts]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "all") return normalizedProducts;
    return normalizedProducts.filter(p => 
      p.category?.toLowerCase() === selectedCategory.toLowerCase() ||
      p.categorySlug?.toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [normalizedProducts, selectedCategory]);

  const displayProducts = filteredProducts.slice(0, visibleCount);

  return (
    <section className="relative px-4 md:px-16 py-40 max-w-[1800px] mx-auto bg-[#f0ece5]">
      <div className="flex flex-col lg:flex-row items-end justify-between mb-32 gap-12">
        <div className="space-y-6">
          <h2 className="font-display font-black uppercase text-6xl md:text-[8rem] tracking-tighter leading-[0.85] text-black">
            The<br /><span className="italic opacity-60 font-light">Archive</span>
          </h2>
        </div>
        
        <div className="flex flex-wrap gap-6 border-b border-black/10 pb-6 w-full lg:w-auto">
           {["all", ...categories.map(c => c.name)].map((cat) => (
             <button
               key={cat}
               onClick={() => {
                 setSelectedCategory(cat.toLowerCase());
                 setVisibleCount(8); 
               }}
               className={`text-[12px] font-mono uppercase tracking-[0.2em] transition-all relative ${
                 selectedCategory === cat.toLowerCase() 
                   ? "text-black font-black" 
                   : "text-black/40 hover:text-black"
               }`}
             >
               {cat}
               {selectedCategory === cat.toLowerCase() && (
                 <motion.div layoutId="underline" className="absolute -bottom-[25px] left-0 w-full h-[2px] bg-black" />
               )}
             </button>
           ))}
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="py-40 text-center">
           <span className="font-mono text-sm uppercase tracking-widest text-black/20 italic">
              No Pieces Found
           </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-32 relative">
          {displayProducts.map((product, idx) => {
            const isFavorited = isWishlisted(product.id);
            // Create an asymmetrical layout by margin-topping alternating columns
            const offsetClass = idx % 2 !== 0 ? "lg:mt-32" : "";
            
            return (
              <motion.div 
                key={product.id || idx} 
                className={`group flex flex-col ${offsetClass}`}
                initial={{ opacity: 0, y: 100 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="relative aspect-[3/4] bg-black overflow-hidden rounded-2xl" data-cursor="VIEW">
                  <Link href={`/products/${product.slug}`} className="absolute inset-0 z-[1]">
                    <Image
                      src={product.images[0]?.src || "/placeholder.jpg"}
                      alt={product.title}
                      fill
                      className="object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-[0.16,1,0.3,1]"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  </Link>
                  
                  <div className="absolute top-6 right-6 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                    <button 
                      onClick={(e) => { e.preventDefault(); toggleItem(product.id); }}
                      className={`w-12 h-12 flex items-center justify-center rounded-full transition-all backdrop-blur-md ${
                         isFavorited ? "bg-black text-white" : "bg-white/80 text-black hover:bg-black hover:text-white"
                      }`}
                      data-cursor="WISHLIST"
                    >
                      <Heart size={18} fill={isFavorited ? "currentColor" : "none"} strokeWidth={1.5} />
                    </button>
                    <button 
                      onClick={(e) => { 
                        e.preventDefault(); 
                        // If product has variations, navigate to product page instead of quick add
                        if (product.colors?.length > 0 || product.sizes?.length > 0) {
                          window.location.href = `/products/${product.slug}`;
                          return;
                        }
                        addItem({ 
                          id: product.id, slug: product.slug, title: product.title, 
                          price: product.priceNum, quantity: 1, color: "Default", 
                          size: "Default", image: product.images[0]?.src || ""
                        });
                      }}
                      className="w-12 h-12 flex items-center justify-center bg-white/80 backdrop-blur-md rounded-full text-black hover:bg-black hover:text-white transition-all"
                      data-cursor="CART"
                    >
                      <ShoppingBag size={18} strokeWidth={1.5} />
                    </button>
                  </div>
  
                  {product.badge && (
                    <div className="absolute top-6 left-6">
                       <span className="bg-white/90 backdrop-blur-md text-black text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-full">
                         {product.badge}
                       </span>
                    </div>
                  )}
                </div>
  
                <div className="mt-8 space-y-2 relative">
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="text-sm font-sans font-black uppercase tracking-tight text-black">
                      <Link href={`/products/${product.slug}`} className="hover:opacity-60 transition-opacity">
                        {product.title}
                      </Link>
                    </h3>
                    <span className="text-sm font-mono tracking-tighter text-black/80">৳{Math.round(product.priceNum).toLocaleString()}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-black/60 uppercase tracking-widest">
                        {product.category}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {visibleCount < filteredProducts.length && (
        <div className="mt-40 flex justify-center">
          <button
            onClick={() => setVisibleCount(prev => prev + 8)}
            className="group relative px-16 py-6 bg-transparent text-black border border-black/20 rounded-full font-mono font-bold uppercase tracking-[0.3em] text-[10px] hover:bg-black hover:text-white transition-all duration-500"
          >
            Load More Pieces
          </button>
        </div>
      )}
    </section>
  );
}
