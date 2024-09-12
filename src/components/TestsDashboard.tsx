import DashboardIcon from '@/components/icons/DashboardIcon'
import LearnIcon from '@/components/icons/LearnIcon'
import ProceduresIcon from './icons/ProceduresIcon'
import Image from 'next/image'
import Link from 'next/link'
import { dashboardLinks } from '@/constants/dashboardLinks'

export default function TestsDashboard() {
  return (
    <section className="flex justify-center w-full gap-2 h-full overflow-y-auto scrollbar-webkit">
      <div className="lg:w-[80%] h-full w-full flex flex-col items-center justify-center">
        <div className="border-red-200/60 shadow-md shadow-zinc-500 animate-slideInDown opacity-0 [--slidein-delay:300ms] h-fit bg-white w-[95%] xl:w-3/4 gap-6 flex flex-col justify-center sm:justify-between p-8 pr-8 lg:pr-14 rounded-xl relative">
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
          <div className="py-10 bg-[#fff9f9] flex flex-col justify-center items-center rounded-xl">
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
          <div className="absolute right-[-10px] top-[calc(0px_-_128px/2.5)] lg:right-[calc(0px_-_128px/2.5)] h-32 min-w-32 border-4 border-white shadow shadow-zinc-500 rounded-full hidden xs:inline-block">
            <Image
              src="/guide.jpg"
              width={150}
              height={150}
              alt="Asystent"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
