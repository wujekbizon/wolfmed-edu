export default function TestsCategoryCardSkeleton() {
    return (
      <div className="relative flex flex-col lg:flex-row w-full p-2 rounded-2xl bg-slate-900 transition-all duration-300 animate-pulse opacity-85">
        <div className="relative h-72 lg:h-full w-full lg:w-1/3 rounded-xl bg-zinc-700 border border-zinc-600 lg:rounded-l-xl lg:rounded-r-none">
        </div>

        <div className="relative z-10 flex w-full lg:w-2/3 flex-col gap-4 p-2 lg:p-6">
          <div className="flex flex-col items-start">
            <div className="h-6 w-24 rounded-full bg-zinc-600 mb-4"></div>
            <div className="h-10 w-3/4 rounded bg-zinc-600"></div>
            <div className="mt-2 h-16 w-full rounded bg-zinc-700"></div>
          </div>

          <div className="flex justify-between items-center">
            <div className="h-10 w-40 rounded-lg bg-red-100"></div>
            <div className="flex flex-col justify-between items-start gap-2">
              <div className="h-6 w-40 rounded bg-zinc-600"></div>
              <div className="h-6 w-40 rounded bg-zinc-600"></div>
            </div>
          </div>

          <div className="w-full border border-zinc-600 p-2 rounded-md bg-slate-950 flex flex-col gap-2">
            <div className="h-10 w-full rounded-md bg-zinc-600/40"></div>
            <div className="h-18 w-full rounded-md bg-zinc-600/40"></div>
          </div>
        </div>
      </div>
    );
  }