import LearningPaginationButton from './LearningPaginationButton'

export default function LearningPaginationControls(props: {
  totalPages: number
  setCurrentPage: (page: number) => void
  currentPage: number
}) {
  const { currentPage, setCurrentPage, totalPages } = props
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4 py-4 mt-4">
      <LearningPaginationButton onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
        Poprzednia
      </LearningPaginationButton>

      <span className="text-zinc-700 text-sm sm:text-base text-center">
        Strona <span className="font-semibold text-red-500">{currentPage}</span> z{' '}
        <span className="font-semibold">{totalPages}</span>
      </span>

      <LearningPaginationButton onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage >= totalPages}>
        Następna
      </LearningPaginationButton>
    </div>
  )
}
