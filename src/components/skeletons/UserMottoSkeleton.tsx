export default function UserMottoSkeleton() {
  return (
    <div
      className="w-full bg-linear-to-br from-[#ff9898]/5 via-zinc-100/10 to-[#ffc5c5]/5 backdrop-blur-sm p-5 sm:p-6 rounded-xl 
      border border-[#ff9898]/20 animate-pulse"
    >
      <div className="flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-4 h-4 sm:w-5 sm:h-5 bg-[#f58a8a]/50 rounded" />
          <div className="h-4 sm:h-5 w-24 bg-zinc-300/50 rounded" />
        </div>

        <div className="h-16 sm:h-20 w-full bg-zinc-200/50 rounded" />
      </div>
    </div>
  )
}
