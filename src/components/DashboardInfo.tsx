import { dashboardLinks } from '@/constants/dashboardLinks'
import Link from 'next/link'

export default function DashboardInfo() {
  return (
    <div className="bg-white w-full gap-8 flex flex-col items-center xl:flex-row justify-between p-6 sm:p-10 rounded-2xl shadow-lg">
      <div className="w-full xl:w-1/2">
        <h2 className="text-xl sm:text-3xl text-center xs:text-left text-zinc-800 font-bold mb-4">
          Witaj przyszły <span className="text-[#f58a8a]">opiekunie medyczny </span>!
        </h2>
        <p className="text-base text-zinc-700 leading-relaxed">
          Przygotowaliśmy dla Ciebie najnowsze testy, które pomogą Ci się lepiej przygotować do egzaminu zawodowego.
          Nasza baza danych zawiera większość testów z ostatnich 2-3 lat z egzaminów państwowych i jest aktualizowana na
          bieżąco.
        </p>
        <p className="text-base text-zinc-700 leading-relaxed mt-4">
          Ponadto nasza aplikacja będzie rozbudowana o kursy uzupełniające, a także wiele materiałów i pomocy naukowych
          związanych z rozwojem tego zawodu.
        </p>
      </div>

      <div className="w-full xl:w-1/2 flex flex-col gap-4">
        <h3 className="text-xl font-semibold text-zinc-800 mb-2">Szybki dostęp</h3>
        {dashboardLinks.map(({ icon, link, text }) => (
          <Link
            key={text}
            href={link}
            className="flex items-center justify-between w-full gap-4 px-6 py-4 bg-[#ffb1b1] text-zinc-800 rounded-xl shadow-md transition-all hover:shadow-lg hover:scale-[1.02] hover:bg-[#ffc5c5]"
          >
            <span className="text-base font-semibold text-zinc-900">{text}</span>
            <span className="text-zinc-700">{icon}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
