import { CompletedTest } from '@/types/dataTypes'
import Link from 'next/link'

export default function CompletedTestCard({ completedTest }: { completedTest: CompletedTest }) {
  const { score, id, testResult, completedAt } = completedTest as CompletedTest

  const totalTests = testResult.length
  const correctAnswers = testResult.filter((result) => result.answer === true)

  return (
    <Link
      href={`/testy-opiekun/wyniki/${id}`}
      className="flex w-full flex-col items-center justify-between gap-4 rounded-xl border border-border/40 bg-zinc-950 p-4  hover:bg-zinc-900 lg:w-2/3"
    >
      <p className="text-center text-sm text-stone-400 sm:text-base">
        You answered correctly to {correctAnswers.length} questions
      </p>
      <div className="flex h-32 w-32 flex-col items-center justify-center gap-3 rounded-full border border-border/40 bg-gradient-to-r from-gray-700 to-gray-900 shadow-inner shadow-slate-950 sm:h-48 sm:w-48">
        <p className="text-center text-sm text-muted-foreground sm:text-base">Your score: </p>
        <p className="text-center text-base text-muted-foreground sm:text-2xl">
          <span className="text-2xl font-bold text-amber-500 sm:text-4xl">{score}</span>{' '}
          <span className="font-thin text-stone-700">/</span> {totalTests}
        </p>
      </div>
      <div className="flex w-full flex-col items-center justify-between md:flex-row">
        <p className="text-center text-xs text-stone-700 sm:text-sm">Click for more detailed information</p>
        <p className="text-center text-xs text-stone-700 sm:text-sm">
          Test created at: {completedAt?.toLocaleDateString()}
        </p>
      </div>
    </Link>
  )
}
