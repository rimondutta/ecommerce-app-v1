"use client";

import { useState, useEffect } from "react";
import { Star, Verified, Filter, ChevronDown, CheckCircle2 } from "lucide-react";
import ReviewForm from "@/components/forms/ReviewForm";

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
    <section className="mt-48">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-24">
        
        {/* SUMMARY - LEFT (4 cols) */}
        <div className="lg:col-span-4 space-y-12 h-fit lg:sticky lg:top-[160px]">
          <div className="space-y-6">
             <h2 className="font-display font-black text-6xl md:text-8xl uppercase tracking-tighter leading-none">
               COLLECTION<br />VOICES
             </h2>
             <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-black/40">Collective Data Analysis ({reviews.length} entries)</p>
          </div>

          <div className="p-10 border-4 border-black space-y-8 bg-neutral-50 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
             <div className="flex items-end gap-6">
                <span className="font-display font-black text-8xl leading-none tracking-tight">
                  {averageRating.toFixed(1)}
                </span>
                <div className="flex flex-col gap-2 pb-2">
                   <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(i => (
                        <Star key={i} size={16} className={i <= Math.round(averageRating) ? "fill-black text-black" : "text-black/10"} />
                      ))}
                   </div>
                   <span className="text-[9px] font-black uppercase tracking-widest leading-none">Global Rating</span>
                </div>
             </div>

             <div className="space-y-4">
                {[5, 4, 3, 2, 1].map(score => {
                   const count = reviews.filter(r => r.rating === score).length;
                   const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                   return (
                     <div key={score} className="flex items-center gap-6">
                        <span className="text-[10px] font-black uppercase w-8">{score}★</span>
                        <div className="flex-1 h-3 bg-neutral-200 border border-black/5 relative overflow-hidden">
                           <div 
                             className="absolute inset-y-0 left-0 bg-black transition-all duration-1000" 
                             style={{ width: `${percentage}%` }} 
                           />
                        </div>
                        <span className="text-[10px] font-bold text-black/40 w-12 text-right">{percentage.toFixed(0)}%</span>
                     </div>
                   );
                })}
             </div>

             <button 
               onClick={() => setShowForm(!showForm)}
               className="w-full py-6 border-4 border-black bg-white text-black font-black uppercase tracking-[0.3em] text-[10px] hover:bg-black hover:text-white transition-all active:translate-x-1 active:translate-y-1"
             >
               {showForm ? "Cancel Submission" : "Post Archival Entry"}
             </button>
          </div>
        </div>

        {/* LIST - RIGHT (8 cols) */}
        <div className="lg:col-span-8 space-y-24">
          
          {showForm && (
            <div className="animate-reveal">
              <ReviewForm slug={slug} onSuccess={() => {
                setShowForm(false);
                fetchReviews();
              }} />
            </div>
          )}

          <div className="space-y-12">
            {loading ? (
              <div className="py-24 flex items-center justify-center gap-4">
                 <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
                 <p className="text-[10px] font-black uppercase tracking-widest">Compiling entries...</p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="py-32 border-4 border-black border-dashed flex flex-col items-center justify-center gap-8 text-center px-12">
                 <div className="w-16 h-16 border-2 border-black/10 flex items-center justify-center">
                    <Filter size={32} className="opacity-10" />
                 </div>
                 <h4 className="font-display font-black text-3xl uppercase tracking-tight">Zero Data Points Found</h4>
                 <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-black/40 leading-loose max-w-sm">No documented reviews exist for this garment yet. Be the first to add an archival entry.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-12">
                {reviews.map((review, idx) => (
                  <div 
                    key={review._id} 
                    className="p-12 border-2 border-black space-y-8 animate-reveal"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b-2 border-black/5">
                       <div className="flex items-center gap-6">
                          <div className="w-14 h-14 bg-black text-white flex items-center justify-center font-display font-black text-2xl uppercase">
                            {review.userName.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                               <h5 className="text-xs font-black uppercase tracking-widest">{review.userName}</h5>
                               {review.isVerifiedPurchase && (
                                 <span className="flex items-center gap-1.5 text-[8px] font-black bg-blue-50 text-blue-600 px-2.5 py-1 uppercase tracking-widest border border-blue-600/20">
                                   <CheckCircle2 size={10} /> Verified
                                 </span>
                               )}
                            </div>
                            <p className="text-[9px] font-bold text-black/30 uppercase tracking-[0.2em]">
                               Documented / {new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                          </div>
                       </div>
                       <div className="flex gap-1.5">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star 
                              key={star} 
                              size={14} 
                              className={star <= review.rating ? "fill-black text-black" : "text-black/10"} 
                            />
                          ))}
                       </div>
                    </div>

                    <div className="space-y-6">
                       <p className="text-[13px] leading-loose font-medium uppercase tracking-wide text-black/70">
                         {review.comment}
                       </p>
                    </div>

                    <div className="flex items-center gap-6 pt-4">
                       <button className="text-[9px] font-black uppercase tracking-widest border-b border-black">Helpful (0)</button>
                       <button className="text-[9px] font-black uppercase tracking-widest text-black/20 hover:text-black transition-colors">Report Violation</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {reviews.length > 5 && (
               <div className="flex justify-center pt-24">
                  <button className="group px-16 py-6 border-2 border-black text-black font-black uppercase tracking-[0.3em] text-[10px] hover:bg-black hover:text-white transition-all shadow-[12px_12px_0px_0px_rgba(0,0,0,0.05)] active:shadow-none">
                    Expand Review Archives <ChevronDown size={14} className="inline ml-4 group-hover:translate-y-1 transition-transform" />
                  </button>
               </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
