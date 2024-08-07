import Image from 'next/image'

export default function Home() {
  return (
    <section className="flex min-h-[83vh] flex-col w-full items-center justify-center">
      <div className="w-full gap-10 lg:w-3/4 flex flex-col items-center justify-evenly pt-10">
        <h1 className="text-center animate-slideInDown opacity-0 [--slidein-delay:300ms] py-2 font-semibold w-full lg:w-3/4 text-[35px] sm:text-[40px] leading-[35px] md:text-[50px] sm:leading-[55px] text-zinc-950">
          {' '}
          Edukacja <span className="font-bold text-[#fc8c8c]">medyczna</span> może być jeszcze łatwiejsza.
        </h1>
        <div className="animate-slideInDown opacity-0 [--slidein-delay:500ms]">
          <button className="bg-white text-2xl animate-bounce font-semibold px-10 py-4 rounded-full border-red-300/50 shadow-md shadow-zinc-400 hover:bg-[#ffb1b1] transition-colors">
            Wybierz Test
          </button>
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
      </div>
    </section>
  )
}
