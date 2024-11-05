import TestInfoCard from '@/components/TestInfoCard'
import { testCardContent } from '@/constants/testsCardContent'
import Image from 'next/image'
import Link from 'next/link'
import { SignedIn, SignedOut } from '@clerk/nextjs'

export default function TestsSelection() {
  return (
    <section className="relative w-full bg-gradient-to-b from-[#e1b4b4] to-[#f8e3e3] py-12 sm:py-16 md:py-20" id="testy">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 mix-blend-overlay">
        <Image src="/member.webp" alt="background pattern" fill className="object-cover" priority />
      </div>

      <div className="container relative mx-auto px-3 sm:px-4">
        {/* Header Section */}
        <div className="relative mb-10 sm:mb-16 flex flex-col items-center text-center">
          <span className="mb-3 sm:mb-4 inline-block rounded-full bg-red-100 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-red-800">
            Baza Wiedzy
          </span>
          <h2 className="mb-4 sm:mb-6 max-w-2xl text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-zinc-900 px-2">
            Szeroki wybór testów i procedur
          </h2>
          <p className="mb-6 sm:mb-8 max-w-3xl text-base sm:text-lg text-zinc-700 px-3">
            Wybieraj spośród ponad 500 testów obejmujących szeroką gamę odpowiednich tematów rozwoju zawodowego
            opiekunów medycznych!
          </p>

          {/* CTA Section */}
          <div className="flex items-center gap-3 sm:gap-4">
            <SignedIn>
              <Link
                href="/testy-opiekun"
                className="group flex items-center gap-2 sm:gap-3 rounded-full bg-white px-4 sm:px-6 py-2.5 sm:py-3 shadow-lg transition-all hover:bg-red-50"
              >
                <span className="text-sm sm:text-base font-semibold text-zinc-900">Zobacz Wszystkie Testy</span>
                <div className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-red-100 transition-transform group-hover:translate-x-1">
                  <Image src="/right-arrow.png" alt="arrow" width={20} height={20} className="h-3 w-3 sm:h-4 sm:w-4" />
                </div>
              </Link>
            </SignedIn>
            <SignedOut>
              <div className="rounded-full bg-red-50 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-red-900">
                Zarejestruj się, aby uzyskać dostęp
              </div>
            </SignedOut>
          </div>
        </div>

        {/* Cards Section */}
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 px-2">
          {testCardContent.map((card) => (
            <TestInfoCard key={card.title} card={card} />
          ))}
        </div>
      </div>
    </section>
  )
}
