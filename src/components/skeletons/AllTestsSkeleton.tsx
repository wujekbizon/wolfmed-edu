export default function AllTestsSkeleton() {
  return (
    <section className="flex flex-col items-center w-full h-full animate-pulse">
      {/* Search bar skeleton */}
      <div className="w-full md:w-[85%] lg:w-3/4 xl:w-2/3 2xl:w-[60%] pb-4">
        <div className="bg-white rounded-lg shadow-md p-4 border border-zinc-200">
          <div className="h-10 bg-zinc-200 rounded" />
        </div>
      </div>

      {/* Tests list skeleton */}
      <div className="w-full md:w-[85%] lg:w-3/4 xl:w-2/3 2xl:w-[60%] space-y-4">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow-md p-6 border border-zinc-200"
          >
            {/* Question skeleton */}
            <div className="space-y-3 mb-4">
              <div className="h-5 bg-zinc-200 rounded w-3/4" />
              <div className="h-5 bg-zinc-200 rounded w-full" />
              <div className="h-5 bg-zinc-200 rounded w-2/3" />
            </div>

            {/* Answers skeleton */}
            <div className="space-y-2">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-zinc-200 rounded-full" />
                  <div className="h-4 bg-zinc-200 rounded flex-1" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
