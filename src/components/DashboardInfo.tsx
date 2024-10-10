import { dashboardLinks } from '@/constants/dashboardLinks'
import Link from 'next/link'

export default function DashboardInfo() {
  return (
    <div className="border-red-200/60 shadow-md shadow-zinc-500 h-full bg-white w-full gap-6 flex flex-col items-center xl:flex-row justify-center sm:justify-between p-4 rounded-xl relative">
      <p className="text-base text-zinc-900 p-0 xs:p-4">
        Witaj przyszły <span className="font-bold text-[#f58a8a] text-base xs:text-xl">opiekunie medyczny</span>, <br />{' '}
        <br />
        przygotowaliśmy dla Ciebie najnowsze testy, które pomogą Ci się lepiej przygotować do egzaminu zawodowego. Nasza
        baza danych zawiera większość testów z ostatnich 2-3 lat z egzaminów państwowych i jest aktualizowana na
        bierząco.
        <br />
        Ponadto nasza aplikacja będzie rozbudowana o kursy uzupełniające, a także wiele materiałów i pomocy naukowych
        zwiazanych z rozwojem tego zawodu.
      </p>

      <div className="flex flex-col gap-5 justify-center w-full sm:w-2/3 h-full p-0 xs:p-4">
        {dashboardLinks.map(({ icon, link, text }) => (
          <div
            key={text}
            className="flex w-full xs:min-w-72 items-center justify-center cursor-pointer gap-5 stroke-zinc-500 px-4 py-1 bg-[#ffb1b1] text-zinc-800 transition-all hover:scale-95 rounded-md border border-red-200/40 hover:shadow-sm hover:bg-[#ffc5c5] shadow shadow-zinc-500 "
          >
            <Link href={link} className="flex items-center justify-between w-full gap-2">
              <p className="text-sm xs:text-base font-semibold text-zinc-900">{text}</p>
              {icon}
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
