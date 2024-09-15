export default function BasicMemberCard() {
  return (
    <div className="h-[400px] w-[90%] md:w-[360px] bg-white flex flex-col transition-all justify-between p-8 rounded-2xl shadow-md shadow-zinc-300">
      <div className="flex w-full items-center gap-8 border-b border-[#ffe3e3]/80 pb-7">
        <div className="w-20 h-20 rounded-2xl bg-[#ffc5c5] relative overflow-hidden">
          <div className="absolute right-[-8%] top-[-8%] w-10 h-10 rounded-full bg-[#ffe3e3]"></div>
          <div className="absolute left-[-10%] bottom-[-16%] w-10 h-10 bg-[#ffe3e3]"></div>
        </div>
        <div className="flex flex-col">
          <h2 className="text-2xl font-semibold">Podstawowy</h2>
          <h4 className="text-sm text-zinc-400">
            <span className="text-3xl font-semibold text-zinc-600">0</span> zł / miesiąc
          </h4>
        </div>
      </div>
      <ul className="w-full h-full flex flex-col justify-center gap-4 text-lg">
        <li className=" text-zinc-500">
          <span className="mr-4">✔</span>
          Dostęp do <span className="font-bold text-zinc-700">wszystkich</span> pytań
        </li>
        <li className=" text-zinc-500">
          {' '}
          <span className="mr-4">✔</span>
          <span className="font-bold text-zinc-700">Procedury</span> i algorytmy
        </li>
        <li className=" text-zinc-500">
          {' '}
          <span className="mr-4">✔</span>Limit <span className="font-bold text-zinc-700"> 10</span> testów
        </li>
      </ul>
      <button
        disabled
        className="bg-red-400 py-4 rounded-lg text-white text-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Obecnie posiadasz
      </button>
    </div>
  )
}
