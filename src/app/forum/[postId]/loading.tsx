export default function Loading() {
  return (
    <main className="min-h-screen w-full max-w-5xl mx-auto px-0 xs:px-4 py-8">
      <article className="bg-zinc-900/80 backdrop-blur-sm rounded-lg overflow-hidden animate-pulse">
        {/* Space reserved for back button */}
        <div className="h-6 mb-6"></div>
        {/* Header Loading */}
        <div className="p-6 border-b border-zinc-800/50">
          <div className="flex justify-between items-start">
            <div className="h-[32px] sm:h-[40px] bg-zinc-800/60 rounded-md w-3/4 mb-4 blur-[1px]"></div>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-5 bg-zinc-800/60 rounded-md w-24 blur-[0.5px]"></div>
              <span className="text-zinc-500/50">•</span>
              <div className="h-5 bg-zinc-800/60 rounded-md w-20 blur-[0.5px]"></div>
            </div>
          </div>
        </div>

        {/* Content Loading */}
        <div className="p-6 border-b border-zinc-800/50">
          <div className="space-y-4">
            <div className="h-5 bg-zinc-800/60 rounded-md w-full blur-[0.5px]"></div>
            <div className="h-5 bg-zinc-800/60 rounded-md w-5/6 blur-[0.5px]"></div>
            <div className="h-5 bg-zinc-800/60 rounded-md w-4/6 blur-[0.5px]"></div>
          </div>
        </div>

        {/* Comments Loading */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="h-5 xs:h-6 bg-zinc-800/60 rounded-md w-32 blur-[0.5px]"></div>
          </div>

          <div className="space-y-6">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="bg-zinc-800/30 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-5 bg-zinc-700/60 rounded-md w-24 blur-[0.5px]"></div>
                    <span className="text-zinc-500/50">•</span>
                    <div className="h-5 bg-zinc-700/60 rounded-md w-20 blur-[0.5px]"></div>
                  </div>
                </div>
                <div className="h-5 bg-zinc-700/60 rounded-md w-full mt-4 blur-[0.5px]"></div>
              </div>
            ))}
          </div>
        </div>
      </article>
    </main>
  )
}
