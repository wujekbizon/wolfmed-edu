import DeleteIcon from './icons/DeleteIcon'
import { useStore } from '@/store/useStore'

export default function CompletedTestDeleteButton({ testId }: { testId: string | null }) {
  const { openDeleteModal } = useStore()
  return (
    <button
      type="button"
      aria-label="Usuń wynik testu"
      className="completed-result-delete-button"
      onClick={() => openDeleteModal(testId)}
    >
      <DeleteIcon />
    </button>
  )
}
