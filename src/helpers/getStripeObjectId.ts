export function getStripeObjectId(
  value: string | { id: string } | null
): string | null {
  return typeof value === 'string' ? value : value?.id ?? null
}
