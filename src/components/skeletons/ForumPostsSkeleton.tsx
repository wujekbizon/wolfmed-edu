export default function ForumPostsSkeleton() {
  return (
    <div className="grid gap-6" role="status" aria-label="Wczytywanie postów forum">
      {[0, 1, 2].map((index) => (
        <article
          key={index}
          className="min-h-[232px] animate-pulse rounded-lg bg-zinc-900 p-4 xs:p-6"
        >
          <div className="mb-3 h-6 w-3/5 rounded bg-zinc-800" />
          <div className="space-y-2">
            <div className="h-4 w-full rounded bg-zinc-800/80" />
            <div className="h-4 w-11/12 rounded bg-zinc-800/80" />
            <div className="h-4 w-2/5 rounded bg-zinc-800/80" />
          </div>
          <div className="mb-1 mt-4 flex items-center gap-2">
            <div className="h-4 w-20 rounded bg-red-950/80" />
            <div className="h-4 w-2 rounded bg-red-950/80" />
            <div className="h-4 w-24 rounded bg-red-950/80" />
          </div>
          <div className="mt-1 border-t border-zinc-800 pt-4">
            <div className="flex flex-col-reverse gap-4 xs:flex-row xs:items-center xs:justify-between">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-zinc-800" />
                <div className="h-4 w-24 rounded bg-zinc-800" />
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="h-5 w-32 rounded bg-zinc-800" />
                <div className="h-5 w-5 rounded bg-red-950/70" />
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}
