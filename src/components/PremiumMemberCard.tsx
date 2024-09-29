import Link from 'next/link'

export default function PremiumMemberCard() {
  return (
    <div className="h-[480px] w-[95%] xs:w-[90%] md:w-[400px] hover:scale-105 bg-zinc-800 flex flex-col transition-all justify-between p-8 rounded-2xl shadow-md shadow-zinc-400">
      <div className="flex w-full items-center gap-8 border-b border-zinc-400/20 pb-7">
        <div className="hidden xs:block w-20 h-20 rounded-2xl bg-white relative overflow-hidden shadow-inner shadow-zinc-800">
          <div className="absolute right-[-8%] top-[-8%] w-10 h-10 rounded-full bg-zinc-300 shadow-md shadow-zinc-500"></div>
          <div className="absolute left-[-10%] bottom-[-16%] w-10 h-10 bg-zinc-300 shadow-md shadow-zinc-600"></div>
        </div>
        <div className="flex flex-col">
          <h2 className="text-2xl font-semibold text-white">Premium</h2>
          <h4 className="text-sm text-zinc-400">
            <span className="text-3xl font-semibold text-[#fb8c8c] animate-pulse">49.99</span> zł / jednorazowo
            <br />
            <span className="text-sm text-zinc-400">
              <span className="line-through">199.99</span> zł
            </span>
          </h4>
        </div>
      </div>
      <ul className="w-full h-full flex flex-col justify-center gap-4 text-lg">
        <li className=" text-zinc-100">
          <span className="mr-4">✔</span>
          Obejmuje pakiet <span className="font-bold text-[#ffe3e3]">podstawowy</span>
        </li>
        <li className=" text-zinc-100">
          {' '}
          <span className="mr-4">✔</span>
          Pełne <span className="font-bold text-[#ffe3e3]">wsparcie</span> klienta
        </li>
        <li className=" text-zinc-100">
          {' '}
          <span className="mr-4">✔</span>
          <span className="font-bold text-[#ffe3e3]">Bez limitu</span> testów
        </li>
        <li className=" text-zinc-100">
          {' '}
          <span className="mr-4">✔</span>
          Dostęp do <span className="font-bold text-[#ffe3e3]">blogu</span> informacyjnego
        </li>
      </ul>
      <Link
        href="/konto-premium"
        className="bg-red-400 py-4 rounded-lg text-center text-white text-lg hover:bg-red-500 transition-colors"
      >
        Wybierz plan
      </Link>
    </div>
  )
}
