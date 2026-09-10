import { randomBytes } from 'node:crypto'
import type { StripeReportPdfSecurity } from '@/types/stripeReportTypes'

export function createStripeReportPdfSecurity(): StripeReportPdfSecurity {
  return {
    userPassword: randomBytes(18).toString('base64url'),
    ownerPassword: randomBytes(32).toString('base64url'),
  }
}
