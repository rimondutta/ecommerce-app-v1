"use client";

import { Fragment, useState, useMemo, useEffect } from "react";
import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import { X, Search as SearchIcon, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
const quickLinks = ["Fashion", "Men", "Women", "Shoes", "Accessories"];

interface SearchDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchDrawer({ isOpen, onClose }: SearchDrawerProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [featured, setFeatured] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch featured products for empty state
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch('/api/store/products?limit=3');
        const data = await res.json();
        setFeatured(data.products || []);
      } catch (err) {
        console.error("Failed to fetch featured products:", err);
      }
    };
    fetchFeatured();
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/store/products?search=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.products || []);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchResults, 300);
    return () => clearTimeout(timer);
  }, [query]);


  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-[600]">
        <TransitionChild
          as={Fragment}
          enter="transition-opacity ease-linear duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm cursor-pointer" 
            aria-hidden="true" 
            onClick={onClose}
          />
        </TransitionChild>

        <TransitionChild
          as={Fragment}
          enter="transform transition ease-in-out duration-300"
          enterFrom="translate-x-full"
          enterTo="translate-x-0"
          leave="transform transition ease-in-out duration-200"
          leaveFrom="translate-x-0"
          leaveTo="translate-x-full"
        >
          <DialogPanel className="fixed inset-y-0 right-0 w-full sm:w-[500px] bg-white border-l-4 border-black flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.3)]">
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-8 border-b-2 border-black/5">
              <h2 className="font-display font-black text-4xl uppercase tracking-tighter leading-none">
                FIND YOUR<br />
                <span className="italic opacity-40 font-light">STYLE</span>
              </h2>
              <button
                onClick={onClose}
                className="w-12 h-12 bg-black text-white hover:bg-white hover:text-black border-2 border-black transition-all flex items-center justify-center group"
                aria-label="Close search"
              >
                <X size={20} className="group-hover:rotate-90 transition-transform duration-500" />
              </button>
            </div>

            {/* Search Input Section */}
            <div className="px-8 py-10 bg-white">
              <div className="relative group">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="START TYPING..."
                  className="w-full bg-white border-b-4 border-black px-0 py-6 text-xl font-black uppercase tracking-widest placeholder:text-black/10 outline-none transition-all"
                  autoFocus
                  aria-label="Search products"
                />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <SearchIcon size={24} strokeWidth={2.5} className="text-black" />
                </div>
              </div>
              
              <div className="mt-10">
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-black/30 mb-6">Popular Tags</p>
                <div className="flex flex-wrap gap-3">
                  {quickLinks.map((link) => (
                    <button
                      key={link}
                      onClick={() => setQuery(link)}
                      className="px-6 py-3 text-[10px] font-black uppercase tracking-widest border border-black/10 hover:border-black transition-all"
                    >
                      {link}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-8 py-8">
              {query.trim() === "" ? (
                /* Recommendation State */
                <div className="space-y-8">
                  <div className="flex items-center gap-4">
                    <h4 className="font-display font-black text-xl uppercase tracking-tighter">YOU MIGHT LIKE</h4>
                    <div className="flex-1 h-[2px] bg-black"></div>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {featured.slice(0, 3).map((product) => (
                      <Link 
                        key={product._id} 
                        href={`/products/${product.slug}`} 
                        onClick={onClose}
                        className="flex items-center gap-6 p-4 border-2 border-transparent hover:border-black hover:bg-gray-50 transition-all group"
                      >
                        <div className="w-20 h-24 relative border-2 border-black shrink-0 overflow-hidden">
                          <Image
                            src={(product.images?.[0]?.url && product.images[0].url.length > 1) ? product.images[0].url : "/placeholder.jpg"}
                            alt={product.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                            sizes="80px"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-display font-black text-lg uppercase leading-tight mb-1">{product.title}</p>
                          <p className="font-black text-sm italic">৳{Math.round(product.price || 0).toLocaleString()}</p>
                          <span className="inline-block mt-2 text-[10px] font-bold border-b-2 border-black opacity-0 group-hover:opacity-100 transition-opacity">VIEW PRODUCT</span>
                        </div>
                      </Link>
                    ))}
                  </div>

                </div>
              ) : (
                /* Search Results */
                <div className="space-y-8">
                   <div className="flex items-center gap-4">
                    <h4 className="font-display font-black text-xl uppercase tracking-tighter text-black">
                      FOUND {results.length} PROJECTS
                    </h4>
                    <div className="flex-1 h-[2px] bg-black"></div>
                  </div>

                   {results.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {results.map((product) => (
                        <Link 
                          key={product._id} 
                          href={`/products/${product.slug}`} 
                          onClick={onClose}
                          className="flex items-center gap-6 p-4 border-2 border-black hover:bg-black hover:text-white group transition-all"
                        >
                          <div className="w-20 h-24 relative border-2 border-black group-hover:border-white shrink-0 overflow-hidden">
                            <Image
                              src={(product.images?.[0]?.url && product.images[0].url.length > 1) ? product.images[0].url : "/placeholder.jpg"}
                              alt={product.title}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-110"
                              sizes="80px"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <p className="font-display font-black text-lg uppercase leading-tight mb-1">{product.title}</p>
                              <ArrowRight className="opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all" size={20} />
                            </div>
                            <p className="font-black text-sm group-hover:text-white/80 italic">৳{Math.round(product.price || 0).toLocaleString()}</p>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] mt-2 text-black/80 italic">{product.category?.name || "Garment"}</p>
                          </div>
                        </Link>
                      ))}
                      
                      <Link
                        href={`/shop?search=${query}`}
                        onClick={onClose}
                        className="block w-full text-center py-4 font-black uppercase text-xs tracking-[0.3em] border-2 border-black mt-4 hover:italic transition-all"
                      >
                        VIEW ALL RESULTS ↗
                      </Link>
                    </div>
                  ) : (
                    <div className="py-20 text-center">
                      <div className="font-display font-black text-7xl mb-6 text-black/20">NOT FOUND</div>
                      <p className="font-display font-black text-xl uppercase italic">NO RESULTS FOR "{query}"</p>
                      <p className="text-[11px] font-bold uppercase tracking-widest mt-4 text-gray-600">TRY SOMETHING ELSE OR CHECK OUR COLLECTIONS</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="p-8 border-t-2 border-black bg-black text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-display font-black text-xl italic uppercase tracking-tighter">NEW SEASON DROPPED</p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/80">EXPLORE THE COLLECTION 2024</p>
                </div>
                <Link href="/shop" onClick={onClose} className="px-6 py-3 border-2 border-white font-bold text-[10px] uppercase hover:bg-white hover:text-black transition-all">
                  SHOP NOW
                </Link>
              </div>
            </div>
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}
