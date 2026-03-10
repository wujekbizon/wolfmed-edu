'use client'
import WigglyWord from './WigglyWord'

export default function HeroTitle() {
  return (
    <>
      <div className="animate-fadeInUp mb-4 flex justify-center lg:justify-start">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-red-300/40 bg-white/50 px-3 py-1 text-xs font-medium text-red-500 backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
          Nowoczesna platforma medyczna
        </span>
      </div>
      <h1 className="text-5xl sm:text-6xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-6 text-zinc-800">
        <WigglyWord text="Edukacja" startIdx={1} />
        {' '}
        <span className="text-[#ff5b5b]">
          <WigglyWord text="medyczna" startIdx={9} />
        </span>
        {' '}
        <WigglyWord text="może" startIdx={17} />
        {' '}
        <WigglyWord text="być" startIdx={21} />
        {' '}
        <WigglyWord text="jeszcze" startIdx={24} />
        {' '}
        <WigglyWord text="łatwiejsza." startIdx={31} />
      </h1>

      <p className="text-lg sm:text-xl lg:text-2xl text-zinc-700 mb-8 max-w-xl lg:max-w-2xl place-self-center lg:place-self-start animate-fadeInUp [--slidein-delay:1200ms] [animation-duration:0.9s]">
        Rozpocznij swoją podróż w świecie medycyny z naszą innowacyjną platformą edukacyjną.
      </p>
    </>
  )
}
