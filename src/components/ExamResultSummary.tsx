import { CheckCircle2, CircleX } from 'lucide-react'
import { PRACTICAL_PASSING_PERCENT } from '@/types/praktycznyTypes'
import type { ExamResultSummaryProps } from '@/types/practicalExamResultTypes'

export default function ExamResultSummary({ result }: ExamResultSummaryProps) {
  const Icon = result.passed ? CheckCircle2 : CircleX
  return (
    <section aria-label='Wynik arkusza' role='status' className='rounded-2xl border border-white/10 bg-linear-to-br from-zinc-800 to-zinc-950 p-5 text-white shadow-lg sm:p-7'>
      <p className={`flex items-center gap-2 text-sm font-semibold ${result.passed ? 'text-emerald-300' : 'text-rose-300'}`}><Icon size={19} />{result.passed ? 'Arkusz zaliczony' : 'Arkusz niezaliczony'}</p>
      <dl className='mt-5 grid grid-cols-2 gap-x-5 gap-y-6 sm:grid-cols-3'>
        <div className='col-span-2 sm:col-span-1'><dt className='text-xs text-zinc-300'>Twój wynik</dt><dd className='mt-2 text-5xl font-bold text-[#ff9898] tabular-nums'>{result.percent}%</dd></div>
        <div><dt className='text-xs text-zinc-300'>Zdobyte punkty</dt><dd className='mt-2 text-2xl font-bold tabular-nums sm:text-3xl'>{result.earned}<span className='text-base font-normal text-zinc-400'> / {result.max}</span></dd></div>
        <div><dt className='text-xs text-zinc-300'>Próg zaliczenia</dt><dd className='mt-2 text-2xl font-bold tabular-nums sm:text-3xl'>{PRACTICAL_PASSING_PERCENT}%</dd></div>
      </dl>
    </section>
  )
}
