// TestsCategoryCardSkeleton.tsx

export default function TestsCategoryCardSkeleton() {
  return (
    <div className="relative flex flex-col lg:flex-row w-full rounded-2xl bg-slate-900 overflow-hidden opacity-95">
      {/* Image side */}
      <div className="relative h-64 sm:h-72 lg:h-auto w-full lg:w-2/5 xl:w-1/3 shrink-0">
        <div className="h-full w-full min-h-64 animate-pulse bg-slate-700" />
      </div>

      {/* Content side */}
      <div className="flex flex-col gap-4 sm:gap-5 lg:gap-6 p-4 sm:p-5 lg:p-6 xl:p-8 w-full">
        <div className="flex flex-col gap-3 sm:gap-4">
          {/* Badge */}
          <div className="flex flex-wrap gap-2">
            <div className="h-6 w-28 animate-pulse rounded-full bg-slate-700" />
          </div>

          {/* Title */}
          <div className="h-9 sm:h-10 lg:h-11 w-2/3 animate-pulse rounded-lg bg-slate-700" />

          {/* Description lines */}
          <div className="flex flex-col gap-2">
            <div className="h-4 w-full animate-pulse rounded bg-slate-700" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-slate-700" />
            <div className="h-4 w-3/5 animate-pulse rounded bg-slate-700" />
          </div>
        </div>

        {/* Bottom row: popularity pill + stats */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-start sm:items-center">
          <div className="h-10 w-28 animate-pulse rounded-lg bg-slate-700" />

          <div className="flex flex-col gap-2 w-full sm:w-auto">
            <div className="h-4 w-40 animate-pulse rounded bg-slate-700" />
            <div className="h-4 w-36 animate-pulse rounded bg-slate-700" />
          </div>
        </div>

        {/* StartTestForm box */}
        <div className="w-full border border-zinc-600 rounded-lg bg-slate-950 p-3 sm:p-4">
          <div className="flex flex-col gap-3">
            <div className="h-4 w-3/4 animate-pulse rounded bg-slate-700" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-slate-700" />
            <div className="h-10 w-36 animate-pulse rounded-lg bg-slate-700 self-end" />
          </div>
        </div>
      </div>
    </div>
  );
}