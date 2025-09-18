export default function TestsCategoryCardSkeleton() {
    return (
      <div className="relative flex min-h-[400px] w-full flex-col justify-end overflow-hidden rounded-md border border-border/40 bg-zinc-950 p-6 shadow-xl">
        <div className="absolute inset-0 bg-zinc-800 opacity-20"></div>
        <div className="relative z-10 flex h-full w-full flex-col justify-between pt-10 animate-pulse">
          <div className="flex flex-col items-start">
            <div className="h-5 w-24 rounded-full bg-zinc-700 mb-2"></div>
            <div className="h-10 w-3/4 rounded bg-zinc-700"></div>
            <div className="mt-2 h-16 w-full rounded bg-zinc-800"></div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div className="h-6 w-1/2 rounded bg-zinc-800"></div>
            <div className="h-6 w-1/2 rounded bg-zinc-800"></div>
            <div className="h-6 w-1/2 rounded bg-zinc-800"></div>
            <div className="h-6 w-1/2 rounded bg-zinc-800"></div>
          </div>

          <div className="mt-8 h-12 w-full rounded-md bg-zinc-700"></div>
        </div>
      </div>
    );
  }