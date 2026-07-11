/**
 * Reduce an ISO date-time string to the `yyyy-mm-dd` value an `<input type="date">`
 * expects, e.g. "2027-01-08T00:00:00Z" → "2027-01-08".
 */
export function toDateInputValue(dateISO: string): string {
  return dateISO.split('T')[0] || ''
}
