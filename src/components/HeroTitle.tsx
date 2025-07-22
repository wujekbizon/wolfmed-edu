'use client'

export default function HeroTitle() {
  return (
    <>
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-zinc-800 leading-16">
        <span className="animate-fadeInUp inline-block">Edukacja </span>{' '}
        <span className="text-[#ff5b5b] animate-scaleIn [--slidein-delay:200ms] inline-block"> medyczna</span>
        <br />
        <span className="animate-fadeInUp [--slidein-delay:400ms] inline-block">może być jeszcze łatwiejsza.</span>
      </h1>

      <p className="text-lg text-zinc-600 mb-8 max-w-xl place-self-center lg:place-self-start animate-fadeInUp [--slidein-delay:600ms]">
        Rozpocznij swoją podróż w świecie medycyny z naszą innowacyjną platformą edukacyjną.
      </p>
    </>
  )
}
