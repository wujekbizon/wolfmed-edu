export default function WypelnijRunnerSkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      <div className="h-24 rounded-2xl border border-zinc-200 bg-white" />
      {[...Array(4)].map((_, index) => (
        <div key={index} className="flex flex-col gap-2">
          <div className="h-4 w-48 rounded bg-zinc-200" />
          <div className="h-10 w-full rounded-xl border border-zinc-200 bg-white" />
        </div>
      ))}
    </div>
  )
}
