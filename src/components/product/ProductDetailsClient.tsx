"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useCart } from "@/components/providers/CartProvider";
import { useWishlist } from "@/store/wishlistStore";
import { useToast } from "@/components/playshelf/Toast";
import ProductGridNike from "@/components/ui/product-grid-nike";
import { Star, Truck, RefreshCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { trackViewContent, trackAddToCart } from "@/lib/fbPixel";

// ─── Breadcrumb underline link ───
function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="relative group font-mono text-[11px] uppercase tracking-[0.1em] text-ink-black">
      {children}
      <span className="absolute -bottom-0.5 left-0 h-[1px] bg-ink-black w-[50%] transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-full" />
    </Link>
  );
}

export default function ProductDetailsClient({ product: initialProduct, relatedProducts }: { product: any; relatedProducts?: any[] }) {
  // ─── ALL LOGIC COMPLETELY UNTOUCHED ───
  const router = useRouter();
  const { addItem, openCart } = useCart();
  const { showToast } = useToast();
  const { toggleItem, isWishlisted } = useWishlist();
  const reduced = useReducedMotion();

  const product = initialProduct;
  const wishlisted = isWishlisted(product._id);

  // Track ViewContent when the product page is viewed
  useEffect(() => {
    try {
      trackViewContent(product);
    } catch {
      // Never let pixel errors crash the page
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product._id]);

  const handleWishlistClick = () => {
    toggleItem(product._id);
    if (!wishlisted) {
      showToast("Added to wishlist!", "success");
    } else {
      showToast("Removed from wishlist", "info");
    }
  };

  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState("description");

  const [isWritingReview, setIsWritingReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: "", text: "", name: "" });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReview(true);
    try {
      const res = await fetch(`/api/products/${product._id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewForm)
      });
      if (!res.ok) throw new Error("Failed to submit review");
      showToast("Review submitted successfully!", "success");
      setIsWritingReview(false);
      setReviewForm({ rating: 5, title: "", text: "", name: "" });
      router.refresh();
    } catch {
      showToast("Error submitting review. Please try again.", "error");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleAddToCart = () => {
    addItem({
      id: product._id,
      slug: product.slug,
      title: product.title,
      price: product.price,
      quantity,
      image: product.images?.[0]?.url || "/placeholder.jpg"
    });
    try { trackAddToCart(product, quantity); } catch { /* noop */ }
    showToast(`Added ${quantity} to your bag!`, "success");
    openCart();
  };

  const handleBuyNow = () => {
    addItem({
      id: product._id,
      slug: product.slug,
      title: product.title,
      price: product.price,
      quantity,
      image: product.images?.[0]?.url || "/placeholder.jpg"
    });
    try { trackAddToCart(product, quantity); } catch { /* noop */ }
    router.push("/checkout");
  };

  const WHATSAPP_NUMBER = "8801616921965";
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=Hi! I'm interested in the ${encodeURIComponent(product.title)}. Is it available?`;

  const totalImages = product.images?.length || 0;
  const prevImage = () => setActiveImage(activeImage === 0 ? totalImages - 1 : activeImage - 1);
  const nextImage = () => setActiveImage(activeImage === totalImages - 1 ? 0 : activeImage + 1);

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;

  return (
    <div className="bg-transparent min-h-screen text-ink-black font-body pb-16 section-light">

      {/* ═══════════════════════════════════════
          PRODUCT SHOWCASE
          ═══════════════════════════════════════ */}
      <section className="px-4 sm:px-10 lg:px-[5vw] pt-8 pb-10 md:pb-16">

        {/* Breadcrumb */}
        <nav className="flex items-center justify-between mb-10 border-b border-rule-grey pb-4">
          <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.1em] text-rule-grey">
            <NavLink href="/">Home</NavLink>
            <span>/</span>
            <NavLink href="/products">Shop</NavLink>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/products" className="flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.1em] text-rule-grey hover:text-ink-black transition-colors">
              <ChevronLeft size={12} /> Prev
            </Link>
            <Link href="/products" className="flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.1em] text-rule-grey hover:text-ink-black transition-colors">
              Next <ChevronRight size={12} />
            </Link>
          </div>
        </nav>

        {/* Main layout — asymmetric: gallery 7/12, info 5/12 */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 xl:gap-24">

          {/* ─── LEFT: Gallery ─── */}
          <div className="w-full lg:w-7/12 flex flex-col md:flex-row gap-4 lg:sticky lg:top-24 h-fit">

            {/* Vertical Index number in margin — catalog signature */}
            <div className="hidden lg:flex flex-col items-center justify-start pt-4 shrink-0 w-10 select-none">
              <div
                className="font-display text-[13px] uppercase text-rule-grey leading-none tracking-tight"
                style={{ writingMode: "vertical-rl", textOrientation: "mixed", transform: "rotate(180deg)" }}
              >
                N°{(product._id || "000").slice(-3).toUpperCase()}
              </div>
              <div className="mt-4 w-[1px] flex-1 bg-rule-grey" />
            </div>

            {/* Desktop thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="hidden md:flex flex-col gap-2 w-[72px] shrink-0">
                {product.images.map((img: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={cn(
                      "relative w-[72px] h-[72px] overflow-hidden border transition-all duration-200",
                      activeImage === idx
                        ? "border-ink-black"
                        : "border-rule-grey opacity-50 hover:opacity-100 hover:border-ink-black"
                    )}
                  >
                    <Image src={img.url} alt={img.alt || "Thumbnail"} fill className="object-cover" sizes="72px" />
                  </button>
                ))}
              </div>
            )}

            {/* Main image */}
            <div className="relative flex-1 aspect-square md:aspect-[4/5] bg-paper-grey overflow-hidden">
              {product.images?.[activeImage] && (
                <Image
                  src={product.images[activeImage].url}
                  alt={product.images[activeImage].alt || product.title}
                  fill
                  className="object-cover transition-opacity duration-300"
                  priority
                  sizes="(max-width: 1024px) 100vw, 55vw"
                />
              )}

              {/* Arrow navigation — flat squares not circles */}
              {totalImages > 1 && (
                <div className="absolute top-1/2 -translate-y-1/2 inset-x-0 flex justify-between px-3 pointer-events-none">
                  <button
                    onClick={prevImage}
                    className="w-8 h-8 bg-paper-white border border-rule-grey flex items-center justify-center pointer-events-auto hover:bg-ink-black hover:text-paper-white transition-colors"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="w-8 h-8 bg-paper-white border border-rule-grey flex items-center justify-center pointer-events-auto hover:bg-ink-black hover:text-paper-white transition-colors"
                    aria-label="Next image"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}

              {/* Out of stock overlay */}
              {product.inventory !== undefined && product.inventory <= 0 && (
                <div className="absolute top-3 left-3 bg-stamp-red text-paper-white font-mono text-[10px] uppercase tracking-[0.1em] px-2.5 py-1">
                  Sold Out
                </div>
              )}
            </div>

            {/* Mobile thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex md:hidden gap-2 overflow-x-auto no-scrollbar pb-2">
                {product.images.map((img: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={cn(
                      "relative w-14 h-14 shrink-0 border transition-all duration-200 overflow-hidden",
                      activeImage === idx ? "border-ink-black" : "border-rule-grey opacity-50"
                    )}
                  >
                    <Image src={img.url} alt={img.alt || "Thumbnail"} fill className="object-cover" sizes="56px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ─── RIGHT: Info ─── */}
          <div className="w-full lg:w-5/12 flex flex-col">

            {/* Category label */}
            {product.category?.name && (
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-rule-grey mb-3">
                {product.category.name}
              </p>
            )}

            {/* Product title */}
            <h1 className="font-display text-[36px] md:text-[44px] uppercase text-ink-black leading-[1.0] tracking-[-0.01em] mb-4">
              {product.title}
            </h1>

            {/* Star rating */}
            {product.reviewCount > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={10}
                      className={i < Math.floor(product.rating || 0) ? "fill-stamp-red text-stamp-red" : "fill-rule-grey text-rule-grey"}
                    />
                  ))}
                </div>
                <a href="#reviews" className="font-mono text-[10px] text-rule-grey uppercase tracking-[0.1em] hover:text-ink-black transition-colors">
                  {product.reviewCount} reviews
                </a>
              </div>
            )}

            {/* Price in mono */}
            <div className="flex items-baseline gap-3 mb-2">
              <span className="font-mono text-[22px] text-ink-black">৳{product.price.toLocaleString()}</span>
              {hasDiscount && (
                <span className="font-mono text-[14px] text-rule-grey line-through">৳{product.compareAtPrice.toLocaleString()}</span>
              )}
              {hasDiscount && (
                <span className="font-mono text-[10px] text-stamp-red uppercase tracking-[0.08em]">
                  −{Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}%
                </span>
              )}
            </div>

            {/* Age range */}
            <p className="font-mono text-[11px] text-rule-grey uppercase tracking-[0.1em] mb-5">
              {product.ageRange ? `Ages ${product.ageRange}` : "Kids Toy"}
            </p>

            {/* Description */}
            <div className="border-t border-rule-grey pt-5 mb-6">
              <p className="font-body text-[14px] text-ink-black leading-[1.7]">{product.description}</p>
            </div>

            {/* Quantity + Add to Cart */}
            <div className="mb-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-rule-grey mb-2">Quantity</p>
              <div className="flex items-stretch gap-0">
                {/* Flat qty stepper */}
                <div className="flex items-center border border-rule-grey">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-4 font-mono text-[16px] text-ink-black hover:bg-paper-grey transition-colors leading-none"
                    aria-label="Decrease quantity"
                  >−</button>
                  <span className="w-10 text-center font-mono text-[13px] text-ink-black border-x border-rule-grey py-4">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-4 font-mono text-[16px] text-ink-black hover:bg-paper-grey transition-colors leading-none"
                    aria-label="Increase quantity"
                  >+</button>
                </div>

                {/* Add to Cart — flat black, full press animation */}
                <motion.button
                  onClick={handleAddToCart}
                  whileTap={reduced ? {} : { scale: 0.98 }}
                  className="flex-1 bg-ink-black text-paper-white font-mono text-[11px] uppercase tracking-[0.12em] hover:bg-rule-grey hover:text-ink-black transition-colors duration-200 border border-ink-black ml-2"
                >
                  Add to Cart
                </motion.button>
              </div>
            </div>

            {/* Buy Now */}
            <motion.button
              onClick={handleBuyNow}
              whileTap={reduced ? {} : { scale: 0.98 }}
              className="w-full py-4 bg-paper-white text-ink-black font-mono text-[11px] uppercase tracking-[0.12em] border border-ink-black hover:bg-ink-black hover:text-paper-white transition-colors duration-200 mb-3"
            >
              Buy Now
            </motion.button>

            {/* WhatsApp */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 bg-[#25D366] text-paper-white font-mono text-[11px] uppercase tracking-[0.12em] flex items-center justify-center gap-2 hover:bg-[#128C7E] transition-colors duration-200 mb-6"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
              </svg>
              Chat on WhatsApp
            </a>

            {/* Wishlist + Share */}
            <div className="flex items-center gap-6 mb-6">
              <button
                onClick={handleWishlistClick}
                className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-black hover:text-rule-grey transition-colors relative group"
              >
                <svg width="14" height="14" fill={wishlisted ? "#E8391D" : "none"} stroke={wishlisted ? "#E8391D" : "currentColor"} strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                {wishlisted ? "Wishlisted" : "Wishlist"}
              </button>
            </div>

            {/* Catalog metadata */}
            <div className="flex flex-col gap-1.5 border-t border-rule-grey pt-5">
              <p className="font-mono text-[11px] text-ink-black">
                <span className="text-rule-grey mr-2">SKU:</span>
                {(product._id || "").slice(-6).toUpperCase()}
              </p>
              {product.category?.name && (
                <p className="font-mono text-[11px] text-ink-black">
                  <span className="text-rule-grey mr-2">Category:</span>
                  {product.category.name}
                </p>
              )}
              {product.ageRange && (
                <p className="font-mono text-[11px] text-ink-black">
                  <span className="text-rule-grey mr-2">Ages:</span>
                  {product.ageRange}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          TABS — Description & Reviews
          ═══════════════════════════════════════ */}
      <section id="reviews" className="px-4 sm:px-10 lg:px-[5vw] py-14 md:py-20 border-t border-rule-grey">
        <div className="max-w-[960px] mx-auto">

          {/* Tab headers */}
          <div className="flex gap-0 border-b border-rule-grey mb-12">
            {[
              { key: "description", label: "Description" },
              { key: "reviews", label: `Reviews${product.reviewCount ? ` (${product.reviewCount})` : ""}` },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={cn(
                  "relative px-6 pb-4 pt-0 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors",
                  activeTab === key ? "text-ink-black" : "text-rule-grey hover:text-ink-black"
                )}
              >
                {label}
                {activeTab === key && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-ink-black" />}
              </button>
            ))}
          </div>

          <div className="min-h-[300px]">
            {/* Description */}
            {activeTab === "description" && (
              <div>
                <div className="mb-8">
                  <h3 className="font-display text-[24px] uppercase text-ink-black mb-4">{product.title}</h3>
                  <p className="font-body text-[14px] text-ink-black leading-[1.8]">{product.description}</p>
                </div>
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <h4 className="font-mono text-[10px] uppercase tracking-[0.12em] text-rule-grey mb-3">Why This Product?</h4>
                    <ul className="list-none space-y-2">
                      {["Non-toxic, child-safe materials", "Open-ended, creative play", "Sustainably sourced & eco-friendly"].map(f => (
                        <li key={f} className="font-body text-[14px] text-ink-black flex gap-2">
                          <span className="text-rule-grey">—</span>{f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-mono text-[10px] uppercase tracking-[0.12em] text-rule-grey mb-3">Product Details</h4>
                    <p className="font-body text-[14px] text-ink-black leading-[1.8]">
                      {product.longDescription || "Experience the perfect blend of fun and learning. Made from premium, child-safe materials, it stands up to enthusiastic play and looks beautiful in any playroom."}
                    </p>
                  </div>
                </div>
                <div className="border-t border-rule-grey pt-8">
                  <h4 className="font-mono text-[10px] uppercase tracking-[0.12em] text-rule-grey mb-4">Shipping & Returns</h4>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start gap-3">
                      <Truck className="w-4 h-4 text-ink-black shrink-0 mt-0.5" />
                      <p className="font-body text-[13px] text-ink-black">Free standard shipping on orders over ৳1,500.</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <RefreshCcw className="w-4 h-4 text-ink-black shrink-0 mt-0.5" />
                      <p className="font-body text-[13px] text-ink-black">Return within 30 days of receiving your order.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Reviews */}
            {activeTab === "reviews" && (
              <div className="space-y-12">
                <div className="flex flex-col md:flex-row gap-8 lg:gap-16 items-start">

                  {/* Rating summary */}
                  <div className="flex flex-col items-center justify-center bg-paper-grey p-10 w-full md:w-auto min-w-[240px]">
                    <span className="font-display text-[64px] text-ink-black leading-none mb-3">{product.rating || 0}</span>
                    <div className="flex mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={20} className={i < Math.floor(product.rating || 0) ? "fill-stamp-red text-stamp-red" : "fill-rule-grey text-rule-grey"} />
                      ))}
                    </div>
                    <span className="font-mono text-[11px] text-rule-grey uppercase tracking-[0.08em]">
                      {product.reviewCount || 0} reviews
                    </span>
                    {!isWritingReview && (
                      <button
                        onClick={() => setIsWritingReview(true)}
                        className="mt-6 w-full py-3 px-4 border border-ink-black font-mono text-[10px] uppercase tracking-[0.12em] text-ink-black hover:bg-ink-black hover:text-paper-white transition-colors"
                      >
                        Write a Review
                      </button>
                    )}
                  </div>

                  {/* Reviews list + form */}
                  <div className="flex-1 w-full space-y-8">
                    {isWritingReview && (
                      <form onSubmit={submitReview} className="bg-paper-grey p-6 md:p-8 space-y-5 border border-rule-grey section-light">
                        <div className="flex justify-between items-center">
                          <h3 className="font-display text-[20px] uppercase text-ink-black">Write a Review</h3>
                          <button type="button" onClick={() => setIsWritingReview(false)} className="font-mono text-[10px] uppercase tracking-[0.1em] text-rule-grey hover:text-ink-black">Cancel</button>
                        </div>
                        <div>
                          <label className="block font-mono text-[10px] uppercase tracking-[0.12em] text-rule-grey mb-2">Rating *</label>
                          <div className="flex gap-1">
                            {[1,2,3,4,5].map(star => (
                              <button
                                type="button"
                                key={star}
                                onClick={() => setReviewForm(p => ({ ...p, rating: star }))}
                                className="transition-transform hover:scale-110"
                              >
                                <Star size={24} className={star <= reviewForm.rating ? "fill-stamp-red text-stamp-red" : "fill-rule-grey text-rule-grey"} />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block font-mono text-[10px] uppercase tracking-[0.12em] text-rule-grey mb-1.5">Name</label>
                            <input required type="text" value={reviewForm.name}
                              onChange={e => setReviewForm(p => ({ ...p, name: e.target.value }))}
                              className="w-full border border-rule-grey px-4 py-3 font-body text-[13px] text-ink-black bg-paper-white outline-none focus:border-ink-black transition-colors"
                              placeholder="Your name" />
                          </div>
                          <div>
                            <label className="block font-mono text-[10px] uppercase tracking-[0.12em] text-rule-grey mb-1.5">Review Title</label>
                            <input required type="text" value={reviewForm.title}
                              onChange={e => setReviewForm(p => ({ ...p, title: e.target.value }))}
                              className="w-full border border-rule-grey px-4 py-3 font-body text-[13px] text-ink-black bg-paper-white outline-none focus:border-ink-black transition-colors"
                              placeholder="Summarize your experience" />
                          </div>
                        </div>
                        <div>
                          <label className="block font-mono text-[10px] uppercase tracking-[0.12em] text-rule-grey mb-1.5">Your Review</label>
                          <textarea required rows={4} value={reviewForm.text}
                            onChange={e => setReviewForm(p => ({ ...p, text: e.target.value }))}
                            className="w-full border border-rule-grey px-4 py-3 font-body text-[13px] text-ink-black bg-paper-white outline-none focus:border-ink-black transition-colors resize-none"
                            placeholder="Tell us what you think..." />
                        </div>
                        <button
                          disabled={isSubmittingReview}
                          type="submit"
                          className="bg-ink-black text-paper-white font-mono text-[10px] uppercase tracking-[0.12em] py-3.5 px-6 hover:bg-rule-grey hover:text-ink-black disabled:opacity-60 transition-colors"
                        >
                          {isSubmittingReview ? "Submitting…" : "Submit Review"}
                        </button>
                      </form>
                    )}

                    {!isWritingReview && (!product.reviews || product.reviews.filter((r: any) => r.status === 'published' || !r.status).length === 0) && (
                      <div className="py-12 bg-paper-grey border border-rule-grey text-center">
                        <p className="font-mono text-[11px] text-rule-grey uppercase tracking-[0.1em]">
                          No reviews yet. Be the first.
                        </p>
                      </div>
                    )}

                    {!isWritingReview && product.reviews && [...product.reviews].filter((r: any) => r.status === 'published' || !r.status).reverse().map((review: any, i: number) => (
                      <div key={i} className="border-b border-rule-grey pb-8 last:border-0">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-ink-black flex items-center justify-center text-paper-white font-mono text-[11px] shrink-0">
                              {review.name?.[0]?.toUpperCase() || "A"}
                            </div>
                            <div>
                              <p className="font-body text-[13px] font-medium text-ink-black">{review.name}</p>
                              <div className="flex gap-0.5 mt-0.5">
                                {[...Array(5)].map((_, j) => (
                                  <Star key={j} size={9} className={j < review.rating ? "fill-stamp-red text-stamp-red" : "fill-rule-grey text-rule-grey"} />
                                ))}
                              </div>
                            </div>
                          </div>
                          <span className="font-mono text-[10px] text-rule-grey uppercase tracking-[0.08em]">
                            {new Date(review.date).toLocaleDateString()}
                          </span>
                        </div>
                        {review.title && <p className="font-body text-[13px] font-medium text-ink-black mb-1">{review.title}</p>}
                        <p className="font-body text-[13px] text-ink-black leading-[1.7] whitespace-pre-line">"{review.text}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          RELATED PRODUCTS
          ═══════════════════════════════════════ */}
      {relatedProducts && relatedProducts.length > 0 && (
        <section className="px-4 sm:px-10 lg:px-[5vw] py-14 md:py-20 border-t border-rule-grey">
          <div className="mb-10 flex items-baseline gap-6">
            <h2 className="font-display text-[40px] md:text-[56px] uppercase text-ink-black leading-none tracking-[-0.01em]">
              You Might Also Like
            </h2>
            <div className="flex-1 h-[1px] bg-rule-grey hidden md:block" />
          </div>
          <ProductGridNike title={undefined} products={relatedProducts} theme="light" />
        </section>
      )}
    </div>
  );
}