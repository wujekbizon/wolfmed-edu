export default function Loading() {
  const randomHeight = () => {
    const heights = ['min-h-40 md:min-h-20', 'min-h-44 md:min-h-24', 'min-h-48 md:min-h-28', 'min-h-52 md:min-h-32']
    return heights[Math.floor(Math.random() * heights.length)]
  }

  return (
    <div className="flex w-full lg:w-3/4 xl:w-2/3 flex-col gap-4 overflow-y-auto items-center rounded-lg border border-red-200/60 bg-white shadow-md shadow-zinc-500 p-2 scrollbar-webkit md:p-4 lg:p-6 animate-pulse">
      <div className="flex items-center justify-center gap-2 w-full">
        <h2 className="text-base md:text-lg text-zinc-900">Twój wynik to: </h2>
        <p className="text-sm md:text-base text-zinc-800">
          <span className="text-lg md:text-xl text-[#ff5b5b] font-bold">-</span> / -
        </p>
      </div>

      {[...Array(6)].map((_, index) => (
        <div
          key={index}
          className={`flex w-full flex-col sm:flex-row items-center justify-between rounded-lg border border-zinc-200/40 p-2 sm:p-3 shadow shadow-zinc-500 bg-gray-200 ${randomHeight()}`}
        >
          <div className="w-full sm:w-2/3 border-b border-r-0 sm:border-b-0 sm:border-r border-zinc-400/20 p-2 sm:p-3 h-full">
            <div className="min-h-3 sm:min-h-4 bg-gray-300 rounded w-3/4 mb-1 sm:mb-2"></div>
            <div className="min-h-3 sm:min-h-4 bg-gray-300 rounded w-full"></div>
            {Math.random() > 0.5 && <div className="min-h-3 sm:min-h-4 bg-gray-300 rounded w-1/2 mt-1 sm:mt-2"></div>}
          </div>
          <div className="w-full sm:w-1/3 p-2 sm:p-3 h-full">
            <div className="min-h-3 sm:min-h-4 bg-gray-300 rounded w-1/2 mb-1 sm:mb-2"></div>
            <div className="min-h-3 sm:min-h-4 bg-gray-300 rounded w-3/4"></div>
          </div>
        </div>
      ))}

      <div className="bg-zinc-300 py-2 px-4 w-full sm:w-52 text-center rounded-md mt-4 hover:bg-zinc-300/70">
        Powrót
      </div>
    </div>
  )
}
