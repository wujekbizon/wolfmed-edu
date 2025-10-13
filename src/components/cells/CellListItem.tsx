import { DynamicNoteCell } from '.'
import ActionBar from './ActionBar'
import type { Cell } from '@/types/cellTypes'


export default function CellListItem ({cell}: {cell: Cell}) {
  return (
    <div className="relative">
      {cell.type === 'note' && (
        <div className="border border-zinc-400/20 p-1.5 rounded bg-red-300/30">
          <div className="relative w-full h-10">
            <ActionBar cell={cell} />
          </div>
          <DynamicNoteCell />
        </div>
      )}
      {cell.type === 'text' && (
        <div className="border border-zinc-400/20 p-1.5 rounded bg-red-300/30">
          <div className="relative h-10 w-full">
            <ActionBar cell={cell} />
          </div>
          <DynamicNoteCell />
        </div>
      )}
      {cell.type === 'draw' && (
        <div className="border border-zinc-400/20 p-1.5 rounded bg-red-300/30">
          <div className="relative h-10 w-full bg-zinc-300">
            <ActionBar cell={cell} />
          </div>
          <DynamicNoteCell />
        </div>
      )}
    </div>
  )
}
