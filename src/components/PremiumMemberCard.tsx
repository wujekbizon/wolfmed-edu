import Image from 'next/image'
import Link from 'next/link'

export default function PremiumMemberCard() {
  return (
    <div className="relative h-full sm:h-[480px] w-[95%] xs:w-[90%] sm:w-[380px] mt-10 border border-red-600 bg-zinc-950 flex flex-col transition-all justify-between p-8 rounded-3xl shadow-md shadow-zinc-900">
      <div className="flex w-full items-center justify-center border-b border-zinc-400/20 pb-7">
        <div className="flex flex-col justify-center">
          <h2 className="text-lg font-semibold text-red-600">Serducho</h2>
          <h4 className="text-sm text-zinc-400 mt-1">
            <span className="text-3xl font-semibold text-white ">49.99</span> zł
          </h4>
        </div>
      </div>
      <Image className="h-full w-full object-cover" width={800} height={600} src="/heart.webp" alt="golden-chamomile" />
      <Link
        href="/konto-premium"
        className="absolute bottom-0 left-0 right-0 bg-red-600/80 z-10 py-3 rounded-br-2xl rounded-bl-2xl text-center font-semibold text-white text-xl hover:bg-red-600 transition-colors"
      >
        Wesprzyj nas
      </Link>
    </div>
  )
}
