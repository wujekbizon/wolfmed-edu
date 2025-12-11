export default function LearningHubDashboardSkeleton() {
  return (
    <div className="w-full space-y-8 animate-pulse">
      <div>
        <div className="h-9 w-64 bg-zinc-200 rounded mb-2" />
        <div className="h-5 w-96 bg-zinc-200 rounded" />
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-xl border border-zinc-200/60">
        <div className="h-7 w-48 bg-zinc-200 rounded mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 bg-zinc-200 rounded-xl" />
          ))}
        </div>
      </div>
      <div className="h-64 bg-white p-6 rounded-2xl shadow-xl border border-zinc-200/60" />
      <div className="h-64 bg-white p-6 rounded-2xl shadow-xl border border-zinc-200/60" />
      <div className="h-64 bg-white p-6 rounded-2xl shadow-xl border border-zinc-200/60" />
    </div>
  )
}
