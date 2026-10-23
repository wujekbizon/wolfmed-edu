import Checkbox from '@/components/ui/Checkbox'
import FieldError from '@/components/FieldError'
import type { ExamChoiceFieldProps } from '@/types/practicalExamWorkspaceTypes'

export default function ExamChoiceField({ field, fieldKey, answers, onChoiceToggle, formState }: ExamChoiceFieldProps) {
  const selected = Array.isArray(answers[fieldKey]) ? answers[fieldKey] as string[] : []
  return (
    <fieldset className='space-y-4'>
      <legend className='text-sm font-semibold text-zinc-800'>{field.label}</legend>
      {field.groups.map((group) => (
        <div key={group.id} className='overflow-hidden rounded-xl border border-zinc-200'>
          <h3 className='border-b border-zinc-100 bg-zinc-50 px-4 py-3 text-xs font-semibold tracking-wide text-zinc-600'>{group.label}</h3>
          <div className='grid gap-1 p-2 sm:grid-cols-2'>
            {group.options.map((option) => <Checkbox key={option.id} label={option.label} checked={selected.includes(option.id)} onChange={() => onChoiceToggle(fieldKey, option.id)} />)}
          </div>
        </div>
      ))}
      <FieldError name={fieldKey} formState={formState} />
    </fieldset>
  )
}
