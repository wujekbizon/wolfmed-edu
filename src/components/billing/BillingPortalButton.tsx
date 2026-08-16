'use client'

import { useActionState } from 'react'
import { createBillingPortalSession } from '@/actions/stripe'
import FormError from '@/components/FormError'
import SubmitButton from '@/components/SubmitButton'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { useToastMessage } from '@/hooks/useToastMessage'

export default function BillingPortalButton() {
  const [state, action] = useActionState(createBillingPortalSession, EMPTY_FORM_STATE)
  const noScriptFallback = useToastMessage(state)

  return (
    <form action={action} className="mt-4">
      {noScriptFallback}
      <FormError formState={state} />
      <SubmitButton label="Zarządzaj subskrypcją" loading="Otwieranie..." />
    </form>
  )
}
