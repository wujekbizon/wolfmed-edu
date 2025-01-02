export default function ExamCountdownSkeleton() {
  return (
    <div className="w-full h-[200px] p-4 sm:p-6 bg-zinc-900/50 backdrop-blur-md rounded-xl shadow-lg border border-zinc-800 hover:shadow-xl hover:border-zinc-700 transition-all duration-300 animate-pulse">
      <div className="h-7 w-3/4 mx-auto bg-zinc-800 rounded mb-4" />
      <div className="flex justify-center gap-4 mb-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className="h-10 w-16 bg-zinc-800 rounded" />
            <div className="h-4 w-12 bg-zinc-800 rounded" />
          </div>
        ))}
      </div>
      <div className="h-4 w-2/3 mx-auto bg-zinc-800 rounded" />
    </div>
  )
}
