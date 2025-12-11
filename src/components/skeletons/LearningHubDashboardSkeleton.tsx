export default function LearningHubDashboardSkeleton() {
  return (
    <div className="w-full space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div>
        <div className="h-9 w-64 bg-zinc-200 rounded mb-2" />
        <div className="h-5 w-96 bg-zinc-200 rounded" />
      </div>

      {/* CategoryGrid skeleton - "Dostępne Testy" */}
      <div className="bg-white p-6 rounded-2xl shadow-xl border border-zinc-200/60">
        <div className="h-7 w-48 bg-zinc-200 rounded mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 bg-zinc-200 rounded-xl" />
          ))}
        </div>
      </div>

      {/* CellList skeleton with premium lock overlay */}
      <div className="relative">
        <div className="absolute inset-0 bg-linear-to-t from-zinc-100/90 via-zinc-100/60 to-transparent z-10 rounded-2xl" />
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-zinc-200/60 opacity-30">
          <div className="h-7 w-48 bg-zinc-200 rounded mb-4" />
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-zinc-200 rounded-lg" />
            ))}
          </div>
        </div>
      </div>

      {/* NotesSection skeleton with premium lock overlay */}
      <div className="relative">
        <div className="absolute inset-0 bg-linear-to-t from-zinc-100/90 via-zinc-100/60 to-transparent z-10 rounded-2xl" />
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-zinc-200/60 opacity-30">
          <div className="h-7 w-48 bg-zinc-200 rounded mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-zinc-200 rounded-lg" />
            ))}
          </div>
        </div>
      </div>

      {/* MaterialsSection skeleton */}
      <div className="bg-white p-6 rounded-2xl shadow-xl border border-zinc-200/60">
        <div className="h-7 w-48 bg-zinc-200 rounded mb-4" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-zinc-200 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  )
}
