'use server'

import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import stripe from '@/lib/stripeClient'
import { getOrCreateStripeCustomer } from '@/server/stripe'
import { fromErrorToFormState, toFormState } from '@/helpers/toFormState'
import { FormState } from '@/types/actionTypes'
import { CreateCheckoutSchema } from '@/server/schema'
import { PAYMENT_OFFERS } from '@/constants/paymentOffers'
import { checkRateLimit } from '@/lib/rateLimit'
import { getVerifiedStripeOffer } from '@/server/stripeOffer'

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

  if (!validation.success) {
    return fromErrorToFormState(validation.error)
  }

  const rateLimit = await checkRateLimit(userId, 'stripe:checkout')
  if (!rateLimit.success) {
    return toFormState('ERROR', 'Zbyt wiele prób płatności. Spróbuj ponownie później.')
  }

  let redirectUrl: string | null = null

  try {
    const offer = await getVerifiedStripeOffer(validation.data.offerKey)
    const customerId = await getOrCreateStripeCustomer(userId)
    const cancelUrl = new URL('/canceled', process.env.NEXT_PUBLIC_APP_URL)
    cancelUrl.searchParams.set('course', offer.courseSlug)

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_update: { address: 'auto', name: 'auto' },
      billing_address_collection: 'required',
      name_collection: { individual: { enabled: true, optional: false } },
      tax_id_collection: { enabled: true, required: 'never' },
      invoice_creation: { enabled: true },
      locale: 'pl',
      line_items: [
        {
          price: offer.priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl.toString(),
      client_reference_id: userId,
      metadata: {
        offerKey: offer.key,
        courseSlug: offer.courseSlug,
        accessTier: offer.accessTier,
      },
      payment_intent_data: {
        metadata: { offerKey: offer.key },
      },
    })

    if (!session.url) {
      return toFormState('ERROR', 'Nie udało się utworzyć sesji płatności')
    }

    redirectUrl = session.url
  } catch (error) {
    console.error('Error creating Stripe checkout session:', error)
    return toFormState('ERROR', 'Nie udało się rozpocząć płatności. Spróbuj ponownie.')
  }
  redirect(redirectUrl!)
}
