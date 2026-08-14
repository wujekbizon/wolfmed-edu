'use server'

import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { PAYMENT_OFFERS } from '@/constants/paymentOffers'
import { fromErrorToFormState, toFormState } from '@/helpers/toFormState'
import { checkRateLimit } from '@/lib/rateLimit'
import { startCheckout } from '@/server/payments/startCheckout'
import { createBillingPortal } from '@/server/payments/createBillingPortal'
import { CreateCheckoutSchema } from '@/server/schema'
import type { FormState } from '@/types/actionTypes'

export async function createCheckoutSession(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const { userId } = await auth()
  const validation = CreateCheckoutSchema.safeParse({
    offerKey: formData.get('offerKey'),
  })

  if (!userId) {
    const returnPath = validation.success
      ? `/kierunki/${PAYMENT_OFFERS[validation.data.offerKey].courseSlug}`
      : '/kierunki'
    redirect(`/sign-in?redirect_url=${encodeURIComponent(returnPath)}`)
  }

  if (!validation.success) return fromErrorToFormState(validation.error)

  const rateLimit = await checkRateLimit(userId, 'stripe:checkout')
  if (!rateLimit.success) {
    return toFormState('ERROR', 'Zbyt wiele prób płatności. Spróbuj ponownie później.')
  }

  let redirectUrl: string | null = null
  try {
    const result = await startCheckout(userId, validation.data.offerKey)
    if (result.status === 'ALREADY_OWNED') {
      return toFormState('ERROR', 'Masz już ten dostęp.')
    }
    if (result.status === 'NOT_ELIGIBLE') {
      return toFormState('ERROR', 'Ta oferta aktualizacji nie jest dostępna.')
    }
    if (result.status === 'MODEL_CONFLICT') {
      return toFormState('ERROR', 'Najpierw zakończ subskrypcję tego kierunku.')
    }
    if (result.status === 'UPGRADE_REQUIRED') {
      return toFormState('ERROR', 'Skorzystaj z ceny aktualizacji do Premium.')
    }
    if (result.status === 'ACTIVE_CONFLICT') {
      return toFormState('ERROR', 'Dokończ lub anuluj rozpoczętą płatność.')
    }
    if (result.status === 'COMPLETED') {
      return toFormState('ERROR', 'Ta płatność została już zakończona.')
    }
    redirectUrl = result.url
  } catch (error) {
    console.error('Error creating Stripe checkout session:', error)
    return toFormState('ERROR', 'Nie udało się rozpocząć płatności. Spróbuj ponownie.')
  }

  redirect(redirectUrl!)
}

export async function createBillingPortalSession(
  _prevState: FormState,
  _formData: FormData
): Promise<FormState> {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in?redirect_url=%2Fpanel%2Fustawienia')

  const rateLimit = await checkRateLimit(userId, 'stripe:portal')
  if (!rateLimit.success) {
    return toFormState('ERROR', 'Zbyt wiele prób. Spróbuj ponownie później.')
  }

  let redirectUrl: string | null = null
  try {
    redirectUrl = await createBillingPortal(userId)
    if (!redirectUrl) return toFormState('ERROR', 'Brak subskrypcji do zarządzania.')
  } catch (error) {
    console.error('Error creating Stripe billing portal session:', error)
    return toFormState('ERROR', 'Nie udało się otworzyć ustawień płatności.')
  }
  redirect(redirectUrl)
}
