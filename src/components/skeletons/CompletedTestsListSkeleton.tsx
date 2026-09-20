export default function CompletedTestsListSkeleton() {
  return (
    <div
      className="flex w-full flex-col items-center gap-6 overflow-y-auto p-2 scrollbar-webkit lg:p-5"
      role="status"
      aria-label="Wczytywanie wyników testów"
    >
      <div className="flex w-full justify-end">
        <div className="h-9 w-36 animate-pulse rounded-full bg-zinc-200" />
      </div>
      {[0, 1].map((index) => (
        <div
          key={index}
          className="flex w-full animate-pulse flex-col items-center justify-between gap-4 rounded-xl border border-red-200/60 bg-red-100 p-4 shadow-md shadow-zinc-300 lg:w-2/3 xl:w-1/2"
        >
          <div className="h-5 w-64 max-w-3/4 rounded bg-red-200" />
          <div className="h-32 w-32 rounded-full bg-zinc-700 sm:h-48 sm:w-48" />
          <div className="flex w-full flex-col items-center justify-between gap-4 md:flex-row">
            <div className="h-10 w-44 rounded-md bg-zinc-200" />
            <div className="h-5 w-48 rounded bg-red-200" />
          </div>
        </div>
      ))}
    </div>
  )
}
