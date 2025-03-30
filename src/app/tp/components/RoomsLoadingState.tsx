export function RoomsLoadingState() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="block bg-zinc-800/50 rounded-lg border border-zinc-700 animate-pulse"
        >
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <div className="h-5 w-32 bg-zinc-700 rounded"></div>
                <div className="h-4 w-24 bg-zinc-700 rounded"></div>
              </div>
              <div className="h-6 w-20 bg-zinc-700 rounded-full"></div>
            </div>
            <div className="mt-4 flex gap-2">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="h-5 w-5 bg-zinc-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
} 