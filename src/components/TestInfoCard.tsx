import { TestCardContent } from '@/constants/testsCardContent'
import Image from 'next/image'
import Link from 'next/link'

export default function TestInfoCard({ card }: { card: TestCardContent }) {
  return (
    <Link
      href={card.link}
      className="h-[450px] sm:h-[470px] w-full sm:w-[95%] md:w-[370px] bg-zinc-50 flex flex-col transition-all justify-between rounded-2xl sm:rounded-[30px] hover:bg-white border hover:border-zinc-400/90 border-red-200/40 shadow-md shadow-zinc-500"
    >
      <div className="flex h-full w-full flex-col gap-2 px-4 sm:px-6 md:px-8 pt-4 sm:pt-6 md:pt-8">
        <p className="text-xs text-zinc-400">{card.category}</p>
        <h3 className="text-xl sm:text-2xl text-zinc-900 font-semibold">{card.title}</h3>
        <p className="text-sm sm:text-base text-zinc-900">{card.content}</p>
        <div className="flex flex-col xs:flex-row items-center justify-between mt-2 xs:mt-4 gap-2">
          <div className="w-full xs:w-1/2 h-full flex items-center gap-2">
            <Image src="/upload.png" alt="date" width={20} height={20} className="w-5 h-5 sm:w-6 sm:h-6" />
            <div className="flex flex-col justify-center">
              <p className="text-xs text-zinc-400">Opublikowano</p>
              <p className="text-sm text-zinc-900 font-semibold">{card.date}</p>
            </div>
          </div>
          <div className="w-full xs:w-1/2 h-full flex items-center justify-start xs:justify-end gap-2">
            <Image src="/stopwatch.png" alt="date" width={20} height={20} className="w-5 h-5 sm:w-6 sm:h-6" />
            <div className="flex flex-col">
              <p className="text-xs text-zinc-400">Liczba {card.testsLabel}</p>
              <p className="text-sm text-zinc-900 font-semibold">{card.testsNumber}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full h-full flex items-center justify-center overflow-y-hidden">
        <Image src={card.image} alt={card.category} width={400} height={200} className="w-full h-full object-cover" />
      </div>
    </Link>
  )
}
