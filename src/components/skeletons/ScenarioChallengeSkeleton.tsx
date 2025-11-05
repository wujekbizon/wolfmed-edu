export default function ScenarioChallengeSkeleton() {
  return (
    <section className="flex flex-col items-center gap-8 px-4 sm:px-6 py-8 w-full h-full overflow-y-auto scrollbar-webkit bg-gradient-to-br from-zinc-50 via-white to-zinc-50">
      <div className="w-full md:w-[85%] lg:w-3/4 xl:w-2/3 2xl:w-[60%] bg-white p-8 rounded-xl shadow-lg border border-zinc-200">
        {/* Header Skeleton */}
        <div className="mb-6">
          <div className="h-8 w-48 bg-zinc-200 rounded animate-pulse mb-2" />
          <div className="h-6 w-56 bg-zinc-200 rounded animate-pulse" />
        </div>

        {/* Scenario Card Skeleton */}
        <div className="mb-8">
          <div className="relative bg-gradient-to-br from-white to-zinc-50 p-6 sm:p-8 rounded-xl border-2 border-zinc-200">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-zinc-700 via-zinc-800 to-zinc-900" />

            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 bg-zinc-200 rounded-lg animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-zinc-200 rounded animate-pulse" />
                <div className="h-5 w-full bg-zinc-200 rounded animate-pulse" />
                <div className="h-5 w-5/6 bg-zinc-200 rounded animate-pulse" />
              </div>
            </div>
          </div>

          {/* Question Skeleton */}
          <div className="mt-6 p-4 bg-zinc-100 border-l-4 border-zinc-300 rounded-r-lg">
            <div className="h-6 w-full bg-zinc-200 rounded animate-pulse mb-2" />
            <div className="h-6 w-3/4 bg-zinc-200 rounded animate-pulse" />
          </div>
        </div>

        {/* Options Skeleton */}
        <div className="space-y-3 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-4 p-5 border-2 border-zinc-200 rounded-lg">
              <div className="w-6 h-6 bg-zinc-200 rounded-full animate-pulse" />
              <div className="w-8 h-8 bg-zinc-200 rounded-md animate-pulse" />
              <div className="flex-1 h-5 bg-zinc-200 rounded animate-pulse" />
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
