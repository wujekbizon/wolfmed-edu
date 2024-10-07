import HeroButton from '@/components/HeroButton'
import { SignedIn, SignedOut } from '@clerk/nextjs'
import Image from 'next/image'

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
          <HeroButton link="/testy-opiekun/nauka">Rozpocznij naukę</HeroButton>
        </SignedIn>
        <SignedOut>
          <HeroButton link="/sign-up">Zarejestruj się</HeroButton>
        </SignedOut>
      </div>
    </section>
  )
}
