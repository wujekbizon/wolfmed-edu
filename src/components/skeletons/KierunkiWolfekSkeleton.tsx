export default function KierunkiWolfekSkeleton() {
  return <section className="kierunki-wolfek-skeleton" role="status" aria-label="Ładowanie przewodnika Wolfka">
    <div className="flex items-center gap-4 motion-safe:animate-pulse">
      <div className="h-24 w-24 shrink-0 rounded-full bg-purple-100/70" />
      <div className="grid min-w-0 flex-1 gap-3">
        <div className="h-3 w-3/4 rounded bg-purple-100" />
        <div className="h-7 w-full rounded bg-purple-100" />
        <div className="h-12 w-full rounded bg-purple-50" />
      </div>
    </div>
    <div className="mt-7 grid grid-cols-2 gap-3 motion-safe:animate-pulse">
      {[0, 1, 2, 3, 4].map((item) => <div key={item} className="h-16 rounded-2xl border border-purple-100 bg-white/70 last:col-span-2 last:h-13" />)}
    </div>
    <div className="mt-6 h-14 rounded-2xl border border-purple-100 bg-white motion-safe:animate-pulse" />
  </section>
}
