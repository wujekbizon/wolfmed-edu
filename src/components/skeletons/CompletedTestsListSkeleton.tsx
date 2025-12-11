export default function CompletedTestsListSkeleton() {
  return (
    <div className="flex w-full flex-col items-center gap-6 overflow-y-auto p-2 scrollbar-webkit lg:p-5">
      <div className="h-10 w-48 bg-zinc-200 rounded-lg animate-pulse" />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="w-full max-w-4xl h-32 bg-gradient-to-br from-white/25 via-white/35 to-white/25 backdrop-blur-xl border border-white/50 rounded-2xl animate-pulse" />
      ))}
    </div>
  )
}
