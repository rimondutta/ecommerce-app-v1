'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
      <div className="space-y-6 max-w-md">
        <h1 className="text-8xl font-black tracking-tighter uppercase italic opacity-10">Error</h1>
        <h2 className="text-2xl font-bold uppercase tracking-widest">Something went wrong</h2>
        <p className="text-black/50 text-sm leading-relaxed">
          An unexpected error occurred. We have been notified and are working to fix it.
          Please try refreshing the page or head back to the shop.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <button
            onClick={() => reset()}
            className="px-8 py-4 bg-black text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-neutral-800 transition-all"
          >
            Try Again
          </button>
          <Link
            href="/products"
            className="px-8 py-4 border border-black text-black text-[10px] font-black uppercase tracking-[0.3em] hover:bg-black hover:text-white transition-all"
          >
            Back to Shop
          </Link>
        </div>
      </div>
    </div>
  );
}
