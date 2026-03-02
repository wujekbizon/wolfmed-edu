import { DynamicExcalidraw, DynamicNoteCell, DynamicRagCell, DynamicTestCellPreview } from '.'
import ActionBar from './ActionBar'
import type { Cell } from '@/types/cellTypes'


export default function CellListItem ({ cell, isPremium = false }: { cell: Cell; isPremium?: boolean }) {
  return (
    <div className="relative">
      {cell.type === 'note' && (
        <div className="border border-zinc-400/20 p-1.5 rounded bg-red-300/30">
          <div className="relative w-full h-10">
            <ActionBar cell={cell} />
          </div>
          <DynamicNoteCell cell={cell} />
        </div>
      )}
      {cell.type === 'rag' && (
        <div className="border border-zinc-400/20 p-1.5 rounded bg-red-300/30">
          <div className="relative h-10 w-full">
            <ActionBar cell={cell} />
          </div>
          <DynamicRagCell cell={cell} isPremium={isPremium} />
        </div>
      )}
      {cell.type === 'draw' && (
        <div className="border border-zinc-400/20 p-1.5 rounded bg-red-300/30">
          <div className="relative h-10 w-full">
            <ActionBar cell={cell} />
          </div>
          <DynamicExcalidraw cell={cell} />
        </div>
      )}
      {cell.type === 'test' && (
        <div className="border border-zinc-400/20 p-1.5 rounded bg-red-300/30">
          <div className="relative h-10 w-full">
            <ActionBar cell={cell} />
          </div>
          <DynamicTestCellPreview cell={cell} />
        </div>
      )}
    </div>
  )
}
