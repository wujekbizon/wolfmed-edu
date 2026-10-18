export default function PracticeTestSkeleton() {
  return (
    <div className="mx-auto grid w-full animate-pulse gap-8 lg:w-3/4 xl:w-2/3">
      {[0, 1, 2].map((id) => (
        <div key={id} className="rounded-lg border border-zinc-200 bg-white p-6">
          <div className="mb-6 h-5 w-3/4 rounded bg-zinc-200" />
          <div className="grid gap-4">
            {[0, 1, 2, 3].map((answer) => <div key={answer} className="h-4 rounded bg-zinc-100" />)}
          </div>
        </div>
      ))}
    </div>
  )
}
