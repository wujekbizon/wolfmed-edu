import Link from 'next/link'
import { dashboardLinks } from '@/constants/dashboardLinks'

export default function TestsDashboard() {
  return (
    <section className="flex justify-center h-full w-full">
      <div className="lg:w-[80%] h-full w-full flex flex-col items-center justify-start xs:justify-center py-6 overflow-y-scroll scrollbar-webkit">
        <div className="border-red-200/60 shadow-md shadow-zinc-500 h-fit bg-white w-[95%] xl:w-3/4 gap-6 flex flex-col justify-center sm:justify-between p-4 sm:p-8  rounded-xl relative">
          <p className="text-base text-zinc-900 pt-6">
            Witaj przyszły <span className="font-bold text-[#f58a8a] text-base xs:text-lg">opiekunie medyczny</span>,{' '}
            <br /> w tym dziale przygotowaliśmy dla Ciebie najnowsze testy, które pomogą Ci się lepiej przygotować do
            egzaminu zawodowego. Nasza baza danych zawiera większość testów z ostatnich 2-3 lat z egzaminów państwowych
            i jest aktualizowana na bierząco.
          </p>
          <p className="text-base text-zinc-900">
            Ponadto w niedalekiej przyszłości, nasza aplikacja będzie rozbudowana o kursy uzupełniające, blog z poradami
            prowadzony przez naszych doświadzczonych opiekunów medycznych, a także wiele materiałów i pomocy naukowych
            zwiazanych z rozwojem tego zawodu.
          </p>
          <div className="py-10 flex flex-col justify-center items-center rounded-xl">
            <div className="flex flex-col gap-3">
              {dashboardLinks.map(({ icon, link, text }) => (
                <div
                  key={text}
                  className="flex items-center justify-center cursor-pointer gap-5 stroke-zinc-500 px-4 py-1 bg-[#ffb1b1] text-zinc-800 transition-all hover:scale-95 rounded-md border border-red-200/40 hover:shadow-sm hover:bg-[#ffc5c5] shadow shadow-zinc-500 "
                >
                  <Link href={link} className="flex items-center justify-between w-full gap-2">
                    <p className="text-sm xs:text-base font-semibold text-zinc-900">{text}</p>
                    {icon}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
