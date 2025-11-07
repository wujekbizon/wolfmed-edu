export default function BadgeWidgetSkeleton() {
  return (
    <section className="relative w-full">
      {/* Main Card Container */}
      <div className="bg-white border border-zinc-200/50 rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <div className="h-6 w-32 bg-zinc-200 rounded-lg animate-pulse" />
          <div className="h-6 w-8 bg-zinc-200 rounded-full animate-pulse" />
        </header>

        {/* Badge Grid Skeleton */}
        <div className="max-h-[400px] overflow-y-auto scrollbar-webkit pr-2">
          <div className="grid grid-cols-3 xs:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4 xs:gap-[18px] md:gap-5 xl:gap-6 justify-items-center items-start">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="flex flex-col items-center gap-2">
                {/* Badge Image Skeleton */}
                <div className="relative w-12 h-12 rounded-xl bg-zinc-200 animate-pulse" />
                {/* Badge Name Skeleton */}
                <div className="w-16 h-3 bg-zinc-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
