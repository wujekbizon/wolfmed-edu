import Input from '@/components/ui/Input'
import FieldError from '@/components/FieldError'
import Label from '@/components/ui/Label'
import { EXAM_INPUT_CLASS } from '@/constants/examFormStyles'
import type { ExamValueFieldProps } from '@/types/practicalExamWorkspaceTypes'

export default function ExamValueField({ field, fieldKey, inputId, answers, onValueChange, formState }: ExamValueFieldProps) {
  const value = typeof answers[fieldKey] === 'string' ? answers[fieldKey] as string : ''
  return (
    <div className='space-y-2'>
      <Label htmlFor={inputId} label={field.label} className='text-sm font-semibold text-zinc-800' />
      <div className='flex items-center gap-2'>
        <Input id={inputId} type='text' value={value} onChangeHandler={(event) => onValueChange(fieldKey, event.target.value)} inputMode={field.match === 'number' ? 'numeric' : 'text'} className={EXAM_INPUT_CLASS} />
        {field.unit && <span className='shrink-0 text-sm text-zinc-500'>{field.unit}</span>}
      </div>
      <FieldError name={fieldKey} formState={formState} />
    </div>
  )
}
