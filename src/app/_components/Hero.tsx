import Image from 'next/image'
import Link from 'next/link'

export default function Hero() {
  return (
    <section className="w-full gap-16 lg:w-3/4 flex flex-col items-center justify-around pt-16">
      <h1 className="text-center animate-slideInDown opacity-0 [--slidein-delay:300ms] py-2 font-semibold w-full lg:w-[80%] text-[35px] sm:text-[40px] leading-[35px] md:text-[50px] sm:leading-[55px] text-zinc-950">
        {' '}
        Edukacja <span className="font-bold text-[#fc8c8c]">medyczna</span> może być jeszcze łatwiejsza.
      </h1>
      <div className="animate-slideInDown opacity-0 [--slidein-delay:500ms]">
        <Link href="/#testy">
          <button className="bg-white text-lg md:text-2xl animate-bounce font-semibold px-7 md:px-10 py-3 md:py-4 rounded-full border-red-300/50 shadow-md shadow-zinc-400 hover:bg-[#ffb1b1] transition-colors">
            Wybierz Test
          </button>
        </Link>
      </div>
      <div className="w-full xl:w-2/3 border rounded-3xl animate-slideInDown opacity-0 [--slidein-delay:700ms] border-red-300/50 shadow-lg shadow-zinc-400 ">
        <Image
          src="/hero.png"
          alt="person"
          width={800}
          height={600}
          priority
          className="h-full w-full object-cover rounded-3xl "
        />
      </div>
    </section>
  )
}
