import { useQuestionSelectionStore } from '@/store/useQuestionSelectionStore'
import DeleteIcon from './icons/DeleteIcon'

export default function CategoryDeleteButton({ categoryId }: { categoryId: string }) {
  const { openDeleteModal } = useQuestionSelectionStore()
  return (
    <button
      type="button"
      className="flex items-center justify-center hover:bg-red-100 cursor-pointer px-2 rounded transition-colors"
      onClick={() => openDeleteModal(categoryId)}
    >
      <DeleteIcon />
    </button>
  )
}
