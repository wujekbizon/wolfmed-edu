export function getMemoryQueryWords(query: string): string[] {
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 3)
    .slice(0, 6)
}
