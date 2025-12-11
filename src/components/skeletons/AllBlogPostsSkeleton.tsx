export default function AllBlogPostsSkeleton() {
  return (
    <div className="min-h-screen w-full relative bg-[#1F1F2D]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(187,134,252,0.04),transparent_50%)]" />

      <div className="relative z-10 pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero skeleton */}
          <div className="mb-16 text-center animate-pulse">
            <div className="h-16 w-96 bg-zinc-700/30 rounded-lg mx-auto mb-4" />
            <div className="h-6 w-lg bg-zinc-700/20 rounded-lg mx-auto" />
          </div>

          {/* Search and sort skeleton */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8 animate-pulse">
            <div className="flex-1 h-12 bg-zinc-700/30 rounded-xl" />
            <div className="w-48 h-12 bg-zinc-700/30 rounded-xl" />
          </div>

          {/* Blog posts skeleton */}
          <div className="w-full flex flex-col gap-6">
            {[...Array(3)].map((_, i) => (
              <article
                key={i}
                className="bg-[#2A2A3F]/40 rounded-2xl shadow-lg border border-[#3A3A5A]/30 overflow-hidden min-h-[340px] animate-pulse"
              >
                <div className="flex flex-col sm:flex-row gap-0 sm:gap-6 h-full">
                  <div className="relative w-full sm:w-80 h-64 sm:h-auto shrink-0 bg-zinc-700/30" />

                  <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between min-h-[350px]">
                    <div className="space-y-3 flex-1">
                      <div className="h-8 w-3/4 bg-zinc-700/30 rounded" />
                      <div className="h-4 w-full bg-zinc-700/20 rounded" />
                      <div className="h-4 w-5/6 bg-zinc-700/20 rounded" />
                      <div className="h-4 w-4/6 bg-zinc-700/20 rounded" />
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-[#3A3A5A]/30">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-700/30" />
                        <div className="h-4 w-24 bg-zinc-700/20 rounded" />
                        <div className="h-4 w-20 bg-zinc-700/20 rounded" />
                      </div>
                      <div className="h-10 w-32 bg-zinc-700/30 rounded-full" />
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
