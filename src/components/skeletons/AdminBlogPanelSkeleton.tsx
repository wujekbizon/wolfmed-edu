export default function AdminBlogPanelSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div>
        <div className="h-9 w-48 bg-zinc-200 rounded" />
        <div className="h-5 w-96 bg-zinc-200 rounded mt-2" />
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-zinc-200">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-4 w-24 bg-zinc-200 rounded" />
                <div className="h-8 w-16 bg-zinc-200 rounded mt-2" />
              </div>
              <div className="w-12 h-12 bg-zinc-200 rounded-lg" />
            </div>
            <div className="mt-4 flex items-center gap-4">
              <div className="h-4 w-20 bg-zinc-200 rounded" />
              <div className="h-4 w-16 bg-zinc-200 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Recent Posts Skeleton */}
      <div className="bg-white rounded-lg shadow-sm border border-zinc-200">
        <div className="p-6 border-b border-zinc-200">
          <div className="flex items-center justify-between">
            <div className="h-6 w-32 bg-zinc-200 rounded" />
            <div className="h-4 w-32 bg-zinc-200 rounded" />
          </div>
        </div>
        <div className="divide-y divide-zinc-200">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-5 w-24 bg-zinc-200 rounded-full" />
                    <div className="h-4 w-32 bg-zinc-200 rounded" />
                  </div>
                  <div className="h-6 w-3/4 bg-zinc-200 rounded mb-2" />
                  <div className="h-4 w-full bg-zinc-200 rounded" />
                  <div className="flex items-center gap-4 mt-3">
                    <div className="h-4 w-24 bg-zinc-200 rounded" />
                    <div className="h-4 w-16 bg-zinc-200 rounded" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="h-9 w-20 bg-zinc-200 rounded" />
                  <div className="h-9 w-20 bg-zinc-200 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-zinc-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-zinc-200 rounded-lg" />
              <div className="flex-1">
                <div className="h-5 w-24 bg-zinc-200 rounded mb-2" />
                <div className="h-4 w-full bg-zinc-200 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
