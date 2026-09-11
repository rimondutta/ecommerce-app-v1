"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Star, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface ReviewFormProps {
  slug: string;
  onSuccess: () => void;
}

export default function ReviewForm({ slug, onSuccess }: ReviewFormProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!session) {
    return (
      <div className="p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-2">
          <Star className="text-zinc-400" size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-zinc-900 mb-2">Sign in to review</h3>
          <p className="text-sm text-zinc-500">You must be logged in to share your feedback.</p>
        </div>
        <button 
          onClick={() => router.push('/login')}
          className="w-full py-4 bg-zinc-900 text-white rounded-xl font-bold text-sm hover:bg-zinc-800 transition-colors"
        >
          Sign In
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
      setError("Please write a longer review (at least 10 characters).");
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
    <div className="p-2 sm:p-4">
      <h3 className="text-2xl font-bold text-zinc-900 mb-8">
        Write a Review
      </h3>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Star Rating */}
        <div className="space-y-4">
          <label className="text-sm font-semibold text-zinc-900 block">Rating</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="transition-transform active:scale-90 p-1"
              >
                <Star
                  size={32}
                  className={`transition-colors duration-200 ${
                    star <= (hoverRating || rating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-zinc-200 fill-zinc-100 hover:text-zinc-300 hover:fill-zinc-200"
                  }`}
                  strokeWidth={1.5}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Comment */}
        <div className="space-y-4">
          <label className="text-sm font-semibold text-zinc-900 block">Review</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us what you think about this product..."
            className="w-full h-32 bg-zinc-50 border border-zinc-200 rounded-xl p-4 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all placeholder:text-zinc-400 resize-none"
          />
        </div>

        {error && (
          <p className="text-sm font-medium text-rose-600 bg-rose-50 p-3 rounded-lg border border-rose-100">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 bg-zinc-900 text-white rounded-xl font-bold text-sm hover:bg-zinc-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-md"
        >
          {isSubmitting ? (
            <>Submitting... <Loader2 className="animate-spin" size={16} /></>
          ) : (
            <>Submit Review</>
          )}
        </button>
      </form>
    </div>
  );
}
