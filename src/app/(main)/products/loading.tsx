export default function ShopLoading() {
  return (
    <div className="bg-joy-cream min-h-screen pt-32 lg:pt-36 pb-20 animate-pulse font-body">
      {/* Header */}
      <div className="px-4 sm:px-8 lg:px-[5vw] py-5 flex items-end justify-between border-b border-joy-rule">
        <div className="h-10 w-44 bg-black/10 rounded-xl" />
        <div className="h-5 w-24 bg-black/10 rounded-md" />
      </div>

      {/* Filter pills bar */}
      <div className="px-4 sm:px-8 lg:px-[5vw] py-4 flex items-center gap-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-9 w-24 bg-black/10 rounded-xl" />
        ))}
      </div>

      {/* Content Layout */}
      <div className="px-4 sm:px-8 lg:px-[5vw] py-10 flex flex-col lg:flex-row gap-10">
        {/* Sidebar skeleton */}
        <aside className="hidden lg:block w-56 shrink-0 space-y-6">
          <div className="bg-white border border-joy-rule rounded-2xl p-6 space-y-4">
            <div className="h-4 w-20 bg-black/10 rounded" />
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-6 w-full bg-black/5 rounded-md" />
              ))}
            </div>
            <div className="h-[1px] bg-joy-rule my-4" />
            <div className="h-4 w-24 bg-black/10 rounded" />
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-6 w-full bg-black/5 rounded-md" />
              ))}
            </div>
          </div>
        </aside>

        {/* Product Grid skeleton */}
        <div className="flex-1 grid grid-cols-2 lg:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-8 sm:gap-y-12">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-[20px] overflow-hidden">
              <div className="aspect-[4/5] bg-black/10 w-full" />
              <div className="p-4 space-y-3">
                <div className="h-4 w-3/4 bg-black/10 rounded" />
                <div className="h-4 w-1/2 bg-black/10 rounded" />
                <div className="flex justify-between items-center pt-2">
                  <div className="h-5 w-16 bg-black/15 rounded" />
                  <div className="h-8 w-24 bg-black/10 rounded-xl" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
