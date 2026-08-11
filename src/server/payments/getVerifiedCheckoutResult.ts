import 'server-only'
import { isStripeInvalidRequestError } from '@/helpers/isStripeInvalidRequestError'
import { resolveCheckoutResultStatus } from '@/helpers/resolveCheckoutResultStatus'
import { getCheckoutFulfillmentContext } from '@/server/payments/getCheckoutFulfillmentContext'
import { syncCheckoutSession } from '@/server/payments/syncCheckoutSession'
import type { CheckoutResult } from '@/types/paymentTypes'

export async function getVerifiedCheckoutResult(
  currentUserId: string,
  sessionId: string
): Promise<CheckoutResult> {
  try {
    const context = await getCheckoutFulfillmentContext(sessionId)
    const status = resolveCheckoutResultStatus({
      currentUserId,
      checkoutUserId: context.userId,
      paymentStatus: context.snapshot.paymentStatus,
      sessionStatus: context.snapshot.status,
      orderStatus: context.orderStatus,
    })

    if (status === 'invalid') return { status }

    if (status !== 'failed') {
      const resultId = `success:${sessionId}:${context.snapshot.paymentStatus}`
      await syncCheckoutSession(resultId, 'checkout.session.completed', context)
    }

    return {
      status,
      courseSlug: context.courseSlug,
      accessTier: context.accessTier,
    }
  } catch (error) {
    if (isStripeInvalidRequestError(error)) return { status: 'invalid' }
    console.error(`Checkout result verification failed for ${sessionId}:`, error)
    return { status: 'unavailable' }
  }
}
