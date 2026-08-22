import type { ZodError } from 'zod'
import type { FormState } from '@/types/actionTypes'

export function getCreateTestFieldErrors(error: ZodError): FormState['fieldErrors'] {
  const fieldErrors: FormState['fieldErrors'] = {}

  for (const issue of error.issues) {
    const [field, index, nestedField] = issue.path
    const name = field === 'answers' && typeof index === 'number' && nestedField === 'option'
      ? `option${index + 1}`
      : typeof field === 'string'
        ? field
        : 'form'

    fieldErrors[name] = [...(fieldErrors[name] ?? []), issue.message]
  }

  return fieldErrors
}
