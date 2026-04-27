"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Star, Loader2 } from "lucide-react";

interface ReviewFormProps {
  slug: string;
  onSuccess: () => void;
}

export default function ReviewForm({ slug, onSuccess }: ReviewFormProps) {
  const { data: session } = useSession();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!session) {
    return (
      <div className="p-12 border border-black border-dashed text-center space-y-6 bg-white relative">
        <div className="absolute top-0 left-0 bg-black text-[#f0ece5] font-mono text-[9px] uppercase tracking-widest px-2 py-0.5">SYS_AUTH</div>
        <p className="font-mono text-[10px] font-black uppercase tracking-widest text-black/60 pt-4">AUTH_REQUIRED: CANNOT POST REVIEW LOG</p>
        <button 
          onClick={() => window.location.href = '/login'}
          className="px-8 py-4 border border-black bg-black text-[#f0ece5] font-mono font-black uppercase tracking-widest text-[9px] hover:bg-white hover:text-black transition-colors"
        >
          INITIATE_AUTH_SEQUENCE
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a rating.");
      return;
    }
    if (comment.length < 10) {
      setError("Comment must be at least 10 characters.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/store/products/${slug}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating, comment }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Submission failed");
      }

      setRating(0);
      setComment("");
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-10 border border-black bg-[#f0ece5] relative">
      <div className="absolute top-0 left-0 bg-black text-[#f0ece5] font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 border-b border-r border-black">NEW_ENTRY_FORM</div>
      
      <h3 className="font-display font-black text-4xl uppercase tracking-tight mb-8 mt-4">
        LOG_FEEDBACK
      </h3>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Star Rating */}
        <div className="space-y-4">
          <label className="font-mono text-[10px] font-black uppercase tracking-widest block border-b border-black/20 pb-2">SELECT_GRADE: [{rating || hoverRating || '—'}]</label>
          <div className="flex gap-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="transition-transform"
              >
                <Star
                  size={32}
                  className={`transition-all ${
                    star <= (hoverRating || rating)
                      ? "fill-black text-black"
                      : "text-black/10 hover:text-black/30"
                  }`}
                  strokeWidth={2}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Comment */}
        <div className="space-y-4">
          <label className="font-mono text-[10px] font-black uppercase tracking-widest block border-b border-black/20 pb-2">SYS_MANIFESTO_COMMENT</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="DOCUMENT YOUR EXPERIENCE WITH THIS ARCHIVAL PIECE..."
            className="w-full h-40 bg-white border border-black p-6 font-mono font-medium text-[10px] uppercase tracking-widest focus:outline-none focus:bg-[#f0ece5] transition-colors placeholder:text-black/20"
          />
        </div>

        {error && (
          <p className="font-mono text-[10px] font-black uppercase tracking-widest text-red-600 bg-red-50 p-4 border border-red-600">
            SYS_ERROR: {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-16 border border-black bg-black text-[#f0ece5] flex items-center justify-center gap-4 font-mono font-black uppercase tracking-widest text-[10px] hover:bg-white hover:text-black transition-colors disabled:opacity-50"
        >
          {isSubmitting ? (
            <>PROCESSING_DATA <Loader2 className="animate-spin" size={14} /></>
          ) : (
            <>COMMIT_TO_ARCHIVE</>
          )}
        </button>
      </form>
    </div>
  );
}
