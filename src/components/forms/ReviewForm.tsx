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
      <div className="p-12 border-4 border-black border-dashed text-center space-y-6">
        <p className="font-black uppercase tracking-[0.2em] text-[10px]">Authorization Required to Post Reviews</p>
        <button 
          onClick={() => window.location.href = '/login'}
          className="px-8 py-4 bg-black text-white font-black uppercase tracking-widest text-[9px] hover:bg-neutral-800 transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)]"
        >
          Sign In to Access Reviews
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
    <div className="p-10 border-4 border-black bg-neutral-50 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]">
      <h3 className="font-display font-black text-4xl uppercase tracking-tight mb-8">
        Submit Feedback
      </h3>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Star Rating */}
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-[0.3em] block">Select Grade / {rating || hoverRating || '—'}</label>
          <div className="flex gap-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="transition-transform active:scale-95"
              >
                <Star
                  size={32}
                  className={`transition-all ${
                    star <= (hoverRating || rating)
                      ? "fill-black text-black"
                      : "text-black/10"
                  }`}
                  strokeWidth={3}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Comment */}
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-[0.3em] block">Manifesto / Comment</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Document your experience with this archival piece..."
            className="w-full h-40 bg-white border-4 border-black p-6 font-medium text-[12px] uppercase tracking-wide focus:outline-none focus:shadow-[8px_8px_0px_1px_rgba(0,0,0,1)] transition-all placeholder:text-black/20"
          />
        </div>

        {error && (
          <p className="text-[10px] font-black uppercase tracking-widest text-red-600 bg-red-50 p-4 border-2 border-red-600">
            Error: {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-20 bg-black text-white flex items-center justify-center gap-4 font-black uppercase tracking-[0.4em] text-[10px] hover:bg-neutral-800 transition-all disabled:opacity-50"
        >
          {isSubmitting ? (
            <>Processing Data <Loader2 className="animate-spin" size={16} /></>
          ) : (
            <>Post Review to Collection</>
          )}
        </button>
      </form>
    </div>
  );
}
