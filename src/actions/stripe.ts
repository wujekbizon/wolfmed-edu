'use server'

import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export async function createCheckoutSession() {
  const { userId } = auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/stripe/create-checkout-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId }),
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

export async function createPortalSession(formData: FormData) {
  const { userId } = auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const sessionId = formData.get('session_id')

  if (!sessionId) {
    throw new Error('No session ID provided')
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/stripe/create-portal-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sessionId, userId }),
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
