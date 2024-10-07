import { SignedIn, SignedOut } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'

export default function Hero() {
  return (
    <section className="relative w-full h-[calc(100vh_-_70px)] gap-12 flex items-center justify-around py-4 sm:py-12 px-0 sm:px-6">
      <div className="absolute w-[90%] lg:w-[60%] p-4 rounded-xl animate-slideInDown opacity-0 [--slidein-delay:300ms] bg-white/80">
        <h1 className="text-center font-semibold  text-3xl xs:text-[35px] sm:text-[40px] leading-[35px] md:text-[50px] sm:leading-[55px] text-zinc-950">
          {' '}
          Edukacja <span className="font-bold text-[#ff5b5b]">medyczna</span> może być jeszcze łatwiejsza.
        </h1>
      </div>

      <Image
        src="/hero.webp"
        alt="person"
        width={1200}
        height={800}
        priority
        className="h-full w-full object-cover bg-top rounded-none sm:rounded-3xl"
      />
      <div className="absolute right-12 bottom-16 animate-slideInDown opacity-0 [--slidein-delay:600ms]">
        <SignedIn>
          <Link href="/testy-opiekun/nauka">
            <button className="bg-red-400 text-base sm:text-lg md:text-xl font-semibold px-7 md:px-10 py-1 md:py-2 rounded-full border border-red-200/40 shadow shadow-zinc-500 hover:border-zinc-800 hover:bg-[#ff5b5b] transition-colors">
              Rozpocznij naukę
            </button>
          </Link>
        </SignedIn>
        <SignedOut>
          <Link href="/sign-up">
            <button className="bg-red-400 text-base sm:text-lg md:text-xl font-semibold px-7 md:px-10 py-1 md:py-2 rounded-full border border-red-200/40 shadow shadow-zinc-500 hover:border-zinc-800 hover:bg-[#ff5b5b] transition-colors">
              Zarejestruj się
            </button>
          </Link>
        </SignedOut>
      </div>
    </section>
  )
}
