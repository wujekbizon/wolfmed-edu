import { NextResponse } from 'next/server'
import stripe from '@/lib/stripeClient'

export async function POST(req: Request) {
  const { userId, priceId } = await req.json()

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
  }

  if (!priceId) {
    return NextResponse.json({ error: 'Price ID is required' }, { status: 400 })
  }

  try {
    const session = await stripe.checkout.sessions.create({
      billing_address_collection: 'auto',
      line_items: [
        {
          price: priceId as string,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/canceled`,
      client_reference_id: userId,
    })

    return NextResponse.json({ sessionUrl: session.url })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
