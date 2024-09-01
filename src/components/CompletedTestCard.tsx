import { CompletedTest } from '@/types/dataTypes'
import Link from 'next/link'

export default function CompletedTestCard({ completedTest }: { completedTest: CompletedTest }) {
  const { score, id, testResult, completedAt } = completedTest as CompletedTest

  const totalTests = testResult.length
  const correctAnswers = testResult.filter((result) => result.answer === true)

  return (
    <Link
      href={`/testy-opiekun/wyniki/${id}`}
      className="flex w-full flex-col items-center justify-between gap-4 rounded-xl border transition-colors border-red-200/60 bg-[#ffb1b1] shadow-md shadow-zinc-500 p-4  hover:bg-[#f58a8a] lg:w-2/3 xl:w-1/2"
    >
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
      <div className="flex w-full flex-col items-center justify-between md:flex-row">
        <p className="text-center text-xs text-stone-700 sm:text-sm">Kliknij by dowiedzieć się więcej informacji.</p>
        <p className="text-center text-xs text-stone-700 sm:text-sm">
          Test rozwiązany: {completedAt?.toLocaleDateString()}
        </p>
      </div>
    </Link>
  )
}
