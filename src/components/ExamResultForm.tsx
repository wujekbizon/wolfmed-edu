import ExamResultScore from '@/components/ExamResultScore'
import ExamResultField from '@/components/ExamResultField'
import type { ExamResultFormProps } from '@/types/practicalExamResultTypes'

export default function ExamResultForm({ form, answers }: ExamResultFormProps) {
  return (
    <section className='overflow-hidden rounded-2xl border border-zinc-200 bg-white'>
      <header className='space-y-3 border-b border-zinc-100 bg-zinc-50 p-4 sm:p-6'><h2 className='text-lg font-bold text-zinc-900'>{form.title}</h2><ExamResultScore earned={form.earned} max={form.max} /></header>
      <div className='divide-y divide-zinc-100 px-4 sm:px-6'>{form.fields.map((field) => <ExamResultField key={field.fieldId} field={field} formId={form.formId} answers={answers} />)}</div>
    </section>
  )
}
