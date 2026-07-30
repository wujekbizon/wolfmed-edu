'use client'

import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'

export default function ReaderFooterNav({
  currentSection,
  totalSections,
  isLastSection,
  onPrevious,
  onNext,
  onReset,
}: {
  currentSection: number
  totalSections: number
  isLastSection: boolean
  onPrevious: () => void
  onNext: () => void
  onReset: () => void
}) {
  const progressPct = Math.round(((currentSection + 1) / totalSections) * 100)

  return (
    <div className="shrink-0 border-t border-zinc-200 bg-white px-4 md:px-10 py-3 md:py-4 flex flex-col gap-2 md:gap-3">
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-slate-700 rounded-full"
            initial={false}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          />
        </div>
        <span className="text-xs font-semibold text-zinc-400 shrink-0 w-9 text-right">
          {progressPct}%
        </span>
      </div>

      <div className="flex gap-2 md:gap-3">
        <button
          onClick={onPrevious}
          disabled={currentSection === 0}
          className="flex items-center justify-center gap-1.5 px-4 py-2 md:px-5 md:py-2.5 bg-zinc-100 hover:bg-zinc-200 disabled:opacity-40 disabled:pointer-events-none text-zinc-700 text-xs md:text-sm font-medium rounded-lg md:rounded-xl border border-zinc-200 transition-colors shrink-0 whitespace-nowrap"
        >
          <ChevronLeft className="w-3.5 h-3.5 md:w-4 md:h-4" />
          Cofnij
        </button>

        <button
          onClick={isLastSection ? onReset : onNext}
          className="flex-1 lg:flex-none lg:min-w-52 flex items-center justify-center gap-1.5 md:gap-2 whitespace-nowrap px-4 py-2 md:px-5 md:py-2.5 text-white text-xs md:text-sm font-medium rounded-lg md:rounded-xl transition-colors bg-slate-700 hover:bg-slate-800"
        >
          {isLastSection ? (
            <>
              <RotateCcw className="w-3.5 h-3.5 md:w-4 md:h-4" />
              Zacznij od nowa
            </>
          ) : (
            <>
              Następna sekcja
              <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  )
}
