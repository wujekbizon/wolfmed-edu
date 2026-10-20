'use client'

import { useActionState } from 'react'
import { createBillingPortalSession, createCheckoutSession } from '@/actions/stripe'
import { changeSubscriptionPlan } from '@/actions/subscriptionPlanChange'
import { PRICING_OFFER_STATUS_LABELS } from '@/constants/pricingOfferStatusLabels'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import SubmitButton from './SubmitButton'
import FormError from './FormError'
import CoursePricingDetails from './pricing/CoursePricingDetails'
import CoursePricingPlanNotice from './pricing/CoursePricingPlanNotice'
import { useToastMessage } from '@/hooks/useToastMessage'
import type { CoursePricingCardProps } from '@/types/paymentTypes'

export default function CoursePricingCard({
  tierName,
  price,
  originalPrice,
  offerKey,
  features,
  isPremium = false,
  badge,
  offerStatus,
  purchaseLabel,
  subscriptionPlanChange,
}: CoursePricingCardProps) {
  const serverAction = offerStatus === 'payment_required'
    ? createBillingPortalSession
    : offerStatus === 'portal_upgrade' || offerStatus === 'downgrade_available'
      ? changeSubscriptionPlan
      : createCheckoutSession
  const [state, action] = useActionState(serverAction, EMPTY_FORM_STATE)
  const noScriptFallback = useToastMessage(state)
  const label = offerStatus === 'available' && purchaseLabel
    ? purchaseLabel
    : PRICING_OFFER_STATUS_LABELS[offerStatus]
  const enabledStatuses = ['available', 'portal_upgrade', 'downgrade_available', 'payment_required']
  const disabled = !enabledStatuses.includes(offerStatus)

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
          {...(originalPrice ? { originalPrice } : {})}
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
              disabled={disabled}
              className={isPremium
                ? 'bg-slate-900 text-white hover:bg-slate-800'
                : 'bg-slate-700 text-white hover:bg-slate-800'}
            />
          </form>
          <CoursePricingPlanNotice
            offerStatus={offerStatus}
            subscriptionPlanChange={subscriptionPlanChange ?? null}
          />
        </div>
      </div>
    </article>
  )
}
