export default function DiagnozyBrowserSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1">
          <div className="h-7 w-64 rounded-lg bg-zinc-200 mb-3" />
          <div className="h-4 w-full max-w-2xl rounded bg-zinc-200 mb-2" />
          <div className="h-4 w-3/4 max-w-xl rounded bg-zinc-200" />
        </div>
        <div className="h-10 w-40 rounded-full bg-zinc-200 shrink-0" />
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <div className="h-10 flex-1 min-w-[12rem] rounded-xl bg-zinc-200" />
        <div className="h-10 w-44 rounded-xl bg-zinc-200" />
        <div className="h-10 w-36 rounded-xl bg-zinc-200" />
        <div className="h-10 w-40 rounded-xl bg-zinc-200" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="h-40 rounded-2xl border border-zinc-200 bg-white p-4 flex flex-col gap-3"
          >
            <div className="h-5 w-16 rounded-full bg-zinc-200" />
            <div className="h-4 w-full rounded bg-zinc-200" />
            <div className="h-4 w-2/3 rounded bg-zinc-200" />
          </div>
        ))}
      </div>
    </div>
  )
}
