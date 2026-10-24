import type { ExamResultAnswerListProps } from '@/types/practicalExamResultTypes'

export default function ExamResultAnswerList({ label, items, emptyText }: ExamResultAnswerListProps) {
  return (
    <div className='min-w-0 rounded-xl border border-zinc-200 bg-zinc-50/60 p-4'>
      <h4 className='mb-2 text-xs font-semibold text-zinc-500'>{label}</h4>
      {items.length > 0 ? <ul className='space-y-2'>{items.map((item, index) => <li key={index} className='break-words whitespace-pre-line text-sm leading-relaxed text-zinc-700'>{item}</li>)}</ul> : <p className='text-sm text-zinc-500'>{emptyText}</p>}
    </div>
  )
}
