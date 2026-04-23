"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useCart } from "@/components/providers/CartProvider";
import { useWishlist } from "@/components/providers/WishlistProvider";
import Link from "next/link";
import { Heart, ShoppingBag, SlidersHorizontal, ChevronDown, X, Fingerprint, Terminal } from "lucide-react";

function ShopContent() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const searchParams = useSearchParams();
  const router = useRouter();

  const categoryParam = searchParams.get('category');
  const colorsParam = searchParams.get('colors');
  const sizesParam = searchParams.get('sizes');

  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryParam);
  const [selectedColors, setSelectedColors] = useState<string[]>(colorsParam ? colorsParam.split(',') : []);
  const [selectedSizes, setSelectedSizes] = useState<string[]>(sizesParam ? sizesParam.split(',') : []);
  const [sortBy, setSortBy] = useState("featured");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const { addItem, openCart } = useCart();
  const { toggleItem, isWishlisted } = useWishlist();

  // Fetch products from DB
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/store/products");
        const data = await res.json();
        if (data.products) {
          setProducts(data.products);
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Sync state with URL params - Robust implementation
  useEffect(() => {
    setSelectedCategory(categoryParam);
    setSelectedColors(colorsParam ? colorsParam.split(',') : []);
    setSelectedSizes(sizesParam ? sizesParam.split(',') : []);
  }, [categoryParam, colorsParam, sizesParam]);

  // Utility to update URL filters
  const updateFilters = (key: string, value: string | null | string[]) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value === null || (Array.isArray(value) && value.length === 0)) {
      params.delete(key);
    } else if (Array.isArray(value)) {
      params.set(key, value.join(','));
    } else {
      params.set(key, value);
    }
    
    router.push(`/shop?${params.toString()}`, { scroll: false });
  };

  // Extract unique filter options from DB data
  const categories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach(p => {
      if (p.category?.name) cats.add(p.category.name);
    });
    return Array.from(cats);
  }, [products]);

  const allColors = useMemo(() => {
    const colors = new Set<string>();
    products.forEach(p => p.colors?.forEach((c: any) => colors.add(c.name)));
    return Array.from(colors);
  }, [products]);

  const allSizes = useMemo(() => {
    const sizes = new Set<string>();
    products.forEach(p => p.sizes?.forEach((s: string) => sizes.add(s)));
    return Array.from(sizes).sort();
  }, [products]);

  // Filter and Sort Logic
  const filteredProducts = useMemo(() => {
    let result = products.filter(p => {
      const categoryMatch = !selectedCategory || p.category?.name === selectedCategory;
      const colorMatch = selectedColors.length === 0 || p.colors?.some((c: any) => selectedColors.includes(c.name));
      const sizeMatch = selectedSizes.length === 0 || p.sizes?.some((s: string) => selectedSizes.includes(s));
      return categoryMatch && colorMatch && sizeMatch;
    });

    if (sortBy === "price-low") result.sort((a, b) => a.price - b.price);
    if (sortBy === "price-high") result.sort((a, b) => b.price - a.price);
    if (sortBy === "newest") result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return result;
  }, [products, selectedCategory, selectedColors, selectedSizes, sortBy]);

  const toggleColor = (color: string) => {
    const newColors = selectedColors.includes(color) 
      ? selectedColors.filter(c => c !== color) 
      : [...selectedColors, color];
    updateFilters('colors', newColors);
  };

  const toggleSize = (size: string) => {
    const newSizes = selectedSizes.includes(size) 
      ? selectedSizes.filter(s => s !== size) 
      : [...selectedSizes, size];
    updateFilters('sizes', newSizes);
  };

  const clearFilters = () => {
    router.push('/shop', { scroll: false });
  };

  return (
    <div className="flex-1 flex flex-col pt-10 pb-20 relative bg-[#FAFAFA]">
      {/* Background Graphic Grid */}
      <div 
        className="fixed inset-0 opacity-[0.04] pointer-events-none z-0" 
        style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '32px 32px' }} 
      />

      <div className="max-w-[1700px] mx-auto w-full px-6 md:px-12 relative z-10 flex flex-col gap-10">

        {/* SHOP HERO - TERMINAL */}
        <section className="relative bg-white border border-black/10 shadow-soft p-12 overflow-hidden group hover:border-black/30 transition-colors">
            {/* Corner Bracket Decorations */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-black/30" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-black/30" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-black/30" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-black/30" />

            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-12">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Terminal size={14} className="text-black/40" />
                  <span className="text-[10px] font-mono tracking-[0.5em] text-black/40 uppercase">SYS_INDEX // ACCESSING_GARMENTS</span>
                </div>
                <h1 className="font-sans font-black text-6xl md:text-8xl text-black uppercase tracking-tighter leading-[0.8] mix-blend-difference">
                  Data<br /><span className="text-gray-300 italic">Archive</span>
                </h1>
              </div>
              
              <div className="bg-black text-white p-6 w-full lg:w-96 text-xs font-mono uppercase tracking-widest leading-relaxed">
                <div>[STATUS]: ONLINE</div>
                <div>[SECURE]: AES-256</div>
                <div className="mt-4 text-white/50">
                  Retrieving high-performance prototypes and structural apparel. All systems operational.
                </div>
              </div>
            </div>
        </section>

        {/* SHOP CONTROLS */}
        <section className={`sticky top-0 z-40 py-4 flex flex-wrap items-center justify-between gap-6 transition-all duration-500 bg-[#FAFAFA]/90 backdrop-blur-md border-b border-black/10`}>
          <div className="flex items-center gap-8">
            <button 
              onClick={() => setIsMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-3 font-black uppercase text-[10px] tracking-widest px-6 py-3 border border-black hover:bg-black hover:text-white transition-all"
            >
              <SlidersHorizontal size={14} /> FILTERS
            </button>
            <div className="hidden lg:flex flex-col gap-1">
              <span className="text-[8px] font-mono text-black/40 uppercase tracking-[0.4em]">QUERY_RESULTS</span>
              <span className="text-[12px] font-black uppercase tracking-widest text-black flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                FOUND_{filteredProducts.length}_ITEMS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="flex items-center gap-3 font-mono font-bold uppercase text-[10px] tracking-[0.2em] cursor-pointer text-black border border-black/10 px-4 py-2 hover:bg-black hover:text-white transition-colors">
                SORT_PARAMETER: <span className="text-black/50 group-hover:text-white/70">[{sortBy}]</span> <ChevronDown size={12} className="group-hover:rotate-180 transition-transform" />
              </div>
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-black shadow-soft opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all translate-y-2 group-hover:translate-y-0 z-50">
                {["featured", "newest", "price-low", "price-high"].map(opt => (
                  <button
                    key={opt}
                    onClick={() => setSortBy(opt)}
                    className={`w-full text-left px-4 py-3 text-[10px] font-mono font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors ${sortBy === opt ? 'bg-black text-white' : ''}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* CONTROL DECK (SIDEBAR FILTERS) */}
          <aside className="hidden lg:flex lg:col-span-3 flex-col gap-10 sticky top-[100px] h-fit pr-6">
            <div className="border border-black/10 bg-white p-6 space-y-12 shadow-sm">
                
              {/* Category */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-black/10 pb-2">
                    <span className="w-1 h-3 bg-black" />
                    <h3 className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-black">CLASS</h3>
                </div>
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => updateFilters('category', null)}
                    className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest group"
                  >
                    <span className={`w-3 h-3 flex items-center justify-center border transition-colors ${!selectedCategory ? 'border-black bg-black' : 'border-black/30 group-hover:border-black'}`}>
                        {!selectedCategory && <span className="w-1.5 h-1.5 bg-white" />}
                    </span>
                    <span className={!selectedCategory ? 'text-black font-bold' : 'text-black/60 group-hover:text-black'}>ALL_MODULES</span>
                  </button>
                  {categories.map(cat => (
                    <button 
                      key={cat}
                      onClick={() => updateFilters('category', selectedCategory === cat ? null : cat)}
                      className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest group"
                    >
                      <span className={`w-3 h-3 flex items-center justify-center border transition-colors ${selectedCategory === cat ? 'border-black bg-black' : 'border-black/30 group-hover:border-black'}`}>
                          {selectedCategory === cat && <span className="w-1.5 h-1.5 bg-white" />}
                      </span>
                      <span className={selectedCategory === cat ? 'text-black font-bold' : 'text-black/60 group-hover:text-black'}>{cat.replace(" ", "_")}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors */}
              {allColors.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 border-b border-black/10 pb-2">
                      <span className="w-1 h-3 bg-black" />
                      <h3 className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-black">SPECTRUM</h3>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {allColors.map(color => {
                      const colorObj = products.find(p => p.colors?.some((c: any) => c.name === color))?.colors?.find((c: any) => c.name === color);
                      return (
                        <button
                          key={color}
                          onClick={() => toggleColor(color)}
                          title={color}
                          className={`aspect-square relative flex items-center justify-center border transition-all ${selectedColors.includes(color) ? 'border-black p-1' : 'border-black/10 hover:border-black/50 p-1'}`}
                        >
                          <div className={`w-full h-full`} style={{ backgroundColor: colorObj?.hex || color.toLowerCase().replace(' ', '') }} />
                          {selectedColors.includes(color) && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white mix-blend-difference" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sizes */}
              {allSizes.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 border-b border-black/10 pb-2">
                      <span className="w-1 h-3 bg-black" />
                      <h3 className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-black">DIMENSION</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {allSizes.map(size => (
                      <button
                        key={size}
                        onClick={() => toggleSize(size)}
                        className={`w-10 h-10 flex items-center justify-center font-mono text-[10px] font-bold border transition-all ${selectedSizes.includes(size) ? 'bg-black text-white border-black' : 'bg-transparent text-black/50 border-black/10 hover:border-black/50 hover:text-black'}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Reset */}
              <div className="pt-8">
                <button 
                  onClick={clearFilters}
                  className="w-full py-4 border border-black/20 text-[10px] font-mono font-bold uppercase tracking-widest text-black/50 hover:bg-black hover:text-white hover:border-black transition-colors"
                >
                  SYSTEM.RESET()
                </button>
              </div>

            </div>
          </aside>

          {/* MAIN GRID */}
          <div className="lg:col-span-9">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-[50vh] gap-4 bg-white border border-black/5">
                <div className="w-10 h-10 border-2 border-black/10 border-t-black rounded-full animate-spin" />
                <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-black/50">Fetching Remote Data...</p>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredProducts.map((product, idx) => (
                  <div 
                    key={product._id} 
                    className="group flex flex-col bg-white border border-black/5 shadow-sm hover:shadow-xl hover:border-black/20 transition-all duration-500 overflow-hidden"
                  >
                    <Link href={`/products/${product.slug}`} className="block relative">
                      {/* Technical Image Container */}
                      <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100 flex items-center justify-center p-8">
                        <img 
                          src={product.images?.[0]?.url || "https://placehold.co/600x800?text=No+Image"} 
                          alt={product.title} 
                          className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700 ease-out"
                        />
                        {/* Glitch Overlay Effect */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 pointer-events-none glitch-hover mix-blend-overlay" 
                             style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'1\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'0.3\'/%3E%3C/svg%3E")', opacity: 0}}
                        />

                        {/* Top Left UUID */}
                        <div className="absolute top-4 left-4 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <Fingerprint size={12} className="text-black/30" />
                            <span className="font-mono text-[6px] text-black/30 uppercase tracking-widest">{product._id.slice(-8)}</span>
                        </div>
                        
                         {/* Action Icons Panel */}
                        <div className="absolute bottom-4 right-4 flex gap-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                          <button 
                            onClick={(e) => { e.preventDefault(); toggleItem(product._id); }}
                            className={`w-10 h-10 flex items-center justify-center backdrop-blur-md transition-colors ${isWishlisted(product._id) ? 'bg-black text-white' : 'bg-white/80 text-black hover:bg-black hover:text-white'}`}
                          >
                            <Heart size={16} fill={isWishlisted(product._id) ? 'currentColor' : 'none'} />
                          </button>
                          <button 
                            onClick={(e) => { 
                              e.preventDefault(); 
                              // If product has variations, navigate to product page instead of quick add
                              if ((product.colors && product.colors.length > 0) || (product.sizes && product.sizes.length > 0)) {
                                window.location.href = `/products/${product.slug}`;
                                return;
                              }
                              addItem({ 
                                id: product._id,
                                slug: product.slug, 
                                title: product.title, 
                                price: product.price, 
                                quantity: 1, 
                                color: "Default", 
                                size: "Default",
                                image: product.images?.[0]?.url || ""
                              });
                              openCart();
                            }}
                            className="w-10 h-10 flex items-center justify-center bg-white/80 backdrop-blur-md text-black hover:bg-black hover:text-white transition-colors"
                          >
                            <ShoppingBag size={16} />
                          </button>
                        </div>
                      </div>
                      
                      {/* Product Data Readout */}
                      <div className="p-6 border-t border-black/5 bg-white relative">
                        <div className="flex justify-between items-start gap-4 mb-4">
                          <h3 className="text-sm font-sans font-black uppercase tracking-tight group-hover:text-black/60 transition-colors leading-none">{product.title}</h3>
                        </div>
                        <div className="flex justify-between items-end">
                            <span className="text-[10px] font-mono text-black/40 uppercase tracking-widest">{product.category?.name || "SYS_GARMENT"}</span>
                            <span className="text-sm font-mono font-bold tracking-tight">৳{Math.round(product.price).toLocaleString()}</span>
                        </div>
                        
                        {/* Interactive Data Line */}
                        <div className="absolute bottom-0 left-0 h-[2px] bg-black w-0 group-hover:w-full transition-all duration-500 ease-out" />
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[50vh] p-8 text-center bg-white border border-black/10">
                <div className="w-16 h-16 border border-black/20 rounded-full flex items-center justify-center mb-6">
                    <X size={24} className="text-black/20" />
                </div>
                <h3 className="font-mono font-bold text-xl uppercase mb-2 tracking-widest">QUERY_NULL</h3>
                <p className="text-[10px] font-mono text-black/40 tracking-[0.2em] mb-8">NO GARMENTS MATCH SPECIFIED PARAMETERS</p>
                <button 
                  onClick={clearFilters}
                  className="px-8 py-3 bg-transparent border border-black text-[10px] font-mono font-bold uppercase tracking-[0.3em] hover:bg-black hover:text-white transition-colors"
                >
                  SYSTEM.RESET()
                </button>
              </div>
            )}
          </div>
        </section>

        {/* MOBILE FILTER DRAWER */}
        {isMobileFiltersOpen && (
          <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md lg:hidden">
            <div className="absolute right-0 top-0 bottom-0 w-[90%] bg-white p-8 overflow-y-auto animate-fade-in-right flex flex-col font-mono text-[10px]">
               <div className="flex justify-between items-center mb-12 border-b border-black/10 pb-6 uppercase tracking-widest font-bold">
                  <h2>SYS_FILTERS</h2>
                  <button onClick={() => setIsMobileFiltersOpen(false)} className="w-10 h-10 border border-black/20 flex items-center justify-center hover:bg-black hover:text-white">
                     <X size={16} />
                  </button>
               </div>
               
               <div className="flex-1 space-y-12">
                  <div>
                     <h3 className="uppercase mb-4 tracking-[0.3em] text-black/40">Class</h3>
                     <div className="flex flex-col gap-2">
                       {categories.map(cat => (
                        <button 
                          key={cat}
                          onClick={() => updateFilters('category', selectedCategory === cat ? null : cat)}
                          className={`p-4 border text-left uppercase tracking-widest transition-colors ${selectedCategory === cat ? 'bg-black text-white border-black' : 'bg-transparent text-black border-black/10'}`}
                        >
                          {cat}
                        </button>
                      ))}
                     </div>
                  </div>
                  {/* Additional Mobile filters could go here, omitting for brevity matching prior pattern */}
               </div>

               <div className="pt-12 mt-auto">
                  <button 
                    onClick={() => setIsMobileFiltersOpen(false)}
                    className="w-full py-5 bg-black text-white font-bold uppercase tracking-[0.3em] border border-black"
                  >
                    APPLY_PARAMETERS
                  </button>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="w-10 h-10 border-2 border-black/10 border-t-black rounded-full animate-spin" />
      </div>
    }>
      <ShopContent />
    </Suspense>
  )
}
