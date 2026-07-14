"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCart } from "@/components/providers/CartProvider";
import { useToast } from "@/components/playshelf/Toast";
import ProductGridNike from "@/components/ui/product-grid-nike";
import { Star, Truck, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProductDetailsClient({ product: initialProduct, relatedProducts }: { product: any; relatedProducts?: any[] }) {
  const router = useRouter();
  const { addItem, openCart } = useCart();
  const { showToast } = useToast();

  const product = initialProduct;

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

  return (
    <div className="bg-white min-h-screen text-black font-sans pb-16">

      {/* Product Area */}
      <section className="px-6 md:px-12 py-10 md:py-16 max-w-[1440px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 xl:gap-24">

          {/* Left: Image Gallery */}
          <div className="w-full lg:w-1/2 lg:w-7/12 flex flex-col md:flex-row gap-4 lg:sticky lg:top-24 h-fit">

            {/* Desktop Thumbnails (Left side of main image) */}
            {product.images && product.images.length > 1 && (
              <div className="hidden md:flex flex-col gap-4 w-20 shrink-0">
                {product.images.map((img: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={cn(
                      "relative w-full aspect-square rounded-none overflow-hidden shrink-0 border border-neutral-200 transition-opacity",
                      activeImage === idx ? "opacity-100" : "opacity-50 hover:opacity-100"
                    )}
                  >
                    <Image src={img.url} alt={img.alt || "Thumbnail"} fill className="object-cover" sizes="80px" />
                  </button>
                ))}
              </div>
            )}

            <div className="relative aspect-square md:aspect-[4/5] w-full rounded-none overflow-hidden bg-[#f5f5f5]">
              {product.images?.[activeImage] && (
                <Image
                  src={product.images[activeImage].url}
                  alt={product.images[activeImage].alt || product.title}
                  fill
                  className="object-cover transition-opacity duration-300"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              )}
            </div>

            {/* Mobile Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex md:hidden gap-3 overflow-x-auto scroll-snap-x no-scrollbar pb-2">
                {product.images.map((img: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={cn(
                      "relative w-16 aspect-square rounded-none overflow-hidden shrink-0 border border-neutral-200 transition-all",
                      activeImage === idx ? "opacity-100" : "opacity-50 hover:opacity-100"
                    )}
                  >
                    <Image src={img.url} alt={img.alt || "Thumbnail"} fill className="object-cover" sizes="64px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Info */}
          <div className="w-full lg:w-1/2 lg:w-5/12 flex flex-col pt-0 lg:pt-8">

            {/* Header */}
            <div className="space-y-4 mb-8">
              <h1 className="font-sans font-medium text-[32px] md:text-[40px] leading-[1.2] tracking-tight text-black">
                {product.title}
              </h1>

              {/* Age Range & Subtitle */}
              <div className="text-neutral-600 font-sans text-base">
                {product.ageRange ? `Ages ${product.ageRange}` : "Kids Toy"}
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-4 pt-2">
                <span className="font-sans font-medium text-2xl text-black">
                  Tk. {product.price.toLocaleString()}
                </span>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <span className="text-lg text-neutral-500 line-through">
                    Tk. {product.compareAtPrice.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            {/* Rating */}
            {product.reviewCount && (
              <div className="flex items-center gap-2 mb-8">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className={i < Math.floor(product.rating || 4.5) ? "fill-black text-black" : "fill-neutral-200 text-neutral-200"} />
                  ))}
                </div>
                <a href="#reviews" className="text-sm font-sans font-medium text-black hover:opacity-70 transition-opacity">
                  {product.reviewCount} Reviews
                </a>
              </div>
            )}

            {/* Selectors / Quantity */}
            <div className="space-y-6 mb-10">
              <div className="flex flex-col gap-3">
                <label className="text-sm font-sans font-medium">Quantity</label>
                <div className="w-32">
                  <div className="flex items-center justify-between border border-black rounded-full h-12 px-4">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-black font-medium text-lg w-6 flex justify-center hover:opacity-70" aria-label="Decrease quantity">−</button>
                    <span className="font-sans font-medium">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="text-black font-medium text-lg w-6 flex justify-center hover:opacity-70" aria-label="Increase quantity">+</button>
                  </div>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-3 mb-12">
              <button
                onClick={handleAddToCart}
                className="w-full bg-black text-white font-sans font-medium rounded-full py-4 px-8 text-lg hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
              >
                Add to Bag
              </button>

              <button
                onClick={handleBuyNow}
                className="w-full bg-white text-black font-sans font-medium rounded-full py-4 px-8 text-lg border border-black hover:border-neutral-500 hover:text-neutral-600 transition-all"
              >
                Buy Now
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#25D366] text-white font-sans font-medium rounded-full py-4 px-8 text-lg hover:bg-[#128C7E] transition-colors flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
                </svg>
                Chat on WhatsApp
              </a>
            </div>

            {/* Accordions */}
            <div className="space-y-4 pt-8 border-t border-neutral-200">
              {/* Description */}
              <div className="pb-4 border-b border-neutral-200">
                <h3 className="font-sans font-medium text-lg text-black mb-3">Product Details</h3>
                <p className="text-neutral-600 font-sans text-base leading-relaxed">
                  {product.description}
                </p>
                <ul className="list-disc pl-5 mt-4 space-y-2 text-neutral-600 font-sans">
                  <li>Non-toxic, water-based finishes</li>
                  <li>Sustainably sourced materials</li>
                  <li>Designed for open-ended play</li>
                </ul>
              </div>

              {/* Shipping */}
              <div className="pb-4 border-b border-neutral-200">
                <h3 className="font-sans font-medium text-lg text-black mb-3">Shipping & Returns</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Truck className="w-5 h-5 text-black shrink-0 mt-0.5" />
                    <p className="text-neutral-600 text-sm font-sans">Free standard shipping on orders over $50.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <RefreshCcw className="w-5 h-5 text-black shrink-0 mt-0.5" />
                    <p className="text-neutral-600 text-sm font-sans">Return within 30 days of receiving your order.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ─── Tabs Section: Long Description & Reviews ─── */}
      <section className="px-6 md:px-12 py-16 md:py-20 border-t border-neutral-200">
        <div className="max-w-[1000px] mx-auto">
          {/* Tab Headers */}
          <div className="flex gap-8 md:gap-16 border-b border-neutral-200 mb-10 overflow-x-auto hide-scrollbar">
            <button
              onClick={() => setActiveTab("description")}
              className={cn(
                "pb-4 font-sans text-lg md:text-xl font-medium transition-colors relative whitespace-nowrap",
                activeTab === "description" ? "text-black" : "text-neutral-400 hover:text-black"
              )}
            >
              Description
              {activeTab === "description" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />}
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={cn(
                "pb-4 font-sans text-lg md:text-xl font-medium transition-colors relative whitespace-nowrap",
                activeTab === "reviews" ? "text-black" : "text-neutral-400 hover:text-black"
              )}
            >
              Reviews {product.reviewCount ? `(${product.reviewCount})` : ""}
              {activeTab === "reviews" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />}
            </button>
          </div>

          {/* Tab Content */}
          <div className="font-sans min-h-[300px]">
            {activeTab === "description" && (
              <div className="prose prose-lg max-w-none text-neutral-600 space-y-6 animate-in fade-in duration-500">
                <p className="leading-relaxed text-lg">
                  {product.description}
                </p>
                <p className="leading-relaxed text-lg mt-6 whitespace-pre-line">
                  {product.longDescription || "Experience the perfect blend of fun and learning with our meticulously crafted toys. Designed to inspire creativity, this product provides hours of engaging playtime while developing essential motor skills. Made from premium, child-safe materials, it stands up to enthusiastic play and looks beautiful in any playroom."}
                </p>

                <div className="grid md:grid-cols-2 gap-8 mt-12">
                  <div className="bg-neutral-50 p-8 rounded-2xl">
                    <h3 className="text-xl font-bold text-black mb-4">Key Features</h3>
                    <ul className="list-disc pl-5 space-y-3 text-neutral-600">
                      <li>Premium quality materials designed to last</li>
                      <li>Tested for maximum safety and durability</li>
                      <li>Enhances cognitive development and motor skills</li>
                      <li>Beautiful, timeless design</li>
                    </ul>
                  </div>
                  <div className="bg-neutral-50 p-8 rounded-2xl">
                    <h3 className="text-xl font-bold text-black mb-4">Specifications</h3>
                    <ul className="space-y-3 text-neutral-600">
                      <li><strong className="text-black font-medium">Age Recommendation:</strong> {product.ageRange ? `Ages ${product.ageRange}` : "Kids"}</li>
                      <li><strong className="text-black font-medium">Materials:</strong> Eco-friendly wood and non-toxic paint</li>
                      <li><strong className="text-black font-medium">Care:</strong> Wipe clean with a damp cloth</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-12 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row gap-8 lg:gap-16 items-start">
                  {/* Review Summary */}
                  <div className="flex flex-col items-center justify-center bg-neutral-50 p-10 rounded-3xl w-full md:w-auto min-w-[280px]">
                    <span className="text-6xl font-bold text-black mb-3">{product.rating || 0}</span>
                    <div className="flex text-black mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={24} className={i < Math.floor(product.rating || 0) ? "fill-black text-black" : "fill-neutral-200 text-neutral-200"} />
                      ))}
                    </div>
                    <span className="text-neutral-500 font-medium text-lg">Based on {product.reviewCount || 0} reviews</span>

                    {!isWritingReview && (
                      <button
                        onClick={() => setIsWritingReview(true)}
                        className="mt-8 w-full py-3 px-6 rounded-full border-2 border-black font-bold text-black hover:bg-black hover:text-white transition-colors"
                      >
                        Write a Review
                      </button>
                    )}
                  </div>

                  {/* Review List & Form */}
                  <div className="flex-1 w-full space-y-8">
                    {isWritingReview && (
                      <form onSubmit={submitReview} className="bg-neutral-50 p-6 md:p-8 rounded-3xl space-y-6 animate-in slide-in-from-top-4 duration-300 border border-neutral-200">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-xl font-bold text-black">Write a Review</h3>
                          <button type="button" onClick={() => setIsWritingReview(false)} className="text-neutral-700 hover:text-black font-semibold underline text-sm">Cancel</button>
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-black mb-2">Rating</label>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                type="button"
                                key={star}
                                onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                                className="focus:outline-none transition-transform hover:scale-110"
                              >
                                <Star size={32} className={star <= reviewForm.rating ? "fill-black text-black" : "fill-neutral-300 text-neutral-300"} />
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-bold text-black mb-2">Name</label>
                            <input
                              required
                              type="text"
                              value={reviewForm.name}
                              onChange={e => setReviewForm(prev => ({ ...prev, name: e.target.value }))}
                              className="w-full rounded-lg border border-neutral-400 px-4 py-3 text-black font-medium placeholder:text-neutral-500 bg-white outline-none focus:border-black focus:ring-1 focus:ring-black transition-all shadow-sm"
                              placeholder="Your name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-black mb-2">Review Title</label>
                            <input
                              required
                              type="text"
                              value={reviewForm.title}
                              onChange={e => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
                              className="w-full rounded-lg border border-neutral-400 px-4 py-3 text-black font-medium placeholder:text-neutral-500 bg-white outline-none focus:border-black focus:ring-1 focus:ring-black transition-all shadow-sm"
                              placeholder="Summarize your experience"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-black mb-2">Review</label>
                          <textarea
                            required
                            rows={4}
                            value={reviewForm.text}
                            onChange={e => setReviewForm(prev => ({ ...prev, text: e.target.value }))}
                            className="w-full rounded-lg border border-neutral-400 px-4 py-3 text-black font-medium placeholder:text-neutral-500 bg-white outline-none focus:border-black focus:ring-1 focus:ring-black transition-all shadow-sm"
                            placeholder="Tell us what you think..."
                          />
                        </div>

                        <button disabled={isSubmittingReview} type="submit" className="w-full md:w-auto bg-black text-white font-bold py-3.5 px-8 rounded-full hover:bg-neutral-800 disabled:opacity-70 transition-colors">
                          {isSubmittingReview ? "Submitting..." : "Submit Review"}
                        </button>
                      </form>
                    )}

                    {!isWritingReview && (!product.reviews || product.reviews.length === 0) && (
                      <div className="text-center py-12 bg-neutral-50 rounded-3xl">
                        <p className="text-neutral-500 font-medium text-lg">No reviews yet. Be the first to review this product!</p>
                      </div>
                    )}

                    {!isWritingReview && product.reviews && [...product.reviews].reverse().map((review: any, i: number) => (
                      <div key={i} className="border-b border-neutral-100 pb-8 last:border-0 animate-in fade-in duration-500">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex">
                            {[...Array(5)].map((_, j) => <Star key={j} size={16} className={j < review.rating ? "fill-black text-black" : "fill-neutral-200 text-neutral-200"} />)}
                          </div>
                          <span className="text-black font-bold text-lg ml-2">{review.title}</span>
                        </div>
                        <p className="text-neutral-600 mb-4 text-base leading-relaxed whitespace-pre-line">
                          "{review.text}"
                        </p>
                        <div className="text-neutral-400 text-sm font-medium">
                          {review.name} — {new Date(review.date).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <section className="px-6 md:px-12 py-16 md:py-24 max-w-[1440px] mx-auto border-t border-neutral-200 mt-8">
          <ProductGridNike
            title="You might also like"
            products={relatedProducts}
          />
        </section>
      )}

    </div>
  );
}