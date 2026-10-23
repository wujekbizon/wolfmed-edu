import { Clock, ClipboardCheck, FileText, Target } from 'lucide-react'
import ExamHubStats from '@/components/ExamHubStats'
import { PRACTICAL_PASSING_PERCENT } from '@/types/praktycznyTypes'
import type { PracticalBriefExamProps } from '@/types/practicalBriefTypes'

export default function PracticalBriefHeader({ exam }: PracticalBriefExamProps) {
  return (
    <header className='space-y-5'>
      <div className='w-full border-b border-zinc-200/70 pb-4'>
        <h1 className='text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl'>{exam.title}</h1>
      </div>
      <div className='grid gap-3 lg:grid-cols-2'>
        <ExamHubStats stats={[{ icon: <Clock size={16} />, value: `${exam.durationMinutes} min`, label: 'Czas trwania' }, { icon: <FileText size={16} />, value: String(exam.forms.length), label: 'Karty do uzupełnienia' }]} />
        <ExamHubStats stats={[{ icon: <ClipboardCheck size={16} />, value: String(exam.assessedTasks.length), label: 'Zadania oceniane' }, { icon: <Target size={16} />, value: `${PRACTICAL_PASSING_PERCENT}%`, label: 'Próg zaliczenia' }]} />
      </div>
    </header>
  )
}
