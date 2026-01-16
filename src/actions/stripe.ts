'use server'

import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export async function createCheckoutSession(formData: FormData): Promise<void> {
  const { userId } = await auth()
  if (!userId) {
    redirect('/sign-in')
  }

  const productId = formData.get('productId') as string
  const priceId = formData.get('priceId') as string
  const courseSlug = formData.get('courseSlug') as string
  const accessTier = formData.get('accessTier') as string

  if (!priceId) {
    throw new Error('Price ID is required')
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/stripe/create-checkout-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId,
      priceId,
      courseSlug: courseSlug || '',
      accessTier: accessTier || 'basic'
    }),
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const { sessionUrl } = await response.json()

  if (!sessionUrl) {
    throw new Error('No session URL returned from the server')
  }

  redirect(sessionUrl)
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

  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/stripe/create-checkout-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId, priceId }),
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const { sessionUrl } = await response.json()

  if (!sessionUrl) {
    throw new Error('No session URL returned from the server')
  }

  redirect(sessionUrl)
}
