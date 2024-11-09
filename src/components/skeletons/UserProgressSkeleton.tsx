export default function UserProgressSkeleton() {
  return (
    <div className="bg-zinc-900 backdrop-blur p-4 sm:p-6 rounded-xl border border-zinc-800 shadow-lg animate-pulse">
      <div className="h-7 w-48 bg-zinc-800 rounded mb-6 sm:mb-8" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-10">
        <div className="flex flex-col items-center">
          <div className="w-[120px] h-[120px] rounded-full bg-zinc-800" />
          <div className="mt-4 sm:mt-5 h-6 w-32 bg-zinc-800 rounded" />
          <div className="mt-2 h-8 w-16 bg-zinc-800 rounded" />
        </div>

        <div className="flex flex-col items-center">
          <div className="w-[120px] h-[120px] rounded-full bg-zinc-800" />
          <div className="mt-4 sm:mt-5 h-6 w-32 bg-zinc-800 rounded" />
          <div className="mt-2 h-8 w-24 bg-zinc-800 rounded" />
        </div>
      </div>

      <div className="mt-8 sm:mt-10">
        <div className="flex justify-between items-center mb-3">
          <div className="h-6 w-36 bg-zinc-800 rounded" />
          <div className="h-5 w-20 bg-zinc-800 rounded" />
        </div>
        <div className="w-full h-2 sm:h-4 bg-zinc-800 rounded-full" />
        <div className="flex justify-between mt-2">
          <div className="h-4 w-8 bg-zinc-800 rounded" />
          <div className="h-4 w-24 bg-zinc-800 rounded" />
          <div className="h-4 w-8 bg-zinc-800 rounded" />
        </div>
      </div>
    </div>
  )
}
