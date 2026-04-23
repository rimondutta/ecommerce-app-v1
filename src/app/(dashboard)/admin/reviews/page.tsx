"use client"

export default function AdminReviewsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-black uppercase tracking-tight">Reviews Moderation</h1>
      </div>

      <div className="bg-white border-4 border-black p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center text-center space-y-4">
        <h2 className="text-xl font-bold uppercase tracking-widest text-gray-400">0 Pending Reviews</h2>
        <p className="text-sm font-bold text-gray-500 max-w-md">No customer reviews require moderation at this time.</p>
      </div>
    </div>
  )
}
