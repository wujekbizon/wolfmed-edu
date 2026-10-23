import { ArrowRight } from 'lucide-react'
import Button from '@/components/ui/Button'
import ExamResultScore from '@/components/ExamResultScore'
import type { ExamResultOverviewProps } from '@/types/practicalExamResultTypes'

export default function ExamResultOverview({ sections, onReview }: ExamResultOverviewProps) {
  return (
    <section className='rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6'>
      <h2 className='mb-2 text-lg font-bold text-zinc-900'>Punkty za poszczególne części</h2>
      <p className='mb-5 text-sm text-zinc-500'>Wybierz część arkusza, aby przejrzeć odpowiedzi.</p>
      <ul className='divide-y divide-zinc-100'>
        {sections.map((section) => <li key={`${section.tab}-${section.id}`} className='flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='min-w-0 space-y-2'><h3 className='text-sm font-semibold leading-relaxed text-zinc-800'>{section.title}</h3><ExamResultScore earned={section.earned} max={section.max} /></div>
          <Button variant='secondary' onClick={() => onReview(section)} className='min-h-11 shrink-0 text-sm'>Przejrzyj<ArrowRight size={16} /></Button>
        </li>)}
      </ul>
      {sections.length === 0 && <p className='text-sm text-zinc-500'>Wynik nie zawiera szczegółów poszczególnych części.</p>}
    </section>
  )
}
