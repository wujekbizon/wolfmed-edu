export function isSubscriptionPaymentOverdue(status: string | null | undefined): boolean {
  return status === 'past_due' || status === 'unpaid'
}
