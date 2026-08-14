'use server'

import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { fromErrorToFormState, toFormState } from '@/helpers/toFormState'
import { checkRateLimit } from '@/lib/rateLimit'
import { createSubscriptionUpgradePortal } from '@/server/payments/createSubscriptionUpgradePortal'
import { CreateCheckoutSchema } from '@/server/schema'
import type { FormState } from '@/types/actionTypes'

export async function createSubscriptionUpgradePortalSession(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const { userId } = await auth()
  const validation = CreateCheckoutSchema.safeParse({
    offerKey: formData.get('offerKey'),
  })
  if (!userId) redirect('/sign-in?redirect_url=%2Fpanel%2Fustawienia%23platnosci')
  if (!validation.success) return fromErrorToFormState(validation.error)

  const rateLimit = await checkRateLimit(userId, 'stripe:portal')
  if (!rateLimit.success) {
    return toFormState('ERROR', 'Zbyt wiele prób. Spróbuj ponownie później.')
  }

  let redirectUrl: string | null = null
  try {
    redirectUrl = await createSubscriptionUpgradePortal(
      userId,
      validation.data.offerKey
    )
    if (!redirectUrl) {
      return toFormState('ERROR', 'Ta zmiana planu nie jest dostępna.')
    }
  } catch (error) {
    console.error('Error creating Stripe subscription upgrade session:', error)
    return toFormState('ERROR', 'Nie udało się otworzyć zmiany planu.')
  }
  redirect(redirectUrl)
}
