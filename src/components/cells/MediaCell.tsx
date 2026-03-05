import ResizableComponent from '../Resizable'
import MediaCellPlayer from './MediaCellPlayer'
import type { Cell } from '@/types/cellTypes'

export default function MediaCell({ cell }: { cell: Cell }) {
  return (
    <ResizableComponent direction="vertical">
      <div className="flex flex-col h-full bg-white rounded shadow-xl border border-zinc-200/60 overflow-hidden">
        <MediaCellPlayer cell={cell} />
      </div>
    </ResizableComponent>
  )
}
