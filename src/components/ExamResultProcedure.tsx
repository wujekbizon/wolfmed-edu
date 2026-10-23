import { CheckCircle2, CircleX } from 'lucide-react'
import ExamResultScore from '@/components/ExamResultScore'
import ExamResultAnswerList from '@/components/ExamResultAnswerList'
import type { ExamResultProcedureProps } from '@/types/practicalExamResultTypes'

export default function ExamResultProcedure({ procedure }: ExamResultProcedureProps) {
  return (
    <section className='overflow-hidden rounded-2xl border border-zinc-200 bg-white'>
      <header className='space-y-3 border-b border-zinc-100 bg-zinc-50 p-4 sm:p-6'><h2 className='text-lg font-bold text-zinc-900'>{procedure.title}</h2><ExamResultScore earned={procedure.earned} max={procedure.max} /></header>
      <ol className='divide-y divide-zinc-100 px-4 sm:px-6'>
        {procedure.correctSteps.map((step, index) => {
          const userStep = procedure.userSteps[index]
          const correct = userStep === step
          const Icon = correct ? CheckCircle2 : CircleX
          return <li key={index} className='space-y-3 py-5'>
            <h3 className={`flex items-center gap-2 text-sm font-semibold ${correct ? 'text-emerald-800' : 'text-rose-800'}`}><Icon size={17} />Pozycja {index + 1} · {correct ? 'Poprawna kolejność' : 'Do poprawy'}</h3>
            <div className='grid gap-3 lg:grid-cols-2'><ExamResultAnswerList label='Twoja kolejność' items={userStep ? [userStep] : []} emptyText='Brak odpowiedzi' /><ExamResultAnswerList label='Poprawna kolejność' items={[step]} emptyText='' /></div>
          </li>
        })}
      </ol>
    </section>
  )
}
