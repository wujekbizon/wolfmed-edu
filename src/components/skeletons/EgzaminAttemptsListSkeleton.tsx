export default function EgzaminAttemptsListSkeleton() {
  return (
    <div className="mt-10 animate-pulse">
      <div className="h-4 w-40 rounded bg-zinc-200 mb-3" />
      <div className="flex flex-col gap-2">
        {[...Array(3)].map((_, index) => (
          <div
            key={index}
            className="flex items-center justify-between gap-3 bg-white border border-zinc-200 rounded-xl px-4 py-3"
          >
            <div className="min-w-0 flex-1">
              <div className="h-4 w-3/5 rounded bg-zinc-200 mb-2" />
              <div className="h-3 w-2/5 rounded bg-zinc-200" />
            </div>
            <div className="h-6 w-12 rounded-full bg-zinc-200 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}
