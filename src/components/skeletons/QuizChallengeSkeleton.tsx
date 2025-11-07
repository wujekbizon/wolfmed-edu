export default function QuizChallengeSkeleton() {
  return (
    <section className="flex flex-col items-center gap-8 px-4 sm:px-6 py-8 w-full h-full overflow-y-auto scrollbar-webkit bg-gradient-to-br from-zinc-50 via-white to-zinc-50">
      <div className="w-full md:w-[85%] lg:w-3/4 xl:w-2/3 2xl:w-[60%] bg-white p-8 rounded-xl shadow-lg border border-zinc-200">
        {/* Header Skeleton */}
        <div className="h-8 w-32 bg-zinc-200 rounded animate-pulse mb-2" />
        <div className="h-6 w-48 bg-zinc-200 rounded animate-pulse mb-6" />

        {/* Progress Skeleton */}
        <div className="mb-8">
          <div className="h-2 w-full bg-zinc-200 rounded-full mb-4 animate-pulse" />
          <div className="flex gap-2 mb-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex-1 h-2 bg-zinc-200 rounded-full animate-pulse" />
            ))}
          </div>
          <div className="h-4 w-40 bg-zinc-200 rounded mx-auto animate-pulse" />
        </div>

        {/* Questions Skeleton */}
        <div className="space-y-6 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-6 rounded-lg border-2 border-zinc-200">
              <div className="flex gap-3 mb-5">
                <div className="w-8 h-8 bg-zinc-200 rounded-full animate-pulse" />
                <div className="flex-1 h-6 bg-zinc-200 rounded animate-pulse" />
              </div>
              <div className="space-y-3 pl-11">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="flex gap-4 p-4 border-2 border-zinc-200 rounded-lg">
                    <div className="w-6 h-6 bg-zinc-200 rounded-full animate-pulse" />
                    <div className="w-7 h-7 bg-zinc-200 rounded-md animate-pulse" />
                    <div className="flex-1 h-5 bg-zinc-200 rounded animate-pulse" />
                  </div>
                ))}
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
