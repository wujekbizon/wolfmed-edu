import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import stripe from '@/lib/stripeClient'
import Stripe from 'stripe'
import { insertPayment, processPurchaseRewards } from '@/server/db'
import { enrollUserAction } from '@/actions/course-actions'
import { clerkClient } from '@clerk/nextjs/server'
import { db } from '@/server/db/index'
import { eq } from 'drizzle-orm'
import { processedEvents } from '@/server/db/schema'

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: Request) {
  const body = await req.text()
  const headerPayload = await headers()
  const sig = headerPayload.get('stripe-signature')

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig!, endpointSecret)
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed':
      const {
        client_reference_id,
        id,
        amount_total,
        currency,
        customer_details,
        payment_status,
        created,
        mode,
        metadata,
      } = event.data.object as Stripe.Checkout.Session

      // Idempotency check
      const existingEvent = await db
        .select()
        .from(processedEvents)
        .where(eq(processedEvents.eventId, event.id))
        .limit(1)

      if (existingEvent.length > 0) {
        console.log(`Event ${event.id} already processed`)
        break
      }

      const courseSlug = metadata?.courseSlug
      const accessTier = metadata?.accessTier || 'basic'

      // Resolve userId — fallback to Clerk email lookup when client_reference_id is absent
      let resolvedUserId: string | null = client_reference_id
      if (!resolvedUserId && customer_details?.email) {
        try {
          const clerkRes = await fetch(
            `https://api.clerk.com/v1/users?email_address=${encodeURIComponent(customer_details.email)}`,
            { headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` } }
          )
          if (clerkRes.ok) {
            const clerkUsers = await clerkRes.json()
            resolvedUserId = clerkUsers?.[0]?.id ?? null
          }
        } catch (err) {
          console.error('Clerk email lookup failed:', err)
        }
      }

      if (!resolvedUserId) {
        console.error('checkout.session.completed: cannot resolve userId for', customer_details?.email)
        break
      }

      if (mode === 'payment') {
        try {
          await insertPayment({
            userId: resolvedUserId,
            amountTotal: amount_total!,
            currency: currency! as 'pln' | 'usd' | 'eur' | null,
            customerEmail: customer_details?.email!,
            courseSlug: courseSlug || null,
            createdAt: new Date(created * 1000),
            paymentStatus: payment_status,
          })
        } catch (err) {
          console.error('insertPayment failed:', err)
        }
      }

      if (courseSlug && payment_status === 'paid') {
        try {
          await enrollUserAction(resolvedUserId, courseSlug, accessTier)

          const clerk = await clerkClient()
          const user = await clerk.users.getUser(resolvedUserId)
          const currentCourses = (user.publicMetadata?.ownedCourses as string[]) || []

          if (!currentCourses.includes(courseSlug)) {
            await clerk.users.updateUser(resolvedUserId, {
              publicMetadata: {
                ...user.publicMetadata,
                ownedCourses: [...currentCourses, courseSlug],
              },
            })
          }

          console.log(`User ${resolvedUserId} enrolled in ${courseSlug}`)
        } catch (error) {
          console.error('Error enrolling user in course:', error)
        }
      }

      await processPurchaseRewards(resolvedUserId, event.id)

      break

    case 'charge.succeeded':
      // Reserved for future refund/chargeback handling
      break

    default:
      console.log(`Unhandled event type ${event.type}`)
  }

  return NextResponse.json({ received: true }, { status: 200 })
}
