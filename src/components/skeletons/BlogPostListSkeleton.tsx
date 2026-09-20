export default function BlogPostListSkeleton() {
  return (
    <div className="flex flex-col gap-6" role="status" aria-label="Wczytywanie artykułów">
      {[0, 1].map((index) => (
        <div
          key={index}
          className="min-h-[340px] animate-pulse overflow-hidden rounded-2xl border border-[#3A3A5A]/30 bg-[#2A2A3F]/40 md:flex"
        >
          <div className="h-64 w-full bg-[#3A3A5A]/40 md:h-auto md:w-80" />
          <div className="flex flex-1 flex-col justify-between gap-6 p-6 sm:p-8">
            <div className="space-y-4">
              <div className="h-7 w-3/4 rounded bg-[#3A3A5A]/60" />
              <div className="h-4 w-full rounded bg-[#3A3A5A]/40" />
              <div className="h-4 w-2/3 rounded bg-[#3A3A5A]/40" />
            </div>
            <div className="h-10 w-full rounded bg-[#3A3A5A]/40" />
          </div>
        </div>
      ))}
    </div>
  )
}
