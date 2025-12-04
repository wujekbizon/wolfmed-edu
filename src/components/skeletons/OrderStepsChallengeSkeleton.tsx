export default function OrderStepsChallengeSkeleton() {
  return (
    <section className="flex flex-col items-center gap-8 px-4 sm:px-6 py-8 md:py-10 w-full h-full overflow-y-auto scrollbar-webkit bg-gradient-to-br from-zinc-50 via-white to-zinc-50">
      <div className="w-full md:w-[85%] lg:w-3/4 xl:w-2/3 2xl:w-[55%] bg-white p-6 md:p-8 lg:p-10 rounded-xl shadow-xl border border-zinc-200">
        {/* Header Skeleton */}
        <div className="mb-6 space-y-3">
          <div className="h-8 w-56 bg-zinc-200 rounded animate-pulse" />
          <div className="h-6 w-64 bg-zinc-200 rounded animate-pulse" />
          <div className="bg-zinc-100/80 border-l-4 border-zinc-300 rounded-md p-4">
            <div className="h-5 w-full bg-zinc-200 rounded animate-pulse" />
          </div>
        </div>

        {/* Steps Skeleton */}
        <div className="mb-8 flex flex-col gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="bg-white border-2 border-zinc-200 rounded-lg p-4 sm:p-5 lg:p-6 min-h-[80px] flex flex-col items-center justify-center"
            >
              <div className="w-10 h-1 bg-zinc-200 rounded-full mb-3 animate-pulse" />
              <div className="h-5 w-3/4 bg-zinc-200 rounded animate-pulse" />
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
