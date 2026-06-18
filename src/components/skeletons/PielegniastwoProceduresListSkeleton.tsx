export default function PielegniastwoProceduresListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="border border-zinc-200 rounded-2xl overflow-hidden animate-pulse">
          <div className="h-[320px] bg-zinc-100" />
          <div className="p-4 flex flex-col gap-3">
            <div className="h-4 bg-zinc-100 rounded w-3/4" />
            <div className="h-3 bg-zinc-100 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}
