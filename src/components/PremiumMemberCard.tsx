import Image from 'next/image'
import Link from 'next/link'

export default function PremiumMemberCard() {
  return (
    <div className="relative h-full sm:h-[360px] w-[95%] xs:w-[90%] sm:w-[300px] bg-zinc-950 flex flex-col transition-all items-center justify-between p-8 rounded-3xl shadow-md shadow-zinc-900">
      <div className="flex w-full items-center justify-center border-b border-zinc-400/20 pb-2">
        <div className="flex flex-col justify-center items-center">
          <h2 className="text-base font-semibold text-red-600">Serducho</h2>
          <h4 className="text-sm text-zinc-400">
            <span className="text-2xl font-semibold text-white ">49.99</span> zł
          </h4>
        </div>
      </div>
      <div className="w-60 h-60 flex items-center justify-center">
        <Image
          className="h-full w-full object-cover animate-pulse"
          width={800}
          height={600}
          src="/heart.webp"
          alt="red-heart"
        />
      </div>
      <Link
        href="/konto-premium"
        className="absolute bottom-0 left-0 right-0 bg-red-600/60 z-10 py-3 rounded-br-2xl rounded-bl-2xl text-center font-semibold text-white text-xl hover:bg-red-600 transition-colors"
      >
        Wesprzyj nas
      </Link>
    </div>
  )
}
