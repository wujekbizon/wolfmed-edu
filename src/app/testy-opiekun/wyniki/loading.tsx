'use client'

import { getQuestionWord } from '@/helpers/textHelpers'
import { SKELETON_CARDS } from '@/constants/skeletonCards'
export default function Loading() {
  return (
    <div className="flex w-full flex-col items-center gap-6 overflow-y-auto p-2 scrollbar-webkit lg:p-5">
      <div className="flex justify-end w-full">
        <select className="p-2 rounded-full text-xs sm:text-sm border-red-200/40 bg-white shadow shadow-zinc-500 cursor-pointer outline-none">
          <option value="dateDesc">Od Najnowszych</option>
        </select>
      </div>

      {[...Array(SKELETON_CARDS)].map((_, index) => (
        <div
          key={index}
          className="relative flex flex-col gap-4 items-center justify-between rounded-xl border border-red-200/60 bg-[#ffb1b1] shadow-md shadow-zinc-500 p-4 w-full lg:w-2/3 xl:w-1/2"
        >
          <p className="text-center text-sm text-zinc-900 sm:text-base md:text-lg">
            Odpowiedziałeś poprawnie na <span className="bg-[#ffcece] blur-sm animate-pulse rounded px-2">-</span>{' '}
            {getQuestionWord(0)}
          </p>
          <div className="flex h-32 w-32 flex-col items-center justify-center gap-3 rounded-full border border-red-200/60 bg-gradient-to-r from-zinc-600 to-zinc-950 shadow-inner shadow-slate-950 sm:h-48 sm:w-48">
            <p className="text-center text-sm text-zinc-100 sm:text-lg">Wynik: </p>
            <p className="text-center text-base text-zinc-300 sm:text-2xl blur-sm">
              <span className="text-2xl font-bold text-[#ff5b5b] sm:text-4xl bg-zinc-700 animate-pulse rounded px-2">
                -
              </span>{' '}
              <span className="font-thin text-zinc-600">/</span>{' '}
              <span className="bg-zinc-700 animate-pulse rounded px-2">-</span>
            </p>
          </div>
          <div className="flex w-full flex-col items-center justify-between gap-4 md:flex-row">
            <div className="bg-zinc-100 py-2 px-4 rounded-md">
              <p className="text-center text-xs text-zinc-800 sm:text-base font-semibold">Zobacz szczegóły testu.</p>
            </div>
            <div className="flex gap-2 items-center">
              <p className="text-center text-xs text-zinc-800 sm:text-base">
                Test rozwiązany: <span className="animate-pulse rounded px-2">--/--/----</span>
              </p>
              <div className="w-12 h-6 bg-red-500/40 animate-pulse rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
