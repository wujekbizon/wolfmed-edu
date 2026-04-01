import ResizableComponent from '../Resizable'
import FlashcardCellPreview from './FlashcardCellPreview'
import type { Cell } from '@/types/cellTypes'

export default function FlashcardCell({ cell }: { cell: Cell }) {
  return (
    <ResizableComponent direction="vertical">
      <div className="flex flex-col h-full bg-white p-3 pb-6 rounded shadow-xl border border-zinc-200/60 overflow-hidden">
        <FlashcardCellPreview cell={cell} />
      </div>
    </ResizableComponent>
  )
}
