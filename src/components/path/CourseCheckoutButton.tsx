'use client'

import { useActionState } from 'react'
import { createCheckoutSession } from '@/actions/stripe'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { useToastMessage } from '@/hooks/useToastMessage'
import SubmitButton from '@/components/SubmitButton'
import FormError from '@/components/FormError'
import type { PaymentOfferKey } from '@/types/paymentTypes'

export default function CourseCheckoutButton({
  offerKey
}: {
  offerKey: PaymentOfferKey
}) {
  const [state, action] = useActionState(createCheckoutSession, EMPTY_FORM_STATE)
  const noScriptFallback = useToastMessage(state)

  return (
    <form action={action} className='w-full max-w-xs'>
      {noScriptFallback}
      <FormError formState={state} />
      <input type='hidden' name='offerKey' value={offerKey} />
      <SubmitButton
        label='Uzyskaj dostęp do kursu'
        loading='Przekierowywanie...'
        variant='cta'
        size='lg'
        shape='pill'
      />
    </form>
  )
}
