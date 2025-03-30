export function RoomLoadingState() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
      {/* Video Player Placeholder */}
      <div className="lg:col-span-2 bg-zinc-800/50 rounded-lg animate-pulse">
        <div className="aspect-video w-full bg-zinc-700/50 rounded-t-lg" />
        <div className="p-4 space-y-3">
          <div className="h-6 w-48 bg-zinc-700 rounded" />
          <div className="flex gap-2">
            <div className="h-8 w-8 bg-zinc-700 rounded" />
            <div className="h-8 w-8 bg-zinc-700 rounded" />
            <div className="h-8 w-8 bg-zinc-700 rounded" />
          </div>
        </div>
      </div>

      {/* Sidebar with Chat and Participants */}
      <div className="space-y-6">
        {/* Chat Placeholder */}
        <div className="bg-zinc-800/50 rounded-lg h-96 animate-pulse p-4 space-y-4">
          <div className="h-6 w-32 bg-zinc-700 rounded" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="h-8 w-8 bg-zinc-700 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-24 bg-zinc-700 rounded" />
                  <div className="h-4 w-48 bg-zinc-700 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Participants Placeholder */}
        <div className="bg-zinc-800/50 rounded-lg animate-pulse p-4 space-y-4">
          <div className="h-6 w-32 bg-zinc-700 rounded" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-8 w-8 bg-zinc-700 rounded-full" />
                <div className="h-4 w-32 bg-zinc-700 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 