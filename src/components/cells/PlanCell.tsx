import ResizableComponent from '../Resizable'
import PlanCellPreview from './PlanCellPreview'
import type { Cell } from '@/types/cellTypes'

export default function PlanCell({ cell }: { cell: Cell }) {
  return (
    <ResizableComponent direction="vertical">
      <div className="flex flex-col h-full bg-white rounded-xl overflow-hidden border border-zinc-200">
        <PlanCellPreview cell={cell} />
      </div>
    </ResizableComponent>
  )
}
