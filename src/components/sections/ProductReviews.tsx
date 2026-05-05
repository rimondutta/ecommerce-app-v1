"use client";

import { useState, useEffect } from "react";
import { Star, Verified, Filter, ChevronDown, CheckCircle2 } from "lucide-react";
import ReviewForm from "@/components/forms/ReviewForm";
import { Star as StarIcon } from "lucide-react";

interface Review {
  _id: string;
  userName: string;
  rating: number;
  comment: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
}

export default function ProductReviews({ slug }: { slug: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/store/products/${slug}/reviews`);
      const data = await res.json();
      if (data.reviews) {
        setReviews(data.reviews);
      }
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [slug]);

  const averageRating = reviews.length > 0 
    ? reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length 
    : 0;

  return (
    <section className="section-padding relative z-10 border-t border-white/5 bg-[#0a0a0a]">
      <div className="max-w-[1800px] mx-auto px-6 md:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-32">
          
          {/* SUMMARY - LEFT (4 cols) */}
          <div className="lg:col-span-5 space-y-12 h-fit">
            <div className="space-y-6">
               <div className="flex items-center gap-3">
                 <div className="w-8 h-[1px] bg-[#333]" />
                 <span className="label-tiny text-[#555]">Feedback Analysis</span>
               </div>
               <h2 className="leading-[0.85]">
                 <span className="font-serif text-5xl md:text-8xl text-white block">Archive</span>
                 <span className="font-serif italic text-5xl md:text-8xl text-[#555] block">Feedback.</span>
               </h2>
            </div>

            <div className="p-12 border border-white/5 space-y-12 bg-[#0d0d0d] relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.02] -mr-8 -mt-8 rotate-12">
                  <StarIcon size={160} className="fill-white" />
               </div>
               
               <div className="flex items-end gap-8">
                  <span className="font-serif text-8xl md:text-9xl leading-none text-white tracking-tighter">
                     {averageRating.toFixed(1)}
                  </span>
                  <div className="flex flex-col gap-4 pb-2">
                     <div className="flex gap-1.5">
                        {[1, 2, 3, 4, 5].map(i => (
                          <StarIcon key={i} size={20} className={i <= Math.round(averageRating) ? "fill-white text-white" : "text-white/10"} />
                        ))}
                     </div>
                     <span className="label-tiny text-[#555]">Average Rating</span>
                  </div>
               </div>

               <div className="space-y-6 pt-4">
                  {[5, 4, 3, 2, 1].map(score => {
                     const count = reviews.filter(r => r.rating === score).length;
                     const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                     return (
                       <div key={score} className="flex items-center gap-8 group">
                          <span className="label-tiny text-white w-10">{score} ST</span>
                          <div className="flex-1 h-[1px] bg-white/5 relative overflow-hidden">
                             <div 
                               className="absolute inset-y-0 left-0 bg-white/40 transition-all duration-1000 ease-[0.16,1,0.3,1]" 
                               style={{ width: `${percentage}%` }} 
                             />
                          </div>
                          <span className="label-tiny text-[#333] group-hover:text-white transition-colors w-12 text-right">{percentage.toFixed(0)}%</span>
                       </div>
                     );
                  })}
               </div>

               <button 
                 onClick={() => setShowForm(!showForm)}
                 className="btn-pill-primary w-full h-16 justify-center"
               >
                 {showForm ? "Cancel Entry" : "Write a Review"}
               </button>
            </div>
          </div>


        {/* LIST - RIGHT (8 cols) */}
        <div className="lg:col-span-8">
          
          {showForm && (
            <div className="mb-20 animate-reveal border border-black/5 p-8 bg-[#fafafa]">
              <ReviewForm slug={slug} onSuccess={() => {
                setShowForm(false);
                fetchReviews();
              }} />
            </div>
          )}

          <div className="space-y-12">
            {loading ? (
              <div className="py-24 flex items-center justify-center gap-6 border border-black/5">
                 <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
                 <p className="text-[10px] font-black uppercase tracking-[0.3em]">Loading Records...</p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="py-40 border border-black/5 bg-[#fafafa] flex flex-col items-center justify-center gap-8 text-center px-12">
                 <div className="w-20 h-20 rounded-full border border-black/5 flex items-center justify-center bg-white shadow-xl">
                    <Filter size={32} className="text-black/20" />
                 </div>
                 <div className="space-y-2">
                    <h4 className="font-display font-black text-4xl uppercase tracking-tighter">No Reviews Yet</h4>
                    <p className="text-xs font-medium uppercase tracking-widest text-black/40 leading-loose max-w-xs mx-auto">Be the first to document your experience with this piece.</p>
                 </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-12">
                {reviews.map((review, idx) => (
                  <div 
                    key={review._id} 
                    className="group space-y-8 animate-reveal"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                       <div className="flex items-center gap-6">
                          <div className="w-16 h-16 rounded-full border border-black/5 bg-white flex items-center justify-center shadow-lg group-hover:shadow-2xl transition-all duration-500 overflow-hidden">
                             {/* Placeholder avatar or initial */}
                             <span className="font-display font-black text-2xl uppercase">{review.userName.charAt(0)}</span>
                          </div>
                          <div className="space-y-1">
                             <div className="flex items-center gap-3">
                                <h5 className="text-[12px] font-black uppercase tracking-widest">{review.userName}</h5>
                                {review.isVerifiedPurchase && (
                                  <div className="flex items-center gap-1.5 text-[8px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 uppercase tracking-widest rounded-full">
                                    <CheckCircle2 size={10} /> Verified
                                  </div>
                                )}
                             </div>
                             <p className="text-[10px] font-bold text-black/30 uppercase tracking-[0.2em]">
                                {new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                             </p>
                          </div>
                       </div>
                       <div className="flex gap-1 py-2 px-4 bg-[#fafafa] rounded-full border border-black/5">
                          {[1, 2, 3, 4, 5].map(star => (
                            <StarIcon 
                              key={star} 
                              size={14} 
                              className={star <= review.rating ? "fill-black text-black" : "text-black/10"} 
                            />
                          ))}
                       </div>
                    </div>

                    <div className="pl-0 md:pl-24">
                       <p className="text-sm md:text-base leading-relaxed text-black/70 font-medium">
                         "{review.comment}"
                       </p>
                       
                       <div className="flex items-center gap-8 pt-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                          <button className="text-[10px] font-black uppercase tracking-[0.2em] border-b-2 border-black pb-1">Was this helpful?</button>
                          <button className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30 hover:text-red-500 transition-colors">Report</button>
                       </div>
                    </div>
                    
                    <div className="w-full h-px bg-black/5 pt-12" />
                  </div>
                ))}
              </div>
            )}

            {reviews.length > 5 && (
               <div className="flex justify-center pt-20">
                  <button className="group px-16 h-16 border border-black text-black font-black uppercase tracking-[0.3em] text-[11px] hover:bg-black hover:text-white transition-all duration-500 flex items-center gap-4">
                    View More Reviews <ChevronDown size={18} className="group-hover:translate-y-1 transition-transform" />
                  </button>
               </div>
            )}
          </div>
          </div>
        </div>
      </div>
    </section>
  );
}
