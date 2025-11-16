export default function PinnedNotesFeatureSkeleton() {
  return (
    <div className="p-6 max-h-[70vh]">
      <div className="h-6 w-48 bg-zinc-200/60 rounded animate-pulse mb-4" />

      <div className="grid grid-cols-1 gap-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-4 bg-white/60 rounded-lg border border-zinc-200/40"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="h-6 w-20 bg-zinc-200/60 rounded-full animate-pulse" />
            </div>
            <div className="h-4 w-full bg-zinc-200/60 rounded animate-pulse mb-2" />
            <div className="h-4 w-3/4 bg-zinc-200/60 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
