import TestInfoCard from '@/components/TestInfoCard'
import Image from 'next/image'
import Link from 'next/link'

export default function TestsSelection() {
  return (
    <section
      className="flex h-full w-full p-0 sm:p-5 flex-col lg:flex-row items-center lg:items-start gap-14 lg:gap-4"
      id="testy"
    >
      <div className="w-full lg:w-1/3 flex flex-col gap-2 md:gap-5">
        <h1 className="py-2 font-medium w-full lg:w-[80%] text-center lg:text-left text-[35px] sm:text-[40px] leading-[35px] md:text-[48px] sm:leading-[55px] text-zinc-950">
          Szeroki wybór testów
        </h1>
        <p className="text-base text-zinc-600 w-full xl:w-[90%] text-center lg:text-left">
          Wybieraj spośród ponad 500 testów obejmujących szeroką gamę odpowiednich tematów rozwoju zawodowego opiekunów
          medycznych!
        </p>
        <div className="flex items-center gap-2 justify-center lg:justify-start">
          <p className="text-base font-semibold text-zinc-900 transition-colors">Zobacz Wszystkie Testy </p>
          <Link href="/testy-opiekun">
            <div className="h-9 w-9 flex items-center justify-center rounded-full bg-white hover:bg-[#ffa5a5]  cursor-pointer transition-al animate-pulse">
              <Image
                src="/right-arrow.png"
                alt="right arrow"
                width={36}
                height={36}
                className="object-cover h-3/4 w-3/4 "
              />
            </div>
          </Link>
        </div>
      </div>
      <div className="w-full lg:w-2/3 flex h-full gap-6 flex-wrap justify-center xl:justify-start">
        <TestInfoCard />
        <TestInfoCard />
      </div>
    </section>
  )
}
