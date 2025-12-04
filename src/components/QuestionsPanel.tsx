import { Test } from '@/types/dataTypes'
import QuestionTitlePreview from './QuestionTitlePreview'
import CategoryToggleButton from './CategoryToggleButton'
import SearchIcon from './icons/SearchIcon'

interface Props {
  questions: Test[]
  customCategories: {
    id: string
    name: string
    questionIds: string[]
  }[]
  searchQuery: string
  currentPage: number
  totalPages: number
  onSearch: (query: string) => void
  onPrevPage: () => void
  onNextPage: () => void
}

export default function QuestionsPanel({
  questions,
  customCategories,
  searchQuery,
  currentPage,
  totalPages,
  onSearch,
  onPrevPage,
  onNextPage,
}: Props) {
  return (
    <div className="lg:w-2/3 xl:w-3/4 flex flex-col bg-zinc-200/50 backdrop-blur-md border border-zinc-600/20 rounded-xl p-2 sm:p-4 shadow-md">
      <div className="z-10">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Szukaj pytań..."
            className="w-full h-9 sm:h-10 rounded-lg border border-zinc-600/20 bg-white/80 px-8 sm:px-9 focus:outline-none focus:ring-2 focus:ring-red-300/20 focus:border-zinc-800/50"
          />
          <SearchIcon className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto mt-2 sm:mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
          {questions.map((question) => (
            <div
              key={question.id}
              className="flex flex-col p-2 sm:p-4 rounded-lg border border-zinc-600/20 bg-white/80 hover:border-red-300/20 transition-colors shadow-sm"
            >
              <div className="flex flex-wrap gap-1.5 mb-3">
                {customCategories.map((category) => (
                  <CategoryToggleButton
                    key={category.id}
                    categoryId={category.id}
                    categoryName={category.name}
                    questionId={question.id}
                    isAdded={category.questionIds.includes(question.id)}
                  />
                ))}
              </div>
              <div className="flex-1">
                <QuestionTitlePreview question={question.data.question} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-2 sm:mt-4 bg-zinc-800/80 backdrop-blur-md py-1 sm:py-2 flex justify-between items-center px-1 sm:px-2 border-t border-zinc-600/20 rounded-lg">
        <button
          onClick={onPrevPage}
          disabled={currentPage === 1}
          className="px-1.5 py-0.5 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors text-zinc-100 text-xs"
        >
          ← Poprzednia
        </button>
        <span className="text-xs text-zinc-100 whitespace-nowrap">
          {currentPage}/{totalPages}
        </span>
        <button
          onClick={onNextPage}
          disabled={currentPage === totalPages}
          className="px-1.5 py-0.5 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors text-zinc-100 text-xs"
        >
          Następna →
        </button>
      </div>
    </div>
  )
}
