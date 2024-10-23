'use server'

import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export async function createCheckoutSession(formData: FormData) {
  const { userId } = await auth()
  if (!userId) {
    redirect('/sign-in')
  }

  const productId = formData.get('productId') as string
  if (!productId) {
    return { error: 'Product ID is required' }
  }

  let priceId: string | undefined
  if (productId === 'premium') {
    priceId = process.env.STRIPE_PRICE_ID
  } else if (productId === 'basic') {
    priceId = process.env.STRIPE_BASIC_PRICE_ID
  }

  if (!priceId) {
    return { error: 'Invalid product ID' }
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
