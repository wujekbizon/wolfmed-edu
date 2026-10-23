import ExamResultAnswerList from '@/components/ExamResultAnswerList'
import ExamResultScore from '@/components/ExamResultScore'
import { getExamUserAnswerText } from '@/helpers/getExamUserAnswerText'
import type { ExamResultFieldProps } from '@/types/practicalExamResultTypes'

export default function ExamResultField({ field, formId, answers }: ExamResultFieldProps) {
  const given = field.kind === 'choice' ? field.userSelections ?? [] : getExamUserAnswerText(answers[`${formId}:${field.fieldId}`])
  return (
    <section className='space-y-4 py-5'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
        <div className='min-w-0'><h3 className='text-sm font-semibold leading-relaxed text-zinc-800'>{field.label}</h3>
          {field.kind !== 'value' && <p className='mt-1 text-xs text-zinc-500'>{field.kind === 'list' ? `${field.earned} z ${field.max} wymaganych` : `${field.earned} z ${field.max} grup poprawnych`}</p>}
        </div>
        <div className='shrink-0'><ExamResultScore earned={field.earned} max={field.max} /></div>
      </div>
      <div className='grid gap-3 lg:grid-cols-2'>
        <ExamResultAnswerList label='Twoja odpowiedź' items={given} emptyText='Brak odpowiedzi' />
        <ExamResultAnswerList label={field.kind === 'list' ? 'Przykładowe poprawne odpowiedzi' : field.kind === 'choice' ? 'Poprawne pozycje' : 'Klucz odpowiedzi'} items={field.modelAnswers} emptyText='Wynik nie zawiera klucza dla tego pola.' />
      </div>
    </section>
  )
}
