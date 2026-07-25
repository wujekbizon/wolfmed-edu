import EgzaminAttemptsListSkeleton from '@/components/skeletons/EgzaminAttemptsListSkeleton'

export default function EgzaminContentSkeleton() {
  return (
    <div>
      <div className="mb-6 animate-pulse">
        <div className="h-7 w-80 max-w-full rounded-lg bg-zinc-200 mb-3" />
        <div className="h-4 w-full rounded bg-zinc-200 mb-2" />
        <div className="h-4 w-full rounded bg-zinc-200 mb-2" />
        <div className="h-4 w-2/3 rounded bg-zinc-200" />
      </div>
      <div className="h-32 rounded-2xl border border-zinc-200 bg-white animate-pulse" />
      <EgzaminAttemptsListSkeleton />
    </div>
  )
}
