import DashboardIcon from '@/components/icons/DashboardIcon'
import LearnIcon from '@/components/icons/LearnIcon'
import Image from 'next/image'
import Link from 'next/link'

export default function TestsDashboard() {
  return (
    <section className="flex justify-center w-full h-full">
      <div className="lg:w-[80%] h-full w-full flex flex-col items-center justify-center">
        <div className="border-red-200/60 shadow-md shadow-zinc-500 animate-slideInDown opacity-0 [--slidein-delay:300ms] bg-white w-full xl:w-3/4 gap-2 flex flex-col justify-between p-8 pr-8 lg:pr-14 rounded-xl relative">
          <p className="text-sm xs:text-base text-zinc-900">
            Witaj przyszły <span className="font-bold text-[#f58a8a] text-base xs:text-lg">opiekunie medyczny</span>,{' '}
            <br /> w tym dziale przygotowaliśmy dla Ciebie najnowsze testy, które pomogą Ci się lepiej przygotować do
            egzaminu zawodowego. Nasza baza danych zawiera większość testów z ostatnich 2-3 lat z egzaminów państwowych
            i jest aktualizowana na bierząco.
          </p>
          <p className="text-sm xs:text-base text-zinc-900">
            Ponadto w niedalekiej przyszłości, nasza aplikacja będzie rozbudowana o kursy uzupełniające, blog z poradami
            prowadzony przez naszych doświadzczonych opiekunów medycznych, a także wiele materiałów i pomocy naukowych
            zwiazanych z rozwojem tego zawodu.
          </p>
          <div className="flex items-center gap-4">
            <p className="text-sm xs:text-base font-semibold text-zinc-900">No to co, zaczynamy sie uczyć ?</p>
            <Link href="/testy-opiekun/nauka" className="flex items-center justify-center animate-bounce">
              <LearnIcon color="#ff8c8c" width={34} height={34} />
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-sm xs:text-base font-semibold text-zinc-900">A może sprawdzisz swoją wiedzę?</p>
            <Link href="/testy-opiekun/testy" className="flex items-center justify-center animate-bounce">
              <DashboardIcon color="#ff8c8c" width={34} height={34} />
            </Link>
          </div>
          <div className="absolute right-[-10px] top-[-90px] lg:top-[-50px] lg:right-[-50px] h-32 min-w-32 border-4 border-white rounded-full hidden xs:inline-block">
            <p className="absolute top-[-25px] left-[-45px] text-sm">
              Cześć, jestem <span className="font-semibold">Ampułka</span>
            </p>
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
