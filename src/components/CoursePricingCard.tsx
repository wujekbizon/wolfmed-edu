'use client'

import { useActionState } from 'react'
import { createCheckoutSession } from '@/actions/stripe'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import SubmitButton from './SubmitButton'
import FormError from './FormError'
import CoursePricingDetails from './pricing/CoursePricingDetails'
import { useToastMessage } from '@/hooks/useToastMessage'
import type { CoursePricingCardProps } from '@/types/paymentTypes'

export default function CoursePricingCard({
  tierName,
  price,
  offerKey,
  features,
  isPremium = false,
  badge,
  alreadyOwned,
}: CoursePricingCardProps) {
  const [state, action] = useActionState(createCheckoutSession, EMPTY_FORM_STATE)
  const noScriptFallback = useToastMessage(state)
  const label = alreadyOwned ? 'W posiadaniu' : 'Kup teraz'

  return (
    <article className="h-full">
      <div
        className={`h-full min-h-[480px] md:min-h-[560px] flex flex-col rounded-3xl p-6 sm:p-8 md:p-10 transition-all duration-300 ${
          isPremium
            ? 'bg-white ring-2 ring-slate-900/10 shadow-xl hover:shadow-2xl hover:-translate-y-1'
            : 'bg-white ring-1 ring-zinc-200 shadow-sm hover:shadow-md hover:-translate-y-0.5'
        }`}
      >
        <CoursePricingDetails
          tierName={tierName}
          price={price}
          features={features}
          isPremium={isPremium}
          {...(badge ? { badge } : {})}
        />
        <div className="mt-auto w-full pt-6 md:pt-8">
          <form action={action}>
            {noScriptFallback}
            <FormError formState={state} />
            <input type="hidden" name="offerKey" value={offerKey} />
            <SubmitButton
              label={label}
              loading="Przekierowywanie..."
              disabled={Boolean(alreadyOwned)}
              className={isPremium
                ? 'bg-slate-900 text-white hover:bg-slate-800'
                : 'bg-slate-700 text-white hover:bg-slate-800'}
            />
          </form>
        </div>
      </div>
    </article>
  )
}
