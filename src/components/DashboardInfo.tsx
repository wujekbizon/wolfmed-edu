import { dashboardLinks } from '@/constants/dashboardLinks'
import Link from 'next/link'

export default function DashboardInfo() {
  return (
    <div
      className="bg-white/70 backdrop-blur-sm w-full gap-6 xs:gap-8 flex flex-col items-center xl:flex-row 
      justify-between p-3 xs:p-6 sm:p-10 rounded-2xl shadow-md border border-zinc-200/60 
      hover:shadow-lg transition-all duration-300"
    >
      <div className="w-full xl:w-1/2">
        <h2 className="text-lg xs:text-xl sm:text-2xl text-center xs:text-left text-zinc-800 font-bold mb-3 xs:mb-4">
          Witaj przyszły <span className="text-[#f58a8a]">opiekunie medyczny</span>!
        </h2>
        <p className="text-sm xs:text-base text-zinc-700 leading-relaxed px-2 xs:px-0 text-center xs:text-left">
          Przygotowaliśmy dla Ciebie najnowsze testy, które pomogą Ci się lepiej przygotować do egzaminu zawodowego.
          Nasza baza danych zawiera większość testów z ostatnich 2-3 lat z egzaminów państwowych i jest aktualizowana na
          bieżąco.
        </p>
        <p className="text-sm xs:text-base text-zinc-700 leading-relaxed mt-3 xs:mt-4 px-2 xs:px-0 text-center xs:text-left">
          Ponadto nasza aplikacja będzie rozbudowana o kursy uzupełniające, a także wiele materiałów i pomocy naukowych
          związanych z rozwojem tego zawodu.
        </p>
      </div>

      <div className="w-full xl:w-1/2 flex flex-col gap-3 xs:gap-4">
        <h3 className="text-base xs:text-lg sm:text-xl font-semibold text-zinc-800 mb-1 xs:mb-2 text-center xs:text-left">
          Szybki dostęp:
        </h3>
        {dashboardLinks.map(({ icon, link, text }) => (
          <Link
            key={text}
            href={link}
            className="flex items-center justify-between w-full gap-3 xs:gap-4 px-4 xs:px-6 py-2.5 xs:py-3 
              bg-linear-to-r from-[#f58a8a]/90 to-[#ffc5c5]/90 shadow-sm text-zinc-800 rounded-xl transition-all hover:shadow-md 
              hover:scale-[1.01] hover:bg-[#ffc5c5]"
          >
            <span className="text-sm xs:text-base font-semibold text-zinc-900">{text}</span>
            <span className="text-zinc-700">{icon}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
