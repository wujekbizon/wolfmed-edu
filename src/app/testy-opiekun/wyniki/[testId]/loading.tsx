export default function Loading() {
  const randomHeight = () => {
    const heights = ['h-24', 'h-28', 'h-32', 'h-40']
    return heights[Math.floor(Math.random() * heights.length)]
  }

  return (
    <div className="flex w-full flex-col gap-4 overflow-y-auto items-center rounded-lg border border-red-200/60 bg-white shadow-md shadow-zinc-500 p-2 scrollbar-webkit md:p-8 lg:w-3/4 xl:w-2/3 animate-pulse">
      <div className="flex items-center justify-center gap-2">
        <h2 className="text-lg text-zinc-900">Twój wynik to: </h2>
        <p className="text-base text-zinc-800">
          <span className="text-xl text-[#ff5b5b] font-bold">-</span> / -
        </p>
      </div>

      {[...Array(8)].map((_, index) => (
        <div
          key={index}
          className={`flex w-full flex-col md:flex-row items-center justify-between rounded-lg border border-zinc-200/40 p-3 shadow shadow-zinc-500 bg-gray-200 ${randomHeight()}`}
        >
          <div className="w-full md:w-2/3 border-b border-r-0 md:border-b-0 md:border-r border-zinc-400/20 p-3">
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-full"></div>
            {Math.random() > 0.5 && <div className="h-4 bg-gray-300 rounded w-1/2 mt-2"></div>}
          </div>
          <div className="w-full md:w-1/3 p-3">
            <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          </div>
        </div>
      ))}

      <div className="bg-zinc-300 py-2 px-4 w-full sm:w-52 text-center rounded-md mt-4 hover:bg-zinc-300/70">
        Powrót
      </div>
    </div>
  )
}
