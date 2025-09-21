export default function TestsCategoryCardSkeleton() {
    return (
      <div className="relative flex flex-col lg:flex-row min-h-[400px] w-full p-5 overflow-hidden rounded-xl bg-zinc-800 transition-all duration-300 animate-pulse">
        <div className="relative h-72 lg:h-full w-full lg:w-1/3 overflow-hidden rounded-lg bg-zinc-700">
        </div>

        <div className="relative z-10 flex w-full lg:w-2/3 flex-col justify-between p-0 lg:p-6 pt-10">
          <div className="flex flex-col items-start">
            <div className="h-5 w-24 rounded-full bg-zinc-600 mb-2"></div>
            <div className="h-10 w-3/4 rounded bg-zinc-600"></div>
            <div className="mt-2 h-16 w-full rounded bg-zinc-700"></div>
          </div>

          <div className="mt-4 flex items-center justify-start">
            <div className="h-6 w-2/3 rounded bg-zinc-700"></div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div className="h-6 w-1/2 rounded bg-zinc-700"></div>
            <div className="h-6 w-1/2 rounded bg-zinc-700"></div>
          </div>

          <div className="mt-8 h-12 w-full rounded-md bg-zinc-600"></div>
        </div>
      </div>
    );
  }