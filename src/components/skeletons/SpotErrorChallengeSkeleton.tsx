export default function SpotErrorChallengeSkeleton() {
  return (
    <section className="flex flex-col items-center gap-8 px-4 sm:px-6 py-8 w-full h-full overflow-y-auto scrollbar-webkit bg-gradient-to-br from-zinc-50 via-white to-zinc-50">
      <div className="w-full md:w-[85%] lg:w-3/4 xl:w-2/3 2xl:w-[60%] bg-white p-8 rounded-xl shadow-lg border border-zinc-200">
        {/* Header Skeleton */}
        <div className="h-8 w-40 bg-zinc-200 rounded animate-pulse mb-2" />
        <div className="h-6 w-48 bg-zinc-200 rounded animate-pulse mb-3" />

        {/* Error Counter Skeleton */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-300 bg-zinc-100 mb-6">
          <div className="h-4 w-32 bg-zinc-200 rounded animate-pulse" />
        </div>

        {/* Instruction Skeleton */}
        <div className="mb-6 p-4 bg-zinc-100 border-l-4 border-zinc-300 rounded-r-lg">
          <div className="h-5 w-full bg-zinc-200 rounded animate-pulse mb-2" />
          <div className="h-5 w-3/4 bg-zinc-200 rounded animate-pulse" />
        </div>

        {/* Steps Skeleton */}
        <div className="space-y-3 mb-8">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white p-5 rounded-lg border-2 border-zinc-200">
              <div className="flex items-start gap-4">
                <div className="w-7 h-7 bg-zinc-200 rounded-md animate-pulse" />
                <div className="w-8 h-8 bg-zinc-200 rounded-full animate-pulse" />
                <div className="flex-1 h-5 bg-zinc-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>

        {/* Buttons Skeleton */}
        <div className="flex gap-4">
          <div className="flex-1 h-12 bg-zinc-200 rounded-lg animate-pulse" />
          <div className="h-12 w-32 bg-zinc-200 rounded-lg animate-pulse" />
        </div>
      </div>
    </section>
  )
}
