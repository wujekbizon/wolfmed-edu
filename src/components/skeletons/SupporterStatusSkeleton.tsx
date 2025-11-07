export default function SupporterStatusSkeleton() {
  return (
    <div
      className="bg-linear-to-r from-[#ff9898]/10 to-rose-100/10 backdrop-blur-sm 
      border border-[#ff9898]/20 px-4 py-3 rounded-lg shadow-sm"
    >
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 bg-[#f58a8a]/20 rounded-full animate-pulse" />
        <div className="space-y-2">
          <div className="h-4 w-24 bg-[#f58a8a]/20 rounded-full animate-pulse" />
          <div className="h-3 w-48 bg-[#f58a8a]/20 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  )
}
