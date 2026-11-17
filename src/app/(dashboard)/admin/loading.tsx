export default function AdminLoading() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10 animate-pulse">
      {/* Header skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="h-7 w-40 bg-gray-200 rounded-lg" />
          <div className="h-4 w-60 bg-gray-100 rounded-md mt-2" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-9 w-28 bg-gray-200 rounded-md" />
          <div className="h-9 w-32 bg-gray-200 rounded-md" />
        </div>
      </div>

      {/* Stats Grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 bg-gray-200 rounded" />
              <div className="w-8 h-8 rounded-md bg-gray-100" />
            </div>
            <div className="h-8 w-28 bg-gray-200 rounded" />
          </div>
        ))}
      </div>

      {/* Main Content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="h-6 w-36 bg-gray-200 rounded" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-50 rounded-lg border border-gray-100" />
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="h-6 w-32 bg-gray-200 rounded" />
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-14 bg-gray-50 rounded-lg border border-gray-100" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
