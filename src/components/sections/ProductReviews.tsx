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
    <section className="mt-24 md:mt-48 relative z-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
        
        {/* SUMMARY - LEFT (4 cols) */}
        <div className="lg:col-span-4 space-y-12 h-fit lg:sticky lg:top-[160px]">
          <div className="space-y-6">
             <h2 className="font-display font-black text-5xl md:text-8xl uppercase tracking-tighter leading-none" style={{ WebkitTextStroke: "1px black", color: "transparent" }}>
               SYS<br />LOGS
             </h2>
             <p className="font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-black border border-black px-3 py-1 bg-white inline-block">DATA_ANALYSIS: {reviews.length} ENTRIES</p>
          </div>

          <div className="p-10 border border-black space-y-8 bg-[#f0ece5] relative">
             <div className="absolute top-0 left-0 bg-black text-[#f0ece5] font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 border-b border-r border-black">GLOBAL_SCORE</div>
             <div className="flex items-end gap-6 pt-4">
                <span className="font-display font-black text-7xl md:text-8xl leading-none tracking-tight">
                  {averageRating.toFixed(1)}
                </span>
                <div className="flex flex-col gap-2 pb-2">
                   <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(i => (
                        <Star key={i} size={16} className={i <= Math.round(averageRating) ? "fill-black text-black" : "text-black/10"} />
                      ))}
                   </div>
                   <span className="font-mono text-[9px] font-black uppercase tracking-widest leading-none">RATING_AVG</span>
                </div>
             </div>

             <div className="space-y-4 border-t border-black pt-8">
                {[5, 4, 3, 2, 1].map(score => {
                   const count = reviews.filter(r => r.rating === score).length;
                   const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                   return (
                     <div key={score} className="flex items-center gap-6">
                        <span className="font-mono text-[10px] font-black uppercase w-8">[{score}★]</span>
                        <div className="flex-1 h-2 border border-black bg-white relative overflow-hidden">
                           <div 
                             className="absolute inset-y-0 left-0 bg-black transition-all duration-1000" 
                             style={{ width: `${percentage}%` }} 
                           />
                        </div>
                        <span className="font-mono text-[10px] font-bold text-black w-12 text-right">{percentage.toFixed(0)}%</span>
                     </div>
                   );
                })}
             </div>

             <button 
               onClick={() => setShowForm(!showForm)}
               className="w-full py-4 border border-black bg-white text-black font-mono font-black uppercase tracking-[0.3em] text-[10px] hover:bg-black hover:text-[#f0ece5] transition-colors"
             >
               {showForm ? "ABORT_ENTRY" : "INIT_ARCHIVAL_ENTRY"}
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
              <div className="py-24 flex items-center justify-center gap-4 border border-black bg-white">
                 <div className="w-4 h-4 bg-black animate-pulse" />
                 <p className="font-mono text-[10px] font-black uppercase tracking-widest">FETCHING_DATA...</p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="py-32 border border-black bg-white flex flex-col items-center justify-center gap-8 text-center px-12 relative">
                 <div className="absolute top-0 left-0 bg-black text-[#f0ece5] font-mono text-[9px] uppercase tracking-widest px-2 py-0.5">STATUS</div>
                 <div className="w-12 h-12 border border-black flex items-center justify-center">
                    <Filter size={24} className="text-black" />
                 </div>
                 <h4 className="font-display font-black text-3xl uppercase tracking-tight">NULL_DATA</h4>
                 <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-black/60 leading-loose max-w-sm">NO DOCUMENTED LOGS EXIST. INIT NEW ENTRY TO POPULATE DB.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-8">
                {reviews.map((review, idx) => (
                  <div 
                    key={review._id} 
                    className="p-8 border border-black space-y-6 bg-white relative animate-reveal"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-black">
                       <div className="flex items-center gap-6">
                          <div className="w-12 h-12 border border-black text-black flex items-center justify-center font-display font-black text-xl uppercase bg-[#f0ece5]">
                            {review.userName.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                               <h5 className="font-mono text-[11px] font-black uppercase tracking-widest">USER_{review.userName.replace(/\s+/g, '_')}</h5>
                               {review.isVerifiedPurchase && (
                                 <span className="flex items-center gap-1.5 font-mono text-[8px] font-black bg-black text-[#f0ece5] px-2 py-0.5 uppercase tracking-widest border border-black">
                                   <CheckCircle2 size={10} /> SYS_VERIFIED
                                 </span>
                               )}
                            </div>
                            <p className="font-mono text-[9px] font-bold text-black/50 uppercase tracking-widest">
                               LOG_DATE: {new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.')}
                            </p>
                          </div>
                       </div>
                       <div className="flex gap-1 border border-black p-2 bg-[#f0ece5]">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star 
                              key={star} 
                              size={12} 
                              className={star <= review.rating ? "fill-black text-black" : "text-black/10"} 
                            />
                          ))}
                       </div>
                    </div>

                    <div className="space-y-4">
                       <p className="font-mono text-[11px] leading-[2] font-medium uppercase tracking-widest text-black">
                         {review.comment}
                       </p>
                    </div>

                    <div className="flex items-center gap-6 pt-2">
                       <button className="font-mono text-[9px] font-black uppercase tracking-widest border border-black px-2 py-1 hover:bg-black hover:text-[#f0ece5] transition-colors">HELPFUL [0]</button>
                       <button className="font-mono text-[9px] font-black uppercase tracking-widest text-black/40 hover:text-black border-b border-transparent hover:border-black transition-colors">REPORT_FLAG</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {reviews.length > 5 && (
               <div className="flex justify-center pt-16">
                  <button className="group px-12 py-4 border border-black bg-white text-black font-mono font-black uppercase tracking-widest text-[10px] hover:bg-black hover:text-[#f0ece5] transition-colors flex items-center gap-3">
                    EXPAND_ARCHIVE <ChevronDown size={14} className="group-hover:translate-y-1 transition-transform" />
                  </button>
               </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
