export default function Loading() {
  return (
    <section className="flex w-full flex-col items-center gap-6 overflow-y-auto p-4 scrollbar-webkit md:p-8">
      <div className="flex justify-end w-full blur-sm">
        <select className="p-2 rounded-full text-xs sm:text-sm border-red-200/40 bg-white shadow shadow-zinc-500 cursor-pointer outline-none">
          <option value="dateDesc">Od Najnowszych</option>
        </select>
      </div>
      <div className="flex w-full flex-col items-center justify-between gap-4 rounded-xl border transition-colors blur-sm animate-pulse border-red-200/60 bg-[#ffb1b1] shadow-md shadow-zinc-500 p-4  hover:bg-[#f58a8a] lg:w-2/3 xl:w-1/2">
        <p className="text-center text-base text-zinc-900 sm:text-lg">Odpowiedziałeś poprawnie na 0 pytań</p>
        <div className="flex h-32 w-32 flex-col items-center justify-center gap-3 rounded-full border border-red-200/60 bg-gradient-to-r from-zinc-600 to-zinc-950 shadow-inner shadow-slate-950 sm:h-48 sm:w-48">
          <p className="text-center text-sm text-zinc-100 sm:text-lg">Wynik: </p>
          <p className="text-center text-base text-zinc-300 sm:text-2xl">
            <span className="text-2xl font-bold text-[#ff5b5b] sm:text-4xl">0</span>{' '}
            <span className="font-thin text-zinc-600">/</span> 10
          </p>
        </div>
        <div className="flex w-full flex-col items-center justify-between md:flex-row">
          <p className="text-center text-xs text-stone-700 sm:text-sm">Kliknij by dowiedzieć się więcej informacji.</p>
        </div>
      </div>
    </section>
  )
}
