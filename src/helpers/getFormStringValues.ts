import type { FormState } from '@/types/actionTypes'

export function getFormStringValues(formData: FormData): NonNullable<FormState['values']> {
  const values: NonNullable<FormState['values']> = {}

  formData.forEach((value, key) => {
    if (typeof value === 'string') values[key] = value
  })

  return values
}
