import { Check } from 'lucide-react'
import type { ProblematicQuestion } from '@/types/analyticsTypes'

export default function ProblematicQuestionCard({ question }: { question: ProblematicQuestion }) {
  return (
    <div className='p-3 sm:p-4 bg-zinc-50 rounded-lg border border-zinc-200 hover:border-zinc-300 hover:bg-white transition-colors'>
      <span className='inline-flex px-2.5 py-1 text-xs font-semibold bg-white text-zinc-600 rounded-full border border-zinc-200'>
        {question.category}
      </span>

      <p className='mt-3 text-sm font-medium text-slate-900 leading-relaxed'>
        {question.questionText}
      </p>

      <div className='mt-3 flex items-start gap-2 rounded-lg border border-zinc-200 bg-white px-2.5 py-2'>
        <Check className='w-3.5 h-3.5 mt-0.5 shrink-0 text-zinc-400' />
        <span className='text-xs font-semibold text-zinc-700 break-words'>
          {question.correctAnswer}
        </span>
      </div>

      <div className='mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2'>
        <p className='text-xs text-zinc-500'>
          Rozwiązane {question.timesAnswered} razy · Poprawne {question.timesCorrect} razy
        </p>
        <div className='flex items-center gap-3'>
          <div className='relative flex-1 sm:flex-none sm:w-32 h-1.5 bg-zinc-200 rounded-full overflow-hidden'>
            <div
              className='absolute inset-y-0 left-0 bg-gradient-to-r from-[#ff9898] to-[#f65555] rounded-full transition-all duration-300'
              style={{ width: `${question.errorRate}%` }}
            />
          </div>
          <span className='shrink-0 text-sm font-bold text-[#f65555] tabular-nums whitespace-nowrap'>
            {question.errorRate.toFixed(1)}% błędów
          </span>
        </div>
      </div>
    </div>
  )
}
