import { CompletedTest } from '@/types/dataTypes'
import Link from 'next/link'
import CompletedTestDeleteButton from './CompletedTestDeleteButton'
import { useStore } from '@/store/useStore'
import CompletedTestDeleteModal from './CompletedTestDeleteModal'

export default function CompletedTestCard({ completedTest }: { completedTest: CompletedTest }) {
  const { score, id, testResult, completedAt } = completedTest as CompletedTest
  const { isDeleteModalOpen, testIdToDelete } = useStore()

  const totalTests = testResult.length
  const correctAnswers = testResult.filter((result) => result.answer === true)

  return (
    <div className="relative flex flex-col gap-4 items-center justify-between rounded-xl border  border-red-200/60 bg-[#ffb1b1] shadow-md shadow-zinc-500 p-4 lg:w-2/3 xl:w-1/2">
      {isDeleteModalOpen && testIdToDelete === id && <CompletedTestDeleteModal testId={id} />}

      <p className="text-center text-base text-zinc-900 sm:text-lg">
        Odpowiedziałeś poprawnie na {correctAnswers.length} pytań
      </p>
      <div className="flex h-32 w-32 flex-col items-center justify-center gap-3 rounded-full border border-red-200/60 bg-gradient-to-r from-zinc-600 to-zinc-950 shadow-inner shadow-slate-950 sm:h-48 sm:w-48">
        <p className="text-center text-sm text-zinc-100 sm:text-lg">Wynik: </p>
        <p className="text-center text-base text-zinc-300 sm:text-2xl">
          <span className="text-2xl font-bold text-[#ff5b5b] sm:text-4xl">{score}</span>{' '}
          <span className="font-thin text-zinc-600">/</span> {totalTests}
        </p>
      </div>
      <div className="flex w-full flex-col items-center justify-between gap-4 md:flex-row">
        <Link
          href={`/testy-opiekun/wyniki/${id}`}
          className="bg-zinc-100 hover:bg-green-300 transition-colors py-2 px-4 rounded-md"
        >
          <p className="text-center text-xs text-zinc-800 sm:text-base font-semibold">Zobacz szczegóły testu.</p>
        </Link>
        <div className="flex gap-2">
          <p className="text-center text-xs text-zinc-800 sm:text-base">
            Test rozwiązany: {completedAt ? new Date(completedAt).toLocaleDateString('pl-PL') : 'Brak dostępnej daty'}
          </p>
          <CompletedTestDeleteButton testId={id} />
        </div>
      </div>
    </div>
  )
}
