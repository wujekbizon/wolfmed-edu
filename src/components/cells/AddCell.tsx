import { cellButtons } from '@/constants/cellButtons'
import { useCellsStore } from '@/store/useCellsStore'
import SaveCellsButton from './SaveCellsButton'
import { SyncCellsButton } from './SyncCellsButton'

interface AddCellProps {
  prevCellId: string | null
  forceVisible?: boolean
  isPremium?: boolean
}

export default function AddCell({ prevCellId, forceVisible, isPremium = false }: AddCellProps) {
  const { insertCellAfter } = useCellsStore()

  return (
    <div
      className={`relative my-3 transition-opacity duration-300 ease-in ${forceVisible ? 'opacity-100' : 'opacity-40 hover:opacity-100 md:opacity-0'
        }`}
    >
      <div className="relative flex flex-wrap items-center justify-center gap-2 sm:gap-3 z-10">
      <SaveCellsButton />
      <SyncCellsButton />
        {cellButtons.map(({ id, type, cellName }) => {
          const isLocked = (type === 'rag' || type === 'test') && !isPremium
          return (
            <button
              key={id}
              onClick={() => !isLocked && insertCellAfter(prevCellId, type)}
              disabled={isLocked}
              title={isLocked ? 'Tylko dla użytkowników premium' : undefined}
              className={`flex items-center justify-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm md:text-base font-medium border rounded-lg shadow-sm transition-all duration-300 focus:outline-none focus:ring-2 ${
                isLocked
                  ? 'text-zinc-400 bg-zinc-100 border-zinc-200 cursor-not-allowed'
                  : 'text-zinc-700 hover:text-white bg-white/80 hover:bg-[#ff9898] backdrop-blur-sm border-zinc-200 focus:ring-[#ff9898]/50'
              }`}
            >
              <span className="text-lg leading-none font-semibold">+</span>
              <span>{cellName}</span>
            </button>
          )
        })}
      </div>

      <div className="absolute top-1/2 border-b border-zinc-200 z-0 w-full" />
    </div>
  )
}