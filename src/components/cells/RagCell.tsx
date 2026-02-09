import ResizableComponent from '../Resizable'
import RagCellForm from './RagCellForm'

export default function RagCell({ cell }: { cell: { id: string; content: string } }) {
  return (
    <ResizableComponent direction="vertical">
        <div className="flex flex-col h-full bg-white p-3 pb-6 rounded shadow-xl border border-zinc-200/60">
            <RagCellForm cell={cell}/>
        </div>
    </ResizableComponent>
)
}
