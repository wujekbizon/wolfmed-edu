import { TestCardContent } from '@/constants/testsCardContent'
import Image from 'next/image'
import Link from 'next/link'

export default function TestInfoCard({ card }: { card: TestCardContent }) {
  return (
    <Link
      href={card.link}
      className="h-[470px] w-[90%] md:w-[350px] bg-zinc-50 flex flex-col transition-all justify-between px-8 pt-8 rounded-[30px] hover:bg-white border hover:border-zinc-400/90 border-red-200/40 shadow-md shadow-zinc-500"
    >
      <div className="flex h-full w-full flex-col gap-2">
        <p className="text-xs text-zinc-400">{card.category}</p>
        <h3 className="text-2xl text-zinc-900 font-semibold">{card.title}</h3>
        <p className="text-sm text-zinc-900 ">{card.content}</p>
        <div className="flex items-center justify-between mt-4">
          <div className="w-1/2 h-full flex items-center gap-2">
            <Image src="/upload.png" alt="date" width={28} height={28} />
            <div className="flex flex-col justify-center">
              <p className="text-xs text-zinc-400">Opublikowano</p>
              <p className="text-sm text-zinc-900 font-semibold">{card.date}</p>
            </div>
          </div>
          <div className="w-1/2 h-full flex items-center justify-end gap-2">
            <Image src="/stopwatch.png" alt="date" width={24} height={24} />
            <div className="flex flex-col">
              <p className="text-xs text-zinc-400">Liczba {card.testsLabel}</p>
              <p className="text-sm text-zinc-900 font-semibold">{card.testsNumber}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full h-full bg-cover bg-top" style={{ backgroundImage: `url(${card.image})` }}></div>
    </Link>
  )
}
