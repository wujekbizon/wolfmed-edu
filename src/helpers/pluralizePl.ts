/**
 * Polish nouns take three plural forms depending on the count, e.g.
 * 1 pytanie / 2 pytania / 5 pytań. Pass the forms as [one, few, many].
 */
export function pluralizePl(count: number, forms: [string, string, string]): string {
  const [one, few, many] = forms
  const mod10 = count % 10
  const mod100 = count % 100

  if (count === 1) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few
  return many
}
