export default function TestimonialsCarouselSkeleton({ count = 3 }: { count?: number }) {
    return (
      <div className="relative w-full animate-pulse">
        <div className="overflow-hidden">
          <div className="flex select-none">
            {Array.from({ length: count }).map((_, idx) => (
              <div
                key={idx}
                className="flex-shrink-0 flex-[0_0_100%] w-full px-2 sm:px-4"
                aria-roledescription="slide"
                aria-label={`Slide ${idx + 1} z ${count}`}
              >
                <figure className="relative rounded-2xl border border-white/10 bg-zinc-900 p-8 sm:p-10 shadow-md backdrop-blur-md">
                  <div className="flex flex-col gap-4">
                    <div className="h-4 sm:h-5 bg-zinc-700 rounded w-3/4" />
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-white/10 ring-1 ring-white/20" />
                        <div className="flex flex-col gap-1">
                          <div className="h-3 w-20 bg-zinc-700 rounded" />
                          <div className="h-2 w-12 bg-zinc-700 rounded" />
                        </div>
                      </div>
                      <div className="h-4 w-16 bg-zinc-700 rounded" />
                    </div>
                  </div>
                </figure>
              </div>
            ))}
          </div>
        </div>
  
        <div className="mt-4 flex items-center justify-center gap-4">
          <div className="h-9 w-9 rounded-full bg-zinc-700" />
          <div className="flex items-center gap-2">
            {Array.from({ length: count }).map((_, i) => (
              <div
                key={i}
                className="h-2.5 w-2.5 rounded-full border border-zinc-400 bg-zinc-700"
              />
            ))}
          </div>
        </div>
      </div>
    )
  }
  