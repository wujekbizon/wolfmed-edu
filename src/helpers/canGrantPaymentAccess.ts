export function canGrantPaymentAccess(
  userId: string | null,
  ownerDeletedAt: Date | null
): userId is string {
  return Boolean(userId && !ownerDeletedAt)
}
