import TestInfoCard from '@/components/TestInfoCard'
import { testCardContent } from '@/constants/testsCardContent'
import Image from 'next/image'
import Link from 'next/link'

export default function TestsSelection() {
  return (
    <section
      className="flex h-full w-full p-2 sm:p-4 md:p-8 py-8 sm:py-12 md:py-16 flex-col justify-center bg-[#e1b4b4] xl:flex-row items-center xl:items-start gap-8 xl:gap-4"
      id="testy"
    >
      <div className="w-full xl:w-[40%] flex flex-col gap-4 sm:gap-5 px-2 sm:px-6 md:px-10">
        <h2 className="font-medium w-full xl:w-[80%] text-center xl:text-left text-2xl sm:text-3xl md:text-4xl leading-tight text-zinc-950">
          Szeroki wybór testów i procedur.
        </h2>
        <p className="text-base sm:text-lg text-zinc-600 w-full xl:w-[90%] text-center xl:text-left">
          Wybieraj spośród ponad 500 testów obejmujących szeroką gamę odpowiednich tematów rozwoju zawodowego opiekunów
          medycznych!
        </p>
        <div className="flex items-center gap-2 justify-center xl:justify-start">
          <p className="text-base sm:text-lg font-semibold text-zinc-900 transition-colors">Zobacz Wszystkie Testy </p>
          <Link href="/testy-opiekun">
            <div className="h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center rounded-full bg-white hover:bg-[#ffa5a5] cursor-pointer transition-all animate-pulse">
              <Image
                src="/right-arrow.png"
                alt="right arrow"
                width={36}
                height={36}
                className="object-cover h-3/4 w-3/4"
              />
            </div>
          </Link>
        </div>
      </div>
      <div className="w-full xl:w-[60%] flex h-full gap-4 sm:gap-6 flex-wrap justify-center xl:justify-start">
        {testCardContent.map((card) => (
          <TestInfoCard card={card} key={card.title} />
        ))}
      </div>
    </section>
  )
}
