export function normalizeMemoryTerms(text: string): string[] {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/ł/g, 'l').match(/[a-z]+/g) ?? []
}
