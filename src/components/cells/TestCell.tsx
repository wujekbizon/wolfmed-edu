import ResizableComponent from '../Resizable'
import TestCellPreview from './TestCellPreview'
import type { Cell } from '@/types/cellTypes'

export default function TestCell({ cell }: { cell: Cell }) {
  return (
    <ResizableComponent direction="vertical">
      <div className="flex flex-col h-full bg-white p-3 pb-6 rounded shadow-xl border border-zinc-200/60 overflow-hidden">
        <TestCellPreview cell={cell} />
      </div>
    </ResizableComponent>
  )
}
