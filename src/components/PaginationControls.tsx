import { useSearchTermStore } from '@/store/useSearchTermStore'
import PaginationButton from './PaginationButton'

export default function PaginationControls(props: { totalPages: number }) {
  const { currentPage, setCurrentPage } = useSearchTermStore()
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4 py-2">
      <PaginationButton onCLick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
        Previous
      </PaginationButton>
      <span className="text-black rounded text-sm sm:text-base text-center">
        Page <span className="font-semibold text-sm sm:text-lg text-[#ff5656]">{currentPage}</span> of{' '}
        <span className="font-semibold text-sm sm:text-lg">{props.totalPages}</span>
      </span>
      <PaginationButton onCLick={() => setCurrentPage(currentPage + 1)} disabled={currentPage >= props.totalPages}>
        Next
      </PaginationButton>
    </div>
  )
}
