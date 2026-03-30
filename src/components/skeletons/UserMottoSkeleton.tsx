export default function UserMottoSkeleton() {
  return (
    <div className="w-full bg-zinc-50 border border-zinc-100 p-5 sm:p-6 rounded-xl animate-pulse">
      <div className="flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-4 h-4 sm:w-5 sm:h-5 bg-zinc-200 rounded" />
          <div className="h-4 sm:h-5 w-24 bg-zinc-200 rounded" />
        </div>

        <div className="h-16 sm:h-20 w-full bg-zinc-100 rounded" />
      </div>
    </div>
  )
}
