export default function NotePageSkeleton() {
  return (
    <section className="relative min-h-screen p-3 sm:p-6 md:p-8 overflow-hidden bg-linear-to-br from-rose-50/30 via-white/60 to-fuchsia-100/40">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-linear-to-br from-[#ff9898]/5 to-[#ffc5c5]/5 rounded-full blur-3xl animate-[radialPulse_60s_ease-in-out_infinite]"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-linear-to-tr from-fuchsia-100/10 to-rose-50/10 rounded-full blur-3xl animate-radialPulse" style={{ '--slidein-delay': '2s' } as React.CSSProperties}></div>
      </div>

      <div className="relative max-w-4xl mx-auto">
        <div className="h-6 w-40 bg-zinc-200/60 rounded animate-pulse mb-6"></div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-zinc-200/60 shadow-xl overflow-hidden mb-6">
          <div className="p-6 sm:p-8 bg-linear-to-br from-white/60 to-rose-50/20">
            <div className="h-8 w-3/4 bg-zinc-200/60 rounded animate-pulse mb-6"></div>
            <div className="h-8 w-32 bg-zinc-200/60 rounded-full animate-pulse mb-5"></div>
            <div className="flex gap-2 mb-6">
              <div className="h-7 w-20 bg-zinc-200/60 rounded-lg animate-pulse"></div>
              <div className="h-7 w-24 bg-zinc-200/60 rounded-lg animate-pulse"></div>
              <div className="h-7 w-16 bg-zinc-200/60 rounded-lg animate-pulse"></div>
            </div>
            <div className="flex gap-6">
              <div className="h-5 w-48 bg-zinc-200/60 rounded animate-pulse"></div>
              <div className="h-5 w-52 bg-zinc-200/60 rounded animate-pulse"></div>
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-zinc-200/60 shadow-xl overflow-hidden">
          <div className="p-6 sm:p-8 space-y-3">
            <div className="h-4 w-full bg-zinc-200/60 rounded animate-pulse"></div>
            <div className="h-4 w-5/6 bg-zinc-200/60 rounded animate-pulse"></div>
            <div className="h-4 w-4/5 bg-zinc-200/60 rounded animate-pulse"></div>
            <div className="h-4 w-full bg-zinc-200/60 rounded animate-pulse"></div>
            <div className="h-4 w-3/4 bg-zinc-200/60 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  )
}
