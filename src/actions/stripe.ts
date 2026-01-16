'use server'

import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import stripe from '@/lib/stripeClient'
import { fromErrorToFormState, toFormState } from '@/helpers/toFormState'
import { FormState } from '@/types/actionTypes'

export async function createCheckoutSession(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    const { userId } = await auth()
    if (!userId) {
      redirect('/sign-in')
    }

    const priceId = formData.get('priceId') as string
    const courseSlug = formData.get('courseSlug') as string
    const accessTier = formData.get('accessTier') as string

    if (!priceId) {
      return toFormState('ERROR', 'Brak ID ceny produktu')
    }

    const session = await stripe.checkout.sessions.create({
      billing_address_collection: 'auto',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/canceled`,
      client_reference_id: userId,
      metadata: {
        courseSlug: courseSlug || '',
        accessTier: accessTier || 'basic',
      },
    })

    if (!session.url) {
      return toFormState('ERROR', 'Nie udało się utworzyć sesji płatności')
    }

    redirect(session.url)
  } catch (error) {
    console.error('Error creating Stripe checkout session:', error)
    return fromErrorToFormState(error)
  }
}

// Legacy support for old /wsparcie-projektu page
export async function createCheckoutSessionLegacy(formData: FormData): Promise<void> {
  const { userId } = await auth()
  if (!userId) {
    redirect('/sign-in')
  }

  const productId = formData.get('productId') as string
  if (!productId) {
    throw new Error('Product ID is required')
  }

  let priceId: string | undefined
  if (productId === 'premium') {
    priceId = process.env.STRIPE_PRICE_ID
  } else if (productId === 'basic') {
    priceId = process.env.STRIPE_BASIC_PRICE_ID
  }

  if (!priceId) {
    throw new Error('Invalid product ID')
  }

  try {
    const session = await stripe.checkout.sessions.create({
      billing_address_collection: 'auto',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/canceled`,
      client_reference_id: userId,
    })

    if (!session.url) {
      throw new Error('No session URL returned from Stripe')
    }

    redirect(session.url)
  } catch (error) {
    console.error('Error creating Stripe checkout session:', error)
    throw error
  }
}
