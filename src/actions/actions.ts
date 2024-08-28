import { toFormState } from '@/helpers/toFormState'
import { FormState } from '@/types/actionTypes'
import { redirect } from 'next/navigation'

export async function submitTestAction(formState: FormState, formData: FormData) {
  console.log(formData)
  // Update form state and redirect on success and redirect user to result page
  return toFormState('SUCCESS', 'Test Successfully Submitted!')
  // redirect('/testy-opiekun/wyniki')
}
