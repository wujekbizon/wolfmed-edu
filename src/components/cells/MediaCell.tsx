import ResizableComponent from '../Resizable'
import MediaCellPlayer from './MediaCellPlayer'
import type { Cell } from '@/types/cellTypes'

export default function MediaCell({ cell }: { cell: Cell }) {
  return (
    <ResizableComponent direction="vertical">
      <div className="flex flex-col h-full bg-gradient-to-br from-zinc-900 via-zinc-800 to-purple-950 rounded-xl shadow-2xl overflow-hidden">
        <MediaCellPlayer cell={cell} />
      </div>
    </ResizableComponent>
  )
}
