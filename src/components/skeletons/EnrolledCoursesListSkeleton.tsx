export default function EnrolledCoursesListSkeleton() {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-2 h-9 w-48 bg-zinc-200 rounded animate-pulse" />
        <div className="mb-8 h-6 w-64 bg-zinc-200 rounded animate-pulse" />
  
        <div className="grid grid-cols-1 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-xl border border-zinc-200/60 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="h-8 w-64 bg-zinc-200 rounded animate-pulse mb-2" />
                    <div className="h-5 w-96 bg-zinc-200 rounded animate-pulse" />
                  </div>
                  <div className="h-6 w-16 bg-zinc-200 rounded-full animate-pulse" />
                </div>
  
                <div className="mt-6">
                  <div className="h-6 w-40 bg-zinc-200 rounded animate-pulse mb-3" />
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[1, 2, 3, 4, 5, 6].map((j) => (
                      <div
                        key={j}
                        className="p-4 bg-zinc-50 rounded-xl border border-zinc-200"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-zinc-200 rounded-lg animate-pulse" />
                          <div className="flex-1 min-w-0">
                            <div className="h-5 w-32 bg-zinc-200 rounded animate-pulse mb-2" />
                            <div className="h-4 w-24 bg-zinc-200 rounded animate-pulse" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
  
                <div className="mt-4 pt-4 border-t border-zinc-200">
                  <div className="h-4 w-48 bg-zinc-200 rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }