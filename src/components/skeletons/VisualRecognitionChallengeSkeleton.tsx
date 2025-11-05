export default function VisualRecognitionChallengeSkeleton() {
  return (
    <section className="flex flex-col items-center gap-8 px-4 sm:px-6 py-8 w-full h-full overflow-y-auto scrollbar-webkit bg-gradient-to-br from-zinc-50 via-white to-zinc-50">
      <div className="w-full md:w-[85%] lg:w-3/4 xl:w-2/3 2xl:w-[60%] bg-white rounded-xl shadow-lg border border-zinc-200 overflow-hidden">
        {/* Header Skeleton */}
        <div className="bg-gradient-to-r from-zinc-800 to-zinc-900 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-7 h-7 bg-zinc-700 rounded-full animate-pulse" />
            <div className="h-8 w-56 bg-zinc-700 rounded animate-pulse" />
          </div>
          <div className="h-4 w-64 bg-zinc-700 rounded animate-pulse" />
        </div>

        {/* Content Skeleton */}
        <div className="p-6 sm:p-8">
          {/* Image Skeleton */}
          <div className="mb-8">
            <div className="w-full aspect-video bg-zinc-200 rounded-xl animate-pulse" />
          </div>

          {/* Question Skeleton */}
          <div className="mb-6 p-4 bg-zinc-100 border-l-4 border-zinc-300 rounded-r-lg">
            <div className="h-6 w-full bg-zinc-200 rounded animate-pulse" />
          </div>

          {/* Options Skeleton */}
          <div className="space-y-3 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-4 p-5 border-2 border-zinc-200 rounded-lg">
                <div className="w-6 h-6 bg-zinc-200 rounded-full animate-pulse" />
                <div className="w-9 h-9 bg-zinc-200 rounded-lg animate-pulse" />
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
      </div>
    </section>
  )
}
