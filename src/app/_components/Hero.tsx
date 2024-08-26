import Image from 'next/image'
import Link from 'next/link'

export default function Hero() {
  return (
    <section className="w-full gap-8 lg:w-3/4 flex flex-col items-center justify-around py-8 sm:py-16 px-4 sm:px-6 ">
      <h1 className="text-center animate-slideInDown opacity-0 [--slidein-delay:300ms] py-8 sm:py-16 font-semibold w-full lg:w-[80%] text-[35px] sm:text-[40px] leading-[35px] md:text-[50px] sm:leading-[55px] text-zinc-950">
        {' '}
        Edukacja <span className="font-bold text-[#ff5b5b]">medyczna</span> może być jeszcze łatwiejsza.
      </h1>
      <div className="relative w-full h-full md:h-[490px] xl:w-3/4 border rounded-3xl animate-slideInDown opacity-0 [--slidein-delay:500ms] border-red-200/40 shadow-lg shadow-zinc-400">
        <Image
          src="/hero.jpg"
          alt="person"
          width={800}
          height={600}
          priority
          className="h-full w-full object-cover rounded-3xl "
        />
        <div className="absolute right-[5%] bottom-[5%] animate-slideInDown opacity-0 [--slidein-delay:600ms]">
          <Link href="/#testy">
            <button className="bg-white text-lg animate-bounce md:text-xl font-semibold px-7 md:px-10 py-1 md:py-2 rounded-full border border-red-200/40 shadow-md shadow-zinc-500 hover:border-zinc-800 hover:bg-[#ff5b5b] transition-colors">
              Wybierz Test
            </button>
          </Link>
        </div>
      </div>
    </section>
  )
}
