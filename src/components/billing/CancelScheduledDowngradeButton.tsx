'use client'

import { useActionState, useRef } from 'react'
import { cancelSubscriptionPlanChange } from '@/actions/subscriptionPlanChange'
import FormError from '@/components/FormError'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { useToastMessage } from '@/hooks/useToastMessage'
import { useConfirmModalStore } from '@/store/useConfirmModalStore'
import type { PaymentOfferKey } from '@/types/paymentTypes'

export default function CancelScheduledDowngradeButton({
  offerKey,
}: {
  offerKey: PaymentOfferKey
}) {
  const formRef = useRef<HTMLFormElement>(null)
  const [state, action, pending] = useActionState(
    cancelSubscriptionPlanChange,
    EMPTY_FORM_STATE
  )
  const openConfirmModal = useConfirmModalStore((store) => store.openConfirmModal)
  const noScriptFallback = useToastMessage(state)

  return (
    <form ref={formRef} action={action} className="mt-3">
      {noScriptFallback}
      <FormError formState={state} />
      <input type="hidden" name="offerKey" value={offerKey} />
      <button
        type="button"
        disabled={pending}
        onClick={() => openConfirmModal({
          title: 'Anulować zmianę planu?',
          message: 'Pozostaniesz przy planie Premium i jego obecnej cenie.',
          confirmLabel: 'Pozostań przy Premium',
          onConfirm: () => formRef.current?.requestSubmit(),
        })}
        className="text-sm font-semibold text-amber-950 underline underline-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? 'Anulowanie...' : 'Anuluj zmianę'}
      </button>
      <noscript>
        <button type="submit" className="text-sm font-semibold text-amber-950 underline">
          Anuluj zmianę
        </button>
      </noscript>
    </form>
  )
}
