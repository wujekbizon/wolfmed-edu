/**
 * Formats a date as YYYY-MM-DD in the user's local timezone, for
 * <input type="date"> values — toISOString would shift the date around
 * midnight for non-UTC users.
 */
export function toLocalDateInputValue(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
