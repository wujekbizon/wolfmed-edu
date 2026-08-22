import { CHECKOUT_ORDER_TTL_MS } from '@/constants/checkout'

export function getCheckoutOrderExpiry(now = new Date()): Date {
  return new Date(now.getTime() + CHECKOUT_ORDER_TTL_MS)
}
