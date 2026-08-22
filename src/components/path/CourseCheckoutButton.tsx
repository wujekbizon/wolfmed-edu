'use client'

import { useActionState } from 'react'
import { createCheckoutSession } from '@/actions/stripe'
import { changeSubscriptionPlan } from '@/actions/subscriptionPlanChange'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { useToastMessage } from '@/hooks/useToastMessage'
import SubmitButton from '@/components/SubmitButton'
import FormError from '@/components/FormError'
import type { PaymentOfferKey, PricingOfferStatus } from '@/types/paymentTypes'

export default function CourseCheckoutButton({
  offerKey,
  offerStatus = 'available',
  label = 'Uzyskaj dostęp do kursu',
}: {
  offerKey: PaymentOfferKey
  offerStatus?: PricingOfferStatus
  label?: string
}) {
  const serverAction = offerStatus === 'portal_upgrade'
    ? changeSubscriptionPlan
    : createCheckoutSession
  const [state, action] = useActionState(serverAction, EMPTY_FORM_STATE)
  const noScriptFallback = useToastMessage(state)

  return (
    <form action={action} className='w-full max-w-xs'>
      {noScriptFallback}
      <FormError formState={state} />
      <input type='hidden' name='offerKey' value={offerKey} />
      <SubmitButton
        label={label}
        loading={offerStatus === 'portal_upgrade'
          ? 'Otwieranie Stripe...'
          : 'Przekierowywanie...'}
        variant='cta'
        size='lg'
        shape='pill'
      />
    </form>
  )
}
