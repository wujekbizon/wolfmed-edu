import PaginationButton from './PaginationButton'

export default function PaginationControls(props: {
  totalPages: number
  setCurrentPage: (page: number) => void
  currentPage: number
}) {
  const { currentPage, setCurrentPage, totalPages } = props
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4 py-4 mt-4">
      <PaginationButton onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
        Poprzedna
      </PaginationButton>
      <span className="text-[#E6E6F5] rounded text-sm sm:text-base text-center">
        Page <span className="font-semibold text-sm sm:text-lg text-[#BB86FC]">{currentPage}</span> of{' '}
        <span className="font-semibold text-sm sm:text-lg">{totalPages}</span>
      </span>
      <PaginationButton onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage >= totalPages}>
        Następna
      </PaginationButton>
    </div>
  )
}
