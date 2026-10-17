export default function CompletedTestsListSkeleton() {
  return <section className="results-page" role="status" aria-label="Wczytywanie wyników testów">
    <div className="results-page-shell">
      <header className="results-page-header animate-pulse">
        <div className="grid w-full max-w-2xl gap-3">
          <div className="h-3 w-28 rounded bg-zinc-200" />
          <div className="h-10 w-64 max-w-full rounded-xl bg-zinc-200" />
          <div className="h-4 w-full max-w-lg rounded bg-zinc-100" />
        </div>
        <div className="h-10 w-40 rounded-full bg-zinc-100" />
      </header>
      <div className="results-list">
        {[0, 1].map((index) => <div key={index} className="completed-result-card animate-pulse">
          <div className="completed-result-main">
            <div className="grid w-full gap-3">
              <div className="h-4 w-32 rounded bg-zinc-200" />
              <div className="h-6 w-56 max-w-full rounded bg-zinc-100" />
              <div className="h-4 w-28 rounded bg-zinc-100" />
            </div>
            <div className="h-20 w-32 rounded-2xl bg-purple-50" />
          </div>
          <div className="h-2 rounded-full bg-zinc-100" />
          <div className="h-10 w-44 rounded-full bg-purple-50" />
        </div>)}
      </div>
    </div>
  </section>
}
