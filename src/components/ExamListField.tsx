import Input from '@/components/ui/Input'
import FieldError from '@/components/FieldError'
import { EXAM_INPUT_CLASS } from '@/constants/examFormStyles'
import type { ExamListFieldProps } from '@/types/practicalExamWorkspaceTypes'

export default function ExamListField({ field, fieldKey, inputId, answers, onListLineChange, formState }: ExamListFieldProps) {
  const values = Array.isArray(answers[fieldKey]) ? answers[fieldKey] as string[] : []
  return (
    <fieldset className='space-y-3'>
      <legend className='text-sm font-semibold leading-relaxed text-zinc-800'>{field.label}</legend>
      {Array.from({ length: field.lines }).map((_, line) => (
        <div key={line} className='flex items-center gap-3'>
          <span aria-hidden='true' className='flex size-6 shrink-0 items-center justify-center rounded-full bg-[#f3edf8] text-xs font-semibold text-[#765086]'>{line + 1}</span>
          <Input id={`${inputId}-${line}`} type='text' value={values[line] ?? ''} ariaLabel={`${field.label} — ${line + 1}`} onChangeHandler={(event) => onListLineChange(fieldKey, line, event.target.value)} className={EXAM_INPUT_CLASS} />
        </div>
      ))}
      <FieldError name={fieldKey} formState={formState} />
    </fieldset>
  )
}
