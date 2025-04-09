export function RoomsLoadingState() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 animate-pulse"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <div className="h-5 w-32 bg-zinc-700 rounded" />
              <div className="h-4 w-24 bg-zinc-700 rounded" />
            </div>
            <div className="h-6 w-20 bg-zinc-700 rounded" />
          </div>
          <div className="mt-4 space-y-3">
            <div className="flex gap-2">
              <div className="h-6 w-24 bg-zinc-700 rounded" />
              <div className="h-6 w-24 bg-zinc-700 rounded" />
            </div>
            <div className="h-24 w-full bg-zinc-700/50 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
} 