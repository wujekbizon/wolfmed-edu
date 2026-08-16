export const CHECKOUT_ORDER_TTL_MS = 24 * 60 * 60 * 1000

export const ACTIVE_CHECKOUT_ORDER_STATUSES = [
  'CREATING',
  'OPEN',
  'PROCESSING',
] as const
