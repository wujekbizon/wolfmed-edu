import CreateNoteForm from "../CreateNoteForm";
import ResizableComponent from "../Resizable";
import type { Cell } from '@/types/cellTypes'

interface NoteCellProps {
    cell?: Cell
}

export default function NoteCell({ cell }: NoteCellProps) {
    return (
        <ResizableComponent direction="vertical">
            <div className="flex flex-col h-full bg-white p-3 pb-6 rounded shadow-xl border border-zinc-200/60">
                <CreateNoteForm initialContent={cell?.content} />
            </div>
        </ResizableComponent>
    )
}