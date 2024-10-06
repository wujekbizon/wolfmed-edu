import DeleteIcon from './icons/DeleteIcon'
import { useStore } from '@/store/useStore'

export default function CompletedTestDeleteButton({ testId }: { testId: string | null }) {
  const { openDeleteModal } = useStore()
  return (
    <button
      type="button"
      className="flex items-center justify-center bg-red-500/40 hover:bg-red-500/70 cursor-pointer px-2 rounded"
      onClick={() => openDeleteModal(testId)}
    >
      <DeleteIcon />
    </button>
  )
}
