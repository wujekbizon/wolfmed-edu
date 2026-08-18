'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { PAYMENT_OFFERS } from '@/constants/paymentOffers'
import { fromErrorToFormState, toFormState } from '@/helpers/toFormState'
import { checkRateLimit } from '@/lib/rateLimit'
import { createSubscriptionUpgradePortal } from '@/server/payments/createSubscriptionUpgradePortal'
import { releaseSubscriptionPlanChange } from '@/server/payments/releaseSubscriptionPlanChange'
import { scheduleSubscriptionDowngrade } from '@/server/payments/scheduleSubscriptionDowngrade'
import { CreateCheckoutSchema } from '@/server/schema'
import type { FormState } from '@/types/actionTypes'

export async function changeSubscriptionPlan(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const { userId } = await auth()
  const validation = CreateCheckoutSchema.safeParse({ offerKey: formData.get('offerKey') })
  if (!userId) redirect('/sign-in?redirect_url=%2Fpanel%23platnosci')
  if (!validation.success) return fromErrorToFormState(validation.error)

  const rateLimit = await checkRateLimit(userId, 'stripe:portal')
  if (!rateLimit.success) return toFormState('ERROR', 'Zbyt wiele prób. Spróbuj później.')

  let redirectUrl: string | null
  try {
    const offer = PAYMENT_OFFERS[validation.data.offerKey]
    if (offer.purchaseModel !== 'subscription') {
      return toFormState('ERROR', 'Ta zmiana planu nie jest dostępna.')
    }
    if (offer.accessTier === 'basic') {
      const subscriptionId = await scheduleSubscriptionDowngrade(userId, offer.key)
      redirectUrl = subscriptionId
        ? `${process.env.NEXT_PUBLIC_APP_URL}/success?subscription_id=${encodeURIComponent(subscriptionId)}`
        : null
    } else {
      redirectUrl = await createSubscriptionUpgradePortal(userId, offer.key)
    }
    if (!redirectUrl) return toFormState('ERROR', 'Ta zmiana planu nie jest dostępna.')
  } catch (error) {
    console.error('Error changing Stripe subscription plan:', error)
    return toFormState('ERROR', 'Nie udało się zmienić planu.')
  }
  redirect(redirectUrl)
}

export async function cancelSubscriptionPlanChange(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const { userId } = await auth()
  const validation = CreateCheckoutSchema.safeParse({ offerKey: formData.get('offerKey') })
  if (!userId) redirect('/sign-in?redirect_url=%2Fpanel%23platnosci')
  if (!validation.success) return fromErrorToFormState(validation.error)

  const rateLimit = await checkRateLimit(userId, 'stripe:portal')
  if (!rateLimit.success) return toFormState('ERROR', 'Zbyt wiele prób. Spróbuj później.')

  try {
    const released = await releaseSubscriptionPlanChange(userId, validation.data.offerKey)
    if (!released) return toFormState('ERROR', 'Zaplanowana zmiana nie jest już aktywna.')
    const courseSlug = PAYMENT_OFFERS[validation.data.offerKey].courseSlug
    revalidatePath(`/kierunki/${courseSlug}`)
    revalidatePath('/panel')
    return toFormState('SUCCESS', 'Zaplanowana zmiana została anulowana.')
  } catch (error) {
    console.error('Error canceling Stripe subscription plan change:', error)
    return toFormState('ERROR', 'Nie udało się anulować zmiany planu.')
  }
}
