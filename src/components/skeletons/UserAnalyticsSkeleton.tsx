export default function UserAnalyticsSkeleton() {
  return (
    <div className="bg-gradient-to-br from-white/25 via-white/35 to-white/25 backdrop-blur-xl border border-white/50 rounded-2xl p-6 shadow-lg animate-pulse">
      <div className="flex gap-2 mb-6">
        <div className="h-10 w-24 bg-white/40 rounded-lg" />
        <div className="h-10 w-24 bg-white/40 rounded-lg" />
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-24 bg-white/40 rounded-xl" />
          <div className="h-24 bg-white/40 rounded-xl" />
          <div className="h-24 bg-white/40 rounded-xl" />
        </div>

        <div className="bg-zinc-900 backdrop-blur p-6 rounded-xl border border-zinc-800">
          <div className="h-6 w-48 bg-white/10 rounded mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
            <div className="flex flex-col items-center">
              <div className="h-[120px] w-[120px] rounded-full bg-white/10 mb-5" />
              <div className="h-4 w-32 bg-white/10 rounded mb-2" />
              <div className="h-8 w-16 bg-white/10 rounded" />
            </div>
            <div className="flex flex-col items-center">
              <div className="h-[120px] w-[120px] rounded-full bg-white/10 mb-5" />
              <div className="h-4 w-32 bg-white/10 rounded mb-2" />
              <div className="h-8 w-20 bg-white/10 rounded" />
            </div>
          </div>
          <div className="mt-10">
            <div className="flex justify-between mb-3">
              <div className="h-4 w-32 bg-white/10 rounded" />
              <div className="h-4 w-24 bg-white/10 rounded" />
            </div>
            <div className="h-3 bg-white/10 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
