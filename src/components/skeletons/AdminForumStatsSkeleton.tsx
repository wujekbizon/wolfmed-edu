export default function AdminForumStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="bg-white p-6 rounded-lg shadow-sm border border-zinc-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="h-4 w-24 bg-zinc-200 rounded" />
              <div className="h-8 w-16 bg-zinc-200 rounded mt-2" />
            </div>
            <div className="w-12 h-12 bg-zinc-200 rounded-lg" />
          </div>
          <div className="h-4 w-28 bg-zinc-200 rounded mt-4" />
        </div>
      ))}
    </div>
  )
}
