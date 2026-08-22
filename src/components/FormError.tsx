import type { FormState } from '@/types/actionTypes'

export default function FormError({ formState }: { formState: FormState }) {
  if (formState.status !== 'ERROR') return null

  const message = Object.values(formState.fieldErrors)
    .flat()
    .find((error): error is string => Boolean(error))

  if (!message) return null

  return <p className="text-xs text-red-500">{message}</p>
}
