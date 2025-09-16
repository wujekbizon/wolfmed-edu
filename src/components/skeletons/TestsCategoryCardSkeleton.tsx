export default function TestsCategoryCardSkeleton() {
    return (
      <div className="flex h-[240px] w-[315px] flex-col items-center justify-between rounded-md border border-border/40 bg-zinc-950 p-3">
        <div className="h-6 w-3/4 animate-pulse rounded bg-zinc-800"></div>
        <div className="h-24 w-full animate-pulse rounded-xl bg-zinc-800"></div>
        <div className="h-10 w-3/4 animate-pulse rounded-md bg-zinc-800"></div>
      </div>
    );
  }