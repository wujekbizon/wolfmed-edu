export default function Loading() {
  return <section className="results-page" role="status" aria-label="Wczytywanie szczegółów testu">
    <div className="results-page-shell results-detail-shell">
      <div className="h-10 w-40 animate-pulse rounded-full bg-white/80" />
      <header className="results-page-header animate-pulse">
        <div className="grid w-full max-w-2xl gap-3">
          <div className="h-3 w-28 rounded bg-zinc-200" />
          <div className="h-10 w-64 max-w-full rounded-xl bg-zinc-200" />
          <div className="h-4 w-full max-w-lg rounded bg-zinc-100" />
        </div>
        <div className="h-24 w-36 rounded-2xl bg-purple-50" />
      </header>
      <div className="result-detail-list">
        {Array.from({ length: 6 }, (_, index) => <div key={index} className="result-question-card animate-pulse">
          <div className="flex items-center justify-between gap-4">
            <div className="h-8 w-8 rounded-xl bg-zinc-100" />
            <div className="h-4 w-36 rounded bg-zinc-100" />
          </div>
          <div className="grid gap-2">
            <div className="h-4 w-full rounded bg-zinc-100" />
            <div className="h-4 w-3/4 rounded bg-zinc-100" />
          </div>
          <div className="grid gap-2 rounded-2xl bg-zinc-50 p-4">
            <div className="h-3 w-36 rounded bg-zinc-100" />
            <div className="h-4 w-2/3 rounded bg-zinc-100" />
          </div>
        </div>)}
      </div>
    </div>
  </section>
}
