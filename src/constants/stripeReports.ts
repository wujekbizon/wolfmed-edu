export const STRIPE_REPORT_TIMEZONE = 'Europe/Warsaw'
export const STRIPE_REPORT_STALE_TIME = 5 * 60 * 1000
export const STRIPE_REPORT_REQUEST_OPTIONS = { timeout: 15_000, maxNetworkRetries: 2 }
export const STRIPE_REPORT_HEADERS = { 'Cache-Control': 'private, no-store' }
export const STRIPE_REPORT_TYPES = ['charge', 'payment', 'refund', 'payment_refund']
