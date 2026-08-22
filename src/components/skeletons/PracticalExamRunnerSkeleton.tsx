export default function PracticalExamRunnerSkeleton() {
  return (
    <section className="flex flex-col w-full h-full overflow-hidden animate-pulse">
      {/* Top bar */}
      <div className="shrink-0 flex items-center justify-between gap-3 border-b border-zinc-200 bg-white px-4 md:px-6 py-3">
        <div className="h-4 w-20 bg-gray-200 rounded" />
        <div className="hidden sm:block h-4 w-56 bg-gray-200 rounded" />
        <div className="h-8 w-16 bg-gray-200 rounded-lg" />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main column */}
        <div className="flex-1 overflow-y-auto scrollbar-webkit px-2 sm:px-4 py-6">
          <div className="w-full max-w-3xl mx-auto flex flex-col gap-6">
            {/* Equipment / procedure cards */}
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
                <div className="px-5 md:px-6 py-4 border-b border-zinc-100 bg-zinc-50">
                  <div className="h-3 w-40 bg-gray-200 rounded mb-2" />
                  <div className="h-5 w-2/3 bg-gray-200 rounded" />
                </div>
                <div className="p-5 md:p-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[...Array(6)].map((_, j) => (
                    <div key={j} className="h-4 bg-gray-100 rounded w-full" />
                  ))}
                </div>
              </div>
            ))}

            {/* Form cards */}
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
                <div className="px-5 md:px-6 py-4 border-b border-zinc-100 bg-zinc-50">
                  <div className="h-3 w-24 bg-gray-200 rounded mb-2" />
                  <div className="h-5 w-1/2 bg-gray-200 rounded" />
                </div>
                <div className="p-5 md:p-6 flex flex-col gap-4">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="flex flex-col gap-2">
                      <div className="h-3 bg-gray-200 rounded w-3/4" />
                      <div className="h-10 bg-gray-100 rounded-lg w-full" />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="h-12 bg-gray-200 rounded-xl w-full" />
          </div>
        </div>

        {/* Sidebar */}
        <aside className="hidden lg:block w-80 xl:w-96 shrink-0 border-l border-zinc-200 bg-white p-6">
          <div className="h-5 w-40 bg-gray-200 rounded mb-4" />
          <div className="flex flex-col gap-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-100 rounded w-full" />
            ))}
            <div className="h-24 bg-gray-100 rounded-lg w-full mt-2" />
          </div>
        </aside>
      </div>
    </section>
  )
}
