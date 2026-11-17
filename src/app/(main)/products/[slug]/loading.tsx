export default function ProductDetailLoading() {
  return (
    <div className="bg-joy-cream min-h-screen pt-32 pb-20 animate-pulse font-body">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-[5vw]">
        {/* Breadcrumb skeleton */}
        <div className="flex items-center gap-2 mb-8">
          <div className="h-4 w-12 bg-black/10 rounded" />
          <span className="text-black/20">/</span>
          <div className="h-4 w-16 bg-black/10 rounded" />
          <span className="text-black/20">/</span>
          <div className="h-4 w-32 bg-black/10 rounded" />
        </div>

        {/* Product Details Grid */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 xl:gap-24">
          {/* Gallery skeleton */}
          <div className="w-full lg:w-7/12 flex flex-col md:flex-row gap-4">
            <div className="hidden md:flex flex-col gap-2 w-[72px] shrink-0">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-[72px] h-[72px] bg-black/10 rounded-xl" />
              ))}
            </div>
            <div className="flex-1 aspect-square md:aspect-[4/5] bg-black/10 rounded-3xl" />
          </div>

          {/* Info skeleton */}
          <div className="w-full lg:w-5/12 space-y-6">
            <div className="h-4 w-24 bg-black/10 rounded" />
            <div className="h-10 w-3/4 bg-black/15 rounded-xl" />
            <div className="h-6 w-32 bg-black/10 rounded-lg" />
            <div className="h-8 w-40 bg-black/15 rounded-lg" />

            <div className="h-[1px] bg-black/10 my-6" />

            {/* Variants skeleton */}
            <div className="space-y-3">
              <div className="h-4 w-20 bg-black/10 rounded" />
              <div className="flex gap-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-10 w-20 bg-black/10 rounded-xl" />
                ))}
              </div>
            </div>

            {/* Buttons skeleton */}
            <div className="space-y-3 pt-4">
              <div className="h-14 w-full bg-black/20 rounded-xl" />
              <div className="h-14 w-full bg-black/15 rounded-xl" />
              <div className="h-12 w-full bg-black/10 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
