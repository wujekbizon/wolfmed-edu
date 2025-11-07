import TestInfoCard from '@/components/TestInfoCard'
import { testCardContent } from '@/constants/testsCardContent'

export default function TestsSelection() {
  return (
    <section
      className="relative w-full py-12 sm:py-16 md:py-20"
      id="testy"
    >
      <div className="container relative mx-auto">
        <div className="relative mb-10 sm:mb-12 flex flex-col items-center text-center">
          <span className="mb-3 sm:mb-4 inline-block rounded-full bg-red-200 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-red-800">
            Baza Wiedzy
          </span>
          <h2 className="mb-4 sm:mb-6 max-w-2xl text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-zinc-900 px-2">
            Szeroki wybór testów i procedur
          </h2>
          <p className="mb-6 sm:mb-8 max-w-3xl text-base sm:text-lg text-zinc-700 px-3">
            Wybieraj spośród ponad 600 testów obejmujących szeroką gamę odpowiednich tematów rozwoju zawodowego
            opiekunów medycznych!
          </p>
        </div>
        <div className="w-full flex flex-wrap justify-center gap-4 sm:gap-6">
          {testCardContent.map((card) => (
            <TestInfoCard key={card.title} card={card} />
          ))}
        </div>
      </div>
    </section>
  )
}
