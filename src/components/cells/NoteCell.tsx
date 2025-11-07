import CreateNoteForm from "../CreateNoteForm";
import ResizableComponent from "../Resizable";

export default function NoteCell() {
    return (
        <ResizableComponent direction="vertical">
            <div className="flex flex-col h-full bg-white p-3 pb-6 rounded shadow-xl border border-zinc-200/60">
                <CreateNoteForm />
            </div>
        </ResizableComponent>
    )
}