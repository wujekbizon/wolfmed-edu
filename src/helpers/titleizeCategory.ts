/**
 * Turn a category key into a display label, e.g.
 * "biochemia-biofizyka" → "Biochemia Biofizyka".
 */
export function titleizeCategory(key: string): string {
  return key
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}
