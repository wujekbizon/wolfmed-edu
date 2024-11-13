export default function ContactSkeleton() {
  return (
    <div className="backdrop-blur-sm bg-white/5 rounded-lg shadow-xl p-4 xs:p-8 z-10">
      <div className="flex flex-col gap-6">
        {/* Email field skeleton */}
        <div className="space-y-2">
          <div className="h-4 w-12 bg-white/10 rounded animate-pulse"></div>
          <div className="h-10 w-full bg-white/5 rounded border border-white/10"></div>
        </div>

        {/* Message field skeleton */}
        <div className="space-y-2">
          <div className="h-4 w-20 bg-white/10 rounded animate-pulse"></div>
          <div className="h-32 w-full bg-white/5 rounded border border-white/10"></div>
        </div>

        {/* Button skeleton */}
        <div className="h-10 w-full bg-white/10 rounded animate-pulse"></div>
      </div>
    </div>
  )
}
