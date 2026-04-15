import { useDashboardStore } from '@/store/useDashboardStore'
import DeleteIcon from './icons/DeleteIcon'
import { Trash2 } from 'lucide-react'

export default function NoteDeleteButton({ noteId }: { noteId: string | null }) {
  const { openDeleteModal } = useDashboardStore()
  return (
    <button
      type="button"
      className="flex items-center justify-center cursor-pointer p-1.5 text-zinc-600 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors disabled:opacity-40 shrink-0"
      onClick={() => openDeleteModal(noteId)}
    >
      <Trash2 className='w-4 h-4' />
    </button>
  )
}