'use client'
import WigglyWord from './WigglyWord'

export default function HeroTitle() {
  return (
    <>
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-zinc-800">
        <WigglyWord text="Edukacja" startIdx={1} />
        {' '}
        <span className="text-[#ff5b5b]">
          <WigglyWord text="medyczna" startIdx={9} />
        </span>
        <br />
        <WigglyWord text="może" startIdx={17} />
        {' '}
        <WigglyWord text="być" startIdx={21} />
        {' '}
        <WigglyWord text="jeszcze" startIdx={24} />
        {' '}
        <WigglyWord text="łatwiejsza." startIdx={31} />
      </h1>

      <p className="text-lg text-zinc-600 mb-8 max-w-xl place-self-center lg:place-self-start animate-fadeInUp [--slidein-delay:600ms]">
        Rozpocznij swoją podróż w świecie medycyny z naszą innowacyjną platformą edukacyjną.
      </p>
    </>
  )
}
