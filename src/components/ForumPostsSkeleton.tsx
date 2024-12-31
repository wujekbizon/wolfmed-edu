export default function ForumPostsSkeleton() {
  return (
    <div className="grid gap-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-zinc-900 rounded-lg p-4 animate-pulse">
          <div className="h-7 bg-zinc-800 rounded w-3/4 mb-4" />
          <div className="h-4 bg-zinc-800 rounded w-1/2 mb-2" />
          <div className="h-4 bg-zinc-800 rounded w-1/4" />
        </div>
      ))}
    </div>
  )
}
