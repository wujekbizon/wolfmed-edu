'use client'

import { ClipboardList } from 'lucide-react'
import ExamSectionHeader from '@/components/ExamSectionHeader'
import ExamValueField from '@/components/ExamValueField'
import ExamChoiceField from '@/components/ExamChoiceField'
import ExamListField from '@/components/ExamListField'
import type { ExamFormCardProps } from '@/types/practicalExamWorkspaceTypes'

export default function ExamFormCard(props: ExamFormCardProps) {
  const { exam, form, index } = props
  return (
    <section className='overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm'>
      <ExamSectionHeader icon={ClipboardList} badge={`Karta ${index + 1} z ${exam.forms.length}`} title={form.title} subtitle={form.intro} />
      <div className='grid grid-cols-1 gap-6 p-4 sm:p-6 lg:grid-cols-2'>
        {form.fields.map((field) => {
          const fieldProps = {
            formState: props.formState,
            fieldKey: `${form.id}:${field.id}`,
            inputId: `${form.id}-${field.id}`,
            answers: props.answers,
            onValueChange: props.onValueChange,
            onListLineChange: props.onListLineChange,
            onChoiceToggle: props.onChoiceToggle,
          }
          if (field.kind === 'value') return <ExamValueField key={field.id} field={field} {...fieldProps} />
          return (
            <div key={field.id} className='min-w-0 lg:col-span-2'>
              {field.kind === 'choice' ? <ExamChoiceField field={field} {...fieldProps} /> : <ExamListField field={field} {...fieldProps} />}
            </div>
          )
        })}
      </div>
    </section>
  )
}
