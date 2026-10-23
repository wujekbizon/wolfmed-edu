import { Check, Package, ListOrdered } from 'lucide-react'
import ExamSectionHeader from '@/components/ExamSectionHeader'
import OrderableSteps from '@/components/OrderableSteps'
import type { PracticalExamTaskProps } from '@/types/practicalExamWorkspaceTypes'

export default function PracticalExamTask({ task, onOrderChange }: PracticalExamTaskProps) {
  return (
    <section className='overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm'>
      <ExamSectionHeader icon={task.type === 'equipment' ? Package : ListOrdered} badge={task.type === 'equipment' ? 'Zestaw do przygotowania' : 'Czynności — ułóż w kolejności'} title={task.title} />
      {task.type === 'equipment' ? (
        <ul className='grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 sm:p-6'>
          {task.items.map((item, index) => <li key={index} className='flex items-start gap-3 border-b border-zinc-100 py-3 text-sm leading-relaxed text-zinc-700'><Check size={18} className='mt-0.5 shrink-0 text-[#9373b1]' />{item}</li>)}
        </ul>
      ) : <div className='p-4 sm:p-6'><OrderableSteps steps={task.items} onOrderChange={onOrderChange} /></div>}
    </section>
  )
}
