import Image from 'next/image'
import type { TestCardContent } from '@/constants/testsCardContent'
import InfoCardAuthStatus from './InfoCardAuthStatus'

export default function TestInfoCard({ card }: { card: TestCardContent }) {
  return (
    <div className="flex h-[450px] sm:h-[500px] flex-col w-full lg:max-w-sm overflow-hidden rounded-2xl bg-zinc-900 transition-all border border-zinc-800 shadow-lg hover:shadow-xl hover:shadow-red-900/10 hover:border-red-900/20">
      {/* Card Image */}
      <div className="relative h-40 sm:h-48 w-full overflow-hidden rounded-t-2xl">
        <Image
          src={card.image}
          alt={card.category}
          width={400}
          height={200}
          className="h-full w-full object-cover"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-t from-zinc-900/40 to-transparent" />
        <span className="absolute left-3 sm:left-4 top-3 sm:top-4 rounded-full bg-red-100/90 px-2.5 sm:px-3 py-1 text-xs font-medium text-red-900 backdrop-blur-sm">
          {card.category}
        </span>
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col justify-between p-4 sm:p-6">
        <div className="space-y-1.5 sm:space-y-2">
          <h3 className="line-clamp-2 text-lg sm:text-xl font-bold text-zinc-100">{card.title}</h3>
          <p className="line-clamp-2 text-xs sm:text-sm text-zinc-400">{card.content}</p>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 border-t border-zinc-700/50 pt-3 sm:pt-4">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-red-900/10 p-1.5 sm:p-2">
                <Image
                  src="https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5sBPZa9Wj5zfQ3u7I8bUgG0ydxCaMOwLKeVP6"
                  alt="calendar"
                  width={16}
                  height={16}
                  className="h-3 w-3 sm:h-4 sm:w-4 opacity-70"
                  priority
                />
              </div>
              <div>
                <p className="text-[10px] sm:text-xs text-zinc-500">Data publikacji</p>
                <p className="text-xs sm:text-sm font-medium text-zinc-300">{card.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-red-900/10 p-1.5 sm:p-2">
                <Image
                  src="https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5wuF8wystcXZNvjLlr5ady1QbVDuRB7qTC8fU"
                  alt="timer"
                  width={16}
                  height={16}
                  className="h-3 w-3 sm:h-4 sm:w-4 opacity-70"
                  priority
                />
              </div>
              <div>
                <p className="text-[10px] sm:text-xs text-zinc-500">{card.testsLabel}</p>
                <p className="text-xs sm:text-sm font-medium text-zinc-300">{card.testsNumber}</p>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="flex items-center justify-center border-t border-zinc-700/50 pt-3 sm:pt-4">
            <InfoCardAuthStatus card={card} />
          </div>
        </div>
      </div>
    </div>
  )
}
