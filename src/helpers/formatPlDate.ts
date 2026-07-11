/**
 * Format an ISO date string (or Date) as a short Polish date, e.g. "8.01.2027".
 */
export function formatPlDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('pl-PL')
}
