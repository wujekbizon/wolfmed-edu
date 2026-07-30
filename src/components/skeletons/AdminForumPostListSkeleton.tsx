export default function AdminForumPostListSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-zinc-200 animate-pulse">
      <div className="divide-y divide-zinc-200">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-start justify-between gap-4 p-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-4 w-24 bg-zinc-200 rounded" />
                <div className="h-4 w-16 bg-zinc-200 rounded" />
              </div>
              <div className="h-6 w-2/3 bg-zinc-200 rounded" />
            </div>
            <div className="h-4 w-8 bg-zinc-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
