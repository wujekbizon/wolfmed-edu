import { useDashboardStore } from '@/store/useDashboardStore'
import DeleteIcon from './icons/DeleteIcon'

export default function NoteDeleteButton({ noteId }: { noteId: string | null }) {
  const { openDeleteModal } = useDashboardStore()
  return (
    <button
      type="button"
      className="flex items-center justify-center bg-red-500/40 hover:bg-red-500/70 cursor-pointer px-2 rounded"
      onClick={() => openDeleteModal(noteId)}
    >
      <DeleteIcon />
    </button>
  )
}