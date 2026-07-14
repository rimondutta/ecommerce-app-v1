"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/providers/CartProvider";
import { useWishlist } from "@/store/wishlistStore";
import { useToast } from "@/components/playshelf/Toast";
import ProductGridNike from "@/components/ui/product-grid-nike";
import { Star, Truck, RefreshCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Animated underline link (reference pattern) ───
function UnderlineLink({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <Link href={href} className={`relative inline-block no-underline group ${className}`}>
      {children}
      <span className="absolute left-0 -bottom-1 w-[50%] h-[2px] bg-current transition-[width] duration-300 ease-in-out group-hover:w-full" />
    </Link>
  );
}

export default function ProductDetailsClient({ product: initialProduct, relatedProducts }: { product: any; relatedProducts?: any[] }) {
  // ─── ALL LOGIC UNTOUCHED ───
  const router = useRouter();
  const { addItem, openCart } = useCart();
  const { showToast } = useToast();
  const { toggleItem, isWishlisted } = useWishlist();

  const product = initialProduct;
  const wishlisted = isWishlisted(product._id);

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
    } catch (error) {
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
      color: "Default",
      size: "Default",
      image: product.images?.[0]?.url || "/placeholder.jpg"
    });
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
      color: "Default",
      size: "Default",
      image: product.images?.[0]?.url || "/placeholder.jpg"
    });
    router.push("/checkout");
  };

  const WHATSAPP_NUMBER = "1234567890"; // Placeholder
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=Hi! I'm interested in the ${encodeURIComponent(product.title)}. Is it available?`;

  // Gallery navigation
  const totalImages = product.images?.length || 0;
  const prevImage = () => setActiveImage(activeImage === 0 ? totalImages - 1 : activeImage - 1);
  const nextImage = () => setActiveImage(activeImage === totalImages - 1 ? 0 : activeImage + 1);

  return (
    <div className="bg-white min-h-screen text-black font-sans pb-16">

      {/* ═══════════════════════════════════════════
          PRODUCT SHOWCASE AREA
          ═══════════════════════════════════════════ */}
      <section className="px-4 sm:px-10 lg:px-40 pt-8 pb-10 md:pb-16">

        {/* Breadcrumb */}
        <nav className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-1 text-xs sm:text-sm uppercase font-medium text-black tracking-wide">
            <UnderlineLink href="/" className="text-black">Home</UnderlineLink>
            <span className="mx-2 text-neutral-400">/</span>
            <UnderlineLink href="/products" className="text-black">The Shop</UnderlineLink>
          </div>
          <div className="flex items-center gap-4 text-xs uppercase font-medium text-black tracking-wide">
            <Link href="/products" className="flex items-center gap-1 relative group">
              <ChevronLeft size={16} />
              <span className="relative">
                Prev
                <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-black transition-[width] duration-300 group-hover:w-full" />
              </span>
            </Link>
            <Link href="/products" className="flex items-center gap-1 relative group">
              <span className="relative">
                Next
                <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-black transition-[width] duration-300 group-hover:w-full" />
              </span>
              <ChevronRight size={16} />
            </Link>
          </div>
        </nav>

        {/* Main product layout */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 xl:gap-24">

          {/* ─── LEFT: Image Gallery ─── */}
          <div className="w-full lg:w-7/12 flex flex-col md:flex-row gap-4 lg:sticky lg:top-24 h-fit">

            {/* Desktop thumbnails (left of main image) */}
            {product.images && product.images.length > 1 && (
              <div className="hidden md:flex flex-col gap-2.5 w-[80px] shrink-0">
                {product.images.map((img: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={cn(
                      "relative w-[80px] h-[80px] overflow-hidden shrink-0 border transition-all duration-200",
                      activeImage === idx
                        ? "border-black opacity-100"
                        : "border-neutral-200 opacity-50 hover:opacity-100 hover:border-neutral-400"
                    )}
                  >
                    <Image src={img.url} alt={img.alt || "Thumbnail"} fill className="object-cover" sizes="80px" />
                  </button>
                ))}
              </div>
            )}

            {/* Main image with circular prev/next arrows (reference style) */}
            <div className="relative flex-1 aspect-square md:aspect-[4/5] bg-[#f5f5f5] overflow-hidden">
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

              {/* Directional buttons — reference's circular arrow style */}
              {totalImages > 1 && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex justify-between w-[90%] pointer-events-none">
                  <button
                    onClick={prevImage}
                    className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center pointer-events-auto hover:bg-neutral-100 transition-colors duration-200 border border-neutral-100"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center pointer-events-auto hover:bg-neutral-100 transition-colors duration-200 border border-neutral-100"
                    aria-label="Next image"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </div>

            {/* Mobile thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex md:hidden gap-2.5 overflow-x-auto scroll-snap-x no-scrollbar pb-2">
                {product.images.map((img: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={cn(
                      "relative w-16 h-16 shrink-0 border transition-all duration-200 overflow-hidden",
                      activeImage === idx
                        ? "border-black opacity-100"
                        : "border-neutral-200 opacity-50 hover:opacity-100"
                    )}
                  >
                    <Image src={img.url} alt={img.alt || "Thumbnail"} fill className="object-cover" sizes="64px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ─── RIGHT: Product Details ─── */}
          <div className="w-full lg:w-5/12 flex flex-col">

            {/* Product name */}
            <div className="mb-4">
              <h1 className="text-[26px] md:text-[28px] font-medium text-black leading-[1.25] tracking-tight">
                {product.title}
              </h1>
            </div>

            {/* Star rating (reference amber style) */}
            {product.reviewCount && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={10}
                      className={i < Math.floor(product.rating || 4.5) ? "fill-[#FEC78A] text-[#FEC78A]" : "fill-neutral-200 text-neutral-200"}
                    />
                  ))}
                </div>
                <a href="#reviews" className="text-sm text-neutral-500 hover:text-black transition-colors">
                  {product.reviewCount} reviews
                </a>
              </div>
            )}

            {/* Price */}
            <div className="mb-5">
              <div className="flex items-baseline gap-3">
                <span className="text-[22px] font-semibold text-black">
                  Tk. {product.price.toLocaleString()}
                </span>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <span className="text-base text-neutral-400 line-through">
                    Tk. {product.compareAtPrice.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            {/* Age Range / Subtitle */}
            <div className="text-neutral-500 text-sm mb-5">
              {product.ageRange ? `Ages ${product.ageRange}` : "Kids Toy"}
            </div>

            {/* Description */}
            <div className="mb-6">
              <p className="text-[15px] text-neutral-600 leading-[25px]">
                {product.description}
              </p>
            </div>

            {/* Divider */}
            <div className="border-t border-neutral-200 mb-6" />

            {/* Quantity Selector (reference style: bordered box + +/- buttons) */}
            <div className="mb-5">
              <p className="text-sm text-black uppercase font-medium tracking-wide mb-3">Quantity</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-neutral-200 px-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="bg-white border-none px-2.5 py-2.5 rounded cursor-pointer text-xl font-light hover:bg-neutral-50 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <input
                    type="text"
                    readOnly
                    value={quantity}
                    className="w-10 h-[57px] text-center border-none outline-none bg-white text-black font-medium text-base"
                    aria-label="Quantity"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="bg-white border-none px-2.5 py-2.5 rounded cursor-pointer text-xl font-light hover:bg-neutral-50 transition-colors"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart — reference's full-width bold black button */}
                <button
                  onClick={handleAddToCart}
                  className="flex-1 py-[18px] px-8 bg-black text-white font-semibold text-sm uppercase tracking-wider border-none cursor-pointer hover:bg-neutral-800 transition-colors duration-200 whitespace-nowrap"
                >
                  Add to Cart
                </button>
              </div>
            </div>

            {/* Buy Now */}
            <button
              onClick={handleBuyNow}
              className="w-full py-4 bg-white text-black font-semibold text-sm uppercase tracking-wider border-2 border-black cursor-pointer hover:bg-black hover:text-white transition-colors duration-200 mb-4"
            >
              Buy Now
            </button>

            {/* WhatsApp */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 bg-[#25D366] text-white font-semibold text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#128C7E] transition-colors duration-200 mb-6"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
              </svg>
              Chat on WhatsApp
            </a>

            {/* Wishlist / Share (reference underline-grow style) */}
            <div className="flex items-center gap-8 mb-6">
              <button onClick={handleWishlistClick} className="flex items-center gap-2 bg-white border-none cursor-pointer uppercase text-sm font-medium tracking-wide relative group">
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill={wishlisted ? "red" : "none"} stroke={wishlisted ? "red" : "currentColor"} strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="relative">
                  {wishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                  <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-black transition-[width] duration-300 group-hover:w-1/2" />
                </span>
              </button>
              <div className="flex items-center gap-1.5 uppercase text-sm font-medium tracking-wide cursor-pointer relative group">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <span className="relative">
                  Share
                  <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-black transition-[width] duration-300 group-hover:w-1/2" />
                </span>
              </div>
            </div>

            {/* Product Tags (reference style: SKU / CATEGORIES / TAGS) */}
            <div className="flex flex-col gap-1.5 text-[13px] border-t border-neutral-100 pt-5">
              <p className="text-black">
                <span className="text-neutral-400 uppercase text-xs tracking-wider mr-1">SKU:</span> N/A
              </p>
              {product.category?.name && (
                <p className="text-black">
                  <span className="text-neutral-400 uppercase text-xs tracking-wider mr-1">Category:</span>
                  {product.category.name}
                </p>
              )}
              {product.ageRange && (
                <p className="text-black">
                  <span className="text-neutral-400 uppercase text-xs tracking-wider mr-1">Ages:</span>
                  {product.ageRange}
                </p>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          TABS: Description & Reviews
          (reference AdditionalInfo style tab nav)
          ═══════════════════════════════════════════ */}
      <section id="reviews" className="px-4 sm:px-10 lg:px-40 py-14 md:py-20 border-t border-neutral-200">
        <div className="max-w-[1000px] mx-auto">

          {/* Tab headers — reference's underline active indicator */}
          <div className="flex gap-10 md:gap-16 border-b border-neutral-200 mb-10 overflow-x-auto hide-scrollbar">
            {[
              { key: "description", label: "Description" },
              {
                key: "reviews",
                label: `Reviews${product.reviewCount ? ` (${product.reviewCount})` : ""}`,
              },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={cn(
                  "relative pb-4 text-base md:text-lg font-medium transition-colors whitespace-nowrap uppercase tracking-wide",
                  activeTab === key ? "text-black" : "text-neutral-400 hover:text-black"
                )}
              >
                {label}
                {activeTab === key && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-black" />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-[300px]">

            {/* ─── Description Tab ─── */}
            {activeTab === "description" && (
              <div className="animate-in fade-in duration-300">
                {/* Main description paragraphs (reference layout: heading + body) */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-black mb-3">
                    {product.title}
                  </h3>
                  <p className="text-[15px] text-neutral-600 leading-[25px]">
                    {product.description}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <h3 className="text-base font-semibold text-black mb-3">Why choose this product?</h3>
                    <ul className="list-disc pl-5 space-y-2 text-[15px] text-neutral-600 leading-relaxed">
                      <li>Non-toxic, child-safe materials</li>
                      <li>Designed for open-ended, creative play</li>
                      <li>Sustainably sourced and eco-friendly</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-black mb-3">Product Details</h3>
                    <p className="text-[15px] text-neutral-600 leading-relaxed whitespace-pre-line">
                      {product.longDescription || "Experience the perfect blend of fun and learning. Made from premium, child-safe materials, it stands up to enthusiastic play and looks beautiful in any playroom."}
                    </p>
                  </div>
                </div>

                {/* Shipping info (reference style) */}
                <div className="border-t border-neutral-200 pt-8">
                  <h3 className="text-base font-semibold text-black mb-4 uppercase tracking-wide">Shipping &amp; Returns</h3>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start gap-3">
                      <Truck className="w-5 h-5 text-black shrink-0 mt-0.5" />
                      <p className="text-[14px] text-neutral-600">Free standard shipping on orders over Tk. 1,500.</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <RefreshCcw className="w-5 h-5 text-black shrink-0 mt-0.5" />
                      <p className="text-[14px] text-neutral-600">Return within 30 days of receiving your order.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ─── Reviews Tab ─── */}
            {activeTab === "reviews" && (
              <div className="space-y-12 animate-in fade-in duration-300">
                <div className="flex flex-col md:flex-row gap-8 lg:gap-16 items-start">

                  {/* Review Summary Panel */}
                  <div className="flex flex-col items-center justify-center bg-neutral-50 p-10 w-full md:w-auto min-w-[280px]">
                    <span className="text-6xl font-bold text-black mb-3">{product.rating || 0}</span>
                    <div className="flex mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={24}
                          className={i < Math.floor(product.rating || 0) ? "fill-[#FEC78A] text-[#FEC78A]" : "fill-neutral-200 text-neutral-200"}
                        />
                      ))}
                    </div>
                    <span className="text-neutral-500 font-medium">
                      Based on {product.reviewCount || 0} reviews
                    </span>

                    {!isWritingReview && (
                      <button
                        onClick={() => setIsWritingReview(true)}
                        className="mt-8 w-full py-3 px-6 border-2 border-black font-bold text-sm uppercase tracking-wide text-black hover:bg-black hover:text-white transition-colors duration-200"
                      >
                        Write a Review
                      </button>
                    )}
                  </div>

                  {/* Review List & Form */}
                  <div className="flex-1 w-full space-y-8">
                    {isWritingReview && (
                      <form
                        onSubmit={submitReview}
                        className="bg-neutral-50 p-6 md:p-8 space-y-6 animate-in slide-in-from-top-4 duration-300 border border-neutral-200"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-xl font-bold text-black uppercase tracking-wide">Write a Review</h3>
                          <button
                            type="button"
                            onClick={() => setIsWritingReview(false)}
                            className="text-neutral-500 hover:text-black font-semibold underline text-sm"
                          >
                            Cancel
                          </button>
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-black mb-2 uppercase tracking-wide">
                            Your Rating *
                          </label>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                type="button"
                                key={star}
                                onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                                className="focus:outline-none transition-transform hover:scale-110"
                              >
                                <Star
                                  size={28}
                                  className={star <= reviewForm.rating ? "fill-[#FEC78A] text-[#FEC78A]" : "fill-neutral-300 text-neutral-300"}
                                />
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-bold text-black mb-2 uppercase tracking-wide">Name</label>
                            <input
                              required
                              type="text"
                              value={reviewForm.name}
                              onChange={e => setReviewForm(prev => ({ ...prev, name: e.target.value }))}
                              className="w-full border border-neutral-300 px-4 py-3 text-black font-medium placeholder:text-neutral-400 bg-white outline-none focus:border-black transition-all"
                              placeholder="Your name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-black mb-2 uppercase tracking-wide">Review Title</label>
                            <input
                              required
                              type="text"
                              value={reviewForm.title}
                              onChange={e => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
                              className="w-full border border-neutral-300 px-4 py-3 text-black font-medium placeholder:text-neutral-400 bg-white outline-none focus:border-black transition-all"
                              placeholder="Summarize your experience"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-black mb-2 uppercase tracking-wide">Your Review</label>
                          <textarea
                            required
                            rows={5}
                            value={reviewForm.text}
                            onChange={e => setReviewForm(prev => ({ ...prev, text: e.target.value }))}
                            className="w-full border border-neutral-300 px-4 py-3 text-black font-medium placeholder:text-neutral-400 bg-white outline-none focus:border-black transition-all resize-none"
                            placeholder="Tell us what you think..."
                          />
                        </div>

                        <button
                          disabled={isSubmittingReview}
                          type="submit"
                          className="bg-black text-white font-bold text-sm uppercase tracking-wide py-3.5 px-8 hover:bg-neutral-800 disabled:opacity-70 transition-colors"
                        >
                          {isSubmittingReview ? "Submitting..." : "Submit"}
                        </button>
                      </form>
                    )}

                    {!isWritingReview && (!product.reviews || product.reviews.length === 0) && (
                      <div className="text-center py-12 bg-neutral-50">
                        <p className="text-neutral-500 font-medium">
                          No reviews yet. Be the first to review this product!
                        </p>
                      </div>
                    )}

                    {!isWritingReview &&
                      product.reviews &&
                      [...product.reviews].reverse().map((review: any, i: number) => (
                        <div key={i} className="border-b border-neutral-200 pb-8 last:border-0">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              {/* User avatar initials */}
                              <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center text-sm font-bold text-neutral-600 shrink-0">
                                {review.name?.[0]?.toUpperCase() || "A"}
                              </div>
                              <div>
                                <p className="font-semibold text-black text-sm">{review.name}</p>
                                <div className="flex gap-0.5 mt-0.5">
                                  {[...Array(5)].map((_, j) => (
                                    <Star
                                      key={j}
                                      size={11}
                                      className={j < review.rating ? "fill-[#FEC78A] text-[#FEC78A]" : "fill-neutral-200 text-neutral-200"}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                            <span className="text-neutral-400 text-xs font-medium">
                              {new Date(review.date).toLocaleDateString()}
                            </span>
                          </div>
                          {review.title && (
                            <p className="font-bold text-black mb-2">{review.title}</p>
                          )}
                          <p className="text-neutral-600 text-sm leading-relaxed whitespace-pre-line">
                            "{review.text}"
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          RELATED PRODUCTS
          ═══════════════════════════════════════════ */}
      {relatedProducts && relatedProducts.length > 0 && (
        <section className="px-4 sm:px-10 lg:px-40 py-14 md:py-20 border-t border-neutral-200">
          <div className="text-center mb-10">
            <h2 className="uppercase text-2xl md:text-[35px] font-medium text-black">
              You Might Also <span className="font-bold">Like</span>
            </h2>
          </div>
          <ProductGridNike
            title={undefined}
            products={relatedProducts}
            theme="light"
          />
        </section>
      )}

    </div>
  );
}