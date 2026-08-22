export default function DiagnozaContentSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-6 w-14 rounded-full bg-zinc-200" />
          <div className="h-3 w-40 rounded bg-zinc-200" />
        </div>
        <div className="h-7 w-2/3 rounded-lg bg-zinc-200" />
      </div>

      <div className="h-9 w-52 rounded-full bg-zinc-200 mb-6" />

      <div className="flex flex-col gap-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="rounded-2xl border border-zinc-200 bg-white p-4">
            <div className="h-4 w-32 rounded bg-zinc-200 mb-3" />
            <div className="h-3 w-full rounded bg-zinc-200 mb-2" />
            <div className="h-3 w-4/5 rounded bg-zinc-200" />
          </div>
        ))}
      </div>
    </div>
  )
}
